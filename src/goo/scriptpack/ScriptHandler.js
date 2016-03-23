define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/scripts/OrbitCamControlScript',
	'goo/scriptpack/OrbitNPanControlScript',
	'goo/scriptpack/FlyControlScript',
	'goo/scriptpack/WasdControlScript',
	'goo/scriptpack/BasicControlScript',
	'goo/util/PromiseUtils',
	'goo/util/ObjectUtils',
	'goo/util/ArrayUtils',
	'goo/entities/SystemBus',

	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts'
], function (
	ConfigHandler,
	RSVP,
	OrbitCamControlScript,
	OrbitNPanControlScript,
	FlyControlScript,
	WasdControlScript,
	BasicControlScript,
	PromiseUtils,
	_,
	ArrayUtils,
	SystemBus,

	ScriptUtils,
	Scripts
) {
	'use strict';

	var DEPENDENCY_LOAD_TIMEOUT = 6000;

	/**
	* 	* @private
	*/
	function ScriptHandler() {
		ConfigHandler.apply(this, arguments);
		this._scriptElementsByURL = new Map();
		this._bodyCache = {};
		this._dependencyPromises = {};
		this._currentScriptLoading = null;
		this._addGlobalErrorListener();
	}

	ScriptHandler.prototype = Object.create(ConfigHandler.prototype);
	ScriptHandler.prototype.constructor = ScriptHandler;
	ConfigHandler._registerClass('script', ScriptHandler);

	/**
	 * Creates a script data wrapper object to be used in the engine
	 */
	ScriptHandler.prototype._create = function () {
		return {
			externals: {},
			setup: null,
			update: null,
			run: null,
			cleanup: null,
			parameters: {},
			name: null
		};
	};


	/**
	 * Remove this script from the cache, and runs the cleanup method of the script.
	 * @param {string} ref the script guid
	 */
	ScriptHandler.prototype._remove = function (ref) {
		var script = this._objects.get(ref);
		if (script && script.cleanup && script.context) {
			try {
				script.cleanup(script.parameters, script.context, window.goo);
			} catch (e) {
				// Some cleanup error
			}
		}
		this._objects.delete(ref);
		delete this._bodyCache[ref];
	};

	var updateId = 1; // Ugly hack to prevent devtools from not updating its scripts

	/**
	 * Update a user-defined script (not a script available in the engine).
	 * If the new body (in the data model config) differs from the cached body,
	 * the script will be reloaded (by means of a script tag).
	 *
	 * @param {Object} script the cached engine script object
	 * @param {Object} config the data model config
	 */
	ScriptHandler.prototype._updateFromCustom = function (script, config) {
		// No change, do nothing
		if (this._bodyCache[config.id] === config.body) { return script; }

		delete script.errors;
		this._bodyCache[config.id] = config.body;

		// delete the old script tag and add a new one
		var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + config.id);
		if (oldScriptElement) {
			oldScriptElement.parentNode.removeChild(oldScriptElement);
		}

		// create this script collection if it does not exist yet
		if (!window._gooScriptFactories) {
			// this holds script factories in 'compiled' form
			window._gooScriptFactories = {};
		}


		// get a script factory in string form
		var scriptFactoryStr = [
			'//# sourceURL=goo://goo-custom-scripts/' + encodeURIComponent(config.name.replace(' ', '_')) + '.js?v=' + (updateId++),
			'',
			'// ' + config.name,
			'',
			'// <![CDATA[',
			"window._gooScriptFactories['" + config.id + "'] = function () {",
			config.body,
			' var obj = {',
			'  externals: {}',
			' };',
			' if (typeof parameters !== "undefined") {',
			'  obj.externals.parameters = parameters;',
			' }',
			' if (typeof setup !== "undefined") {',
			'  obj.setup = setup;',
			' }',
			' if (typeof cleanup !== "undefined") {',
			'  obj.cleanup = cleanup;',
			' }',
			' if (typeof update !== "undefined") {',
			'  obj.update = update;',
			' }',
			' if (typeof enter !== "undefined") {',
			'  obj.enter = enter;',
			' }',
			' if (typeof exit !== "undefined") {',
			'  obj.exit = exit;',
			' }',
			' return obj;',
			'};',
			'// ]]>'
		].join('\n');

		// create the element and add it to the page so the user can debug it
		// addition and execution of the script happens synchronously
		var newScriptElement = document.createElement('script');
		newScriptElement.id = ScriptHandler.DOM_ID_PREFIX + config.id;
		newScriptElement.innerHTML = scriptFactoryStr;
		newScriptElement.async = false;
		this._currentScriptLoading = config.id;

		var parentElement = this.world.gooRunner.renderer.domElement.parentElement || document.body;
		parentElement.appendChild(newScriptElement);

		var scriptFactory = window._gooScriptFactories[config.id];
		if (scriptFactory) {
			try {
				var newScript = scriptFactory();
				script.id = config.id;
				ScriptHandler.validateParameters(newScript, script);
				script.setup = newScript.setup;
				script.update = newScript.update;
				script.cleanup = newScript.cleanup;
				script.enter = newScript.enter;
				script.exit = newScript.exit;
				script.parameters = {};
				script.enabled = false;
			} catch (e) {
				var err = {
					message: e.toString()
				};
				// TODO Test if this works across browsers
				/**/
				if (e instanceof Error) {
					var lineNumbers = e.stack.split('\n')[1].match(/(\d+):\d+\)$/);
					if (lineNumbers) {
						err.line = parseInt(lineNumbers[1], 10) - 1;
					}
				}
				/**/
				setError(script, err);
			}
			this._currentScriptLoading = null;
		}
		// generate names from external variable names
		if (script.externals) {
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};

	/**
	 * Adds a reference pointing to the specified custom script into the specified
	 * script element/node.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element into which a reference is to be added.
	 * @param {string} scriptId
	 *		The identifier of the custom script whose reference is to be added.
	 */
	function addReference(scriptElement, scriptId) {
		if (!scriptElement.scriptRefs) {
			scriptElement.scriptRefs = [scriptId];
			return;
		}

		var index = scriptElement.scriptRefs.indexOf(scriptId);
		if (index === -1) {
			scriptElement.scriptRefs.push(scriptId);
		}
	}


	/**
	 * Removes a reference to the specified custom script from the specified
	 * script element/node.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element from which the reference is to be removed.
	 * @param {string} scriptId
	 *		The identifier of the custom script whose reference is to be removed.
	 */
	function removeReference(scriptElement, scriptId) {
		if (!scriptElement.scriptRefs) {
			return;
		}

		ArrayUtils.remove(scriptElement.scriptRefs, scriptId);
	}

	/**
	 * Gets whether the specified script element/node has any references to
	 * custom scripts.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element which is to be checked for references.
	 *
	 * @returns {boolean}
	 */
	function hasReferences(scriptElement) {
		return scriptElement.scriptRefs && scriptElement.scriptRefs.length > 0;
	}


	/**
	 * Gets whether the specified script element has a reference to the specified
	 * custom script.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element/node which is to be checked.
	 * @param {string} scriptId
	 *		The identifier of the custom script which is to be checked.
	 *
	 * @returns {boolean}
	 */
	function hasReferenceTo(scriptElement, scriptId) {
		return scriptElement.scriptRefs && scriptElement.scriptRefs.indexOf(scriptId) > -1;
	}


	/**
	 * Gets all the script elements that refer to the specified custom script.
	 *
	 * @param {string} scriptId
	 *		The identifier of the custom script whose dependencies are to be
	 *		returned.
	 *
	 * @returns {Array.<HTMLScriptElement>}
	 */
	function getReferringDependencies(scriptId) {
		var dependencies = [];
		var scriptElements = document.querySelectorAll('script');

		for (var i = 0; i < scriptElements.length; ++i) {
			var scriptElement = scriptElements[i];
			if (hasReferenceTo(scriptElement, scriptId)) {
				dependencies.push(scriptElement);
			}
		}

		return dependencies;
	}


	/**
	 * Update a script that is from the engine. Checks if the class name has changed
	 * and if so, creates a new script object from the new class.
	 * @param {Object} script needs to have a className property
	 * @param {Object} config data model config
	 * @deprecated
	 */
	ScriptHandler.prototype._updateFromClass = function (script, config) {
		if (!script.externals || script.externals.name !== config.className) {
			var newScript = Scripts.create(config.className);
			if (!newScript) {
				throw new Error('Unrecognized script name');
			}
			script.id = config.id;
			script.externals = newScript.externals;
			script.setup = newScript.setup;
			script.update = newScript.update;
			script.run = newScript.run;
			script.cleanup = newScript.cleanup;
			script.enter = newScript.enter;
			script.exit = newScript.exit;
			script.parameters = newScript.parameters || {};
			script.enabled = false;

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};

	/**
	 * Loads an external javascript lib as a dependency to this script (if it's
	 * not already loaded). If the dependency fails to load, an error is set
	 * on the script.
	 * @param {Object} script config
	 * @param {string} url location of the javascript lib
	 * @param {string} scriptId the guid of the script
	 * @returns {RSVP.Promise} a promise that resolves when the dependency is loaded
	 */
	ScriptHandler.prototype._addDependency = function (script, url, scriptId) {
		var that = this;

		// check if element already exists
		// it might have been loaded by some other script first

		// does this work if the same script component/script reference the same script more than once?
		var scriptElem = document.querySelector('script[src="' + url + '"]');
		if (scriptElem) {
			addReference(scriptElem, scriptId);
			return this._dependencyPromises[url] || PromiseUtils.resolve();
		}

		scriptElem = document.createElement('script');
		scriptElem.src = url;
		scriptElem.setAttribute('data-script-id', scriptId);
		scriptElem.isDependency = true;
		scriptElem.async = false;

		this._scriptElementsByURL.set(url, scriptElem);
		addReference(scriptElem, scriptId);

		var promise = loadExternalScript(script, scriptElem, url)
			.then(function () {
				delete that._dependencyPromises[url];
			});

		this._dependencyPromises[url] = promise;

		return promise;
	};

	ScriptHandler.prototype._update = function (ref, config, options) {
		var that = this;

		return ConfigHandler.prototype._update.call(this, ref, config, options)
		.then(function (script) {
			if (!script) { return; }

			var addDependencyPromises = [];

			if (isCustomScript(config) && config.dependencies) {
				delete script.dependencyErrors;

				// Get all the script HTML elements which refer to the current
				// script. As we add dependencies, we remove the script elements
				// which are still needed. After everything, we remove the
				// reference to the current script from the remaining ones.
				var scriptsElementsToRemove = getReferringDependencies(config.id);

				_.forEach(config.dependencies, function (dependencyConfig) {
					var url = dependencyConfig.url;

					// If the dependency being added is already loaded in a script
					// element we remove it from the array of script elements to remove
					// because we still need it.
					var neededScriptElement = ArrayUtils.find(scriptsElementsToRemove, function (scriptElement) {
						return scriptElement.src === url;
					});
					if (neededScriptElement) {
						ArrayUtils.remove(scriptsElementsToRemove, neededScriptElement);
					}

					addDependencyPromises.push(that._addDependency(script, url, config.id));
				}, null, 'sortValue');

				// Remove references to the current script from all the script
				// elements that are not needed anymore.
				_.forEach(scriptsElementsToRemove, function (scriptElement) {
					removeReference(scriptElement, config.id);
				});
			}

			var parentElement = that.world.gooRunner.renderer.domElement.parentElement || document.body;

			_.forEach(config.dependencies, function (dependency) {
				var scriptElement = that._scriptElementsByURL.get(dependency.url);
				if (scriptElement) {
					parentElement.appendChild(scriptElement);
				}
			}, null, 'sortValue');

			return RSVP.all(addDependencyPromises)
			.then(function () {
				if (isEngineScript(config)) {
					that._updateFromClass(script, config, options);
				} else if (isCustomScript(config)) {
					that._updateFromCustom(script, config, options);
				}

				// Let the world (e.g. Create) know that there are new externals so
				// that things (e.g. UI) can get updated.
				if (config.body) {
					SystemBus.emit('goo.scriptExternals', {
						id: config.id,
						externals: script.externals
					});
				}

				script.name = config.name;

				if (script.errors || script.dependencyErrors) {
					SystemBus.emit('goo.scriptError', {
						id: ref,
						errors: script.errors,
						dependencyErrors: script.dependencyErrors
					});
					return script;
				}
				else {
					SystemBus.emit('goo.scriptError', { id: ref, errors: null });
				}

				_.extend(script.parameters, config.options);

				// Remove any script HTML elements that are not needed by any
				// script.
				removeDeadScriptElements();

				return script;
			});
		});
	};

	/**
	 * Gets whether the specified configuration object refers to a built-in
	 * engine script (i.e. not a custom script).
	 *
	 * @param {object} config
	 *        The configuration object which is to be checked.
	 *
	 * @returns {Boolean}
	 */
	function isEngineScript(config) {
		return Boolean(config.className);
	}

	/**
	 * Gets whether the specified configuration object refers to a custom script
	 * script (i.e. not a built-in engine script).
	 *
	 * @param {object} config
	 *        The configuration object which is to be checked.
	 *
	 * @returns {Boolean}
	 */
	function isCustomScript(config) {
		return !isEngineScript(config) && config.body !== undefined;
	}

	/**
	 * Removes all the script HTML elements that are not needed by any script
	 * anymore (i.e. have no references to scripts).
	 */
	function removeDeadScriptElements() {
		var scriptElements = document.querySelectorAll('script');

		for (var i = 0; i < scriptElements.length; ++i) {
			var scriptElement = scriptElements[i];
			if (scriptElement.isDependency && !hasReferences(scriptElement) && scriptElement.parentNode) {
				scriptElement.parentNode.removeChild(scriptElement);
			}
		}
	}

	/**
	 * Add a global error listener that catches script errors, and tries to match
	 * them to scripts loaded with this handler. If an error is registered, the
	 * script is reset and an error message is appended to it.
	 * @private
	 *
	 */
	ScriptHandler.prototype._addGlobalErrorListener = function () {
		var that = this;
		window.addEventListener('error', function (evt) {
			if (evt.filename) {
				var scriptElem = document.querySelector('script[src="' + evt.filename + '"]');
				if (scriptElem) {
					var scriptId = scriptElem.getAttribute('data-script-id');
					var script = that._objects.get(scriptId);
					if (script) {
						var error = {
							message: evt.message,
							line: evt.lineno,
							file: evt.filename
						};
						setError(script, error);
					}
					scriptElem.parentNode.removeChild(scriptElem);
				}
			}
			if (that._currentScriptLoading) {
				var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + that._currentScriptLoading);
				if (oldScriptElement) {
					oldScriptElement.parentNode.removeChild(oldScriptElement);
				}
				delete window._gooScriptFactories[that._currentScriptLoading];
				var script = that._objects.get(that._currentScriptLoading);
				var error = {
					message: evt.message,
					line: evt.lineno - 1
				};
				setError(script, error);
				that._currentScriptLoading = null;
			}
		});
	};

	/**
	 * Load an external script
	 */
	function loadExternalScript(script, scriptElem, url) {
		return PromiseUtils.createPromise(function (resolve) {
			var timeoutHandler;
			var handled = false;

			scriptElem.onload = function () {
				resolve();
				if (timeoutHandler) { clearTimeout(timeoutHandler); }
			};

			function fireError(message) {
				var err = {
					message: message,
					file: url
				};
				setError(script, err);

				// remove element if it was attached to the document
				if (scriptElem.parentNode) {
					scriptElem.parentNode.removeChild(scriptElem);
				}
				resolve();
			}

			scriptElem.onerror = function (e) {
				handled = true;
				if (timeoutHandler) { clearTimeout(timeoutHandler); }
				console.error(e);
				fireError('Could not load dependency ' + url);
			};

			if (!handled) {
				handled = true;
				// Some errors (notably https/http security ones) don't fire onerror, so we have to wait
				timeoutHandler = setTimeout(function () {
					fireError('Loading dependency ' + url + ' failed (time out)');
				}, DEPENDENCY_LOAD_TIMEOUT);
			}
		});
	}

	/**
	 * Validates every property of a parameter defined by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param parameter
	 * @returns {{message: string}|undefined} May return an error
	 */
	ScriptHandler.validateParameter = function validateParameter(parameter) {
		for (var i = 0; i < ScriptUtils.PROPERTY_TYPES.length; ++i) {
			var entry = ScriptUtils.PROPERTY_TYPES[i];
			var propValue = parameter[entry.prop];
			var isPropDefined = typeof propValue !== 'undefined';

			var msgStart = 'Property "' + entry.prop + '" must be ';

			if (entry.mustBeDefined || isPropDefined) {
				var validator = ScriptUtils.TYPE_VALIDATORS[entry.type];
				var allowedValues = entry.getAllowedValues ? entry.getAllowedValues(parameter) : null;

				if (isPropDefined && entry.minLength && propValue.length < entry.minLength) {
					return { message: msgStart + 'longer than ' + (entry.minLength - 1) };
				}

				if (allowedValues && allowedValues.indexOf(propValue) === -1) {
					return { message: msgStart + 'one of: ' + allowedValues.join(', ') };
				}

				if (!validator(propValue)) {
					return { message: msgStart + 'of type ' + entry.type };
				}
			}
		}
	};

	/**
	 * Validates every parameter defined in the `externalParameters` collection by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param script
	 * @param outScript
	 */
	ScriptHandler.validateParameters = function validateParameters(script, outScript) {
		var errors = script.errors || [];
		if (typeof script.externals !== 'object') {
			outScript.externals = {};
			return;
		}
		var externals = script.externals;
		if (externals.parameters && !(externals.parameters instanceof Array)) {
			errors.push('externals.parameters must be an array');
		}
		if (errors.length) {
			outScript.errors = errors;
			return;
		}
		if (!externals.parameters) {
			return;
		}
		outScript.externals.parameters = [];
		var duplicateChecker = {};
		for (var i = 0; i < externals.parameters.length; i++) {
			var parameter = externals.parameters[i];

			var maybeError = ScriptHandler.validateParameter(parameter);
			if (maybeError) {
				errors.push(maybeError);
			}

			// create cares about this, in order to build the control panel for the script
			if (parameter['default'] === null || parameter['default'] === undefined) {
				parameter['default'] = ScriptUtils.DEFAULTS_BY_TYPE[parameter.type];
			}

			if(parameter.key && duplicateChecker[parameter.key]){
				errors.push({
					message: 'Duplicate parameter key: "' + parameter.key + '"'
				});
			}
			duplicateChecker[parameter.key] = true;

			outScript.externals.parameters.push(parameter);
		}
		if (errors.length) {
			outScript.errors = errors;
		}
	};

	/**
	 * Flag a script with an error. The script will be disabled.
	 * @param {Object} script
	 * @param {Object} error
	 * @param {string} error.message
	 * @param {number} [error.line]
	 * @param {string} [error.file]
	 */
	function setError(script, error) {
		if (error.file) {
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line; //! AT: this isn't used
			}
			script.dependencyErrors = script.dependencyErrors || {};
			script.dependencyErrors[error.file] = error;
		} else {
			script.errors = script.errors || [];
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line; //! AT: this isn't used
			}
			script.errors.push(error);

			script.setup = null;
			script.update = null;
			script.run = null;
			script.cleanup = null;
			script.enter = null;
			script.exit = null;

			script.parameters = {};
			script.enabled = false;
		}
	}

	ScriptHandler.DOM_ID_PREFIX = '_script_';

	return ScriptHandler;
});

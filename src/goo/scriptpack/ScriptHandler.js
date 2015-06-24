define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/scripts/OrbitCamControlScript',
	'goo/scriptpack/OrbitNPanControlScript',
	'goo/scriptpack/FlyControlScript',
	'goo/scriptpack/WASDControlScript',
	'goo/scriptpack/BasicControlScript',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/util/ArrayUtil',
	'goo/entities/SystemBus',

	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts'
], function (
	ConfigHandler,
	RSVP,
	OrbitCamControlScript,
	OrbitNPanControlScript,
	FlyControlScript,
	WASDControlScript,
	BasicControlScript,
	PromiseUtil,
	_,
	ArrayUtil,
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
				script.cleanup(script.parameters, script.context, Scripts.getClasses());
			} catch (e) {
				// Some cleanup error
			}
		}
		this._objects.delete(ref);
		delete this._bodyCache[ref];
	};


	/**
	 * Update a user-defined script (not a script available in the engine).
	 * If the new body (in the data model config) differs from the cached body,
	 * the script will be reloaded (by means of a script tag).
	 *
	 * @param {object} script the cached engine script object
	 * @param {object} config the data model config
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

		var newScript = window._gooScriptFactories[config.id];
		if (newScript) {
			try {
				newScript = newScript();
				script.id = config.id;
				ScriptHandler.validateParameters(newScript, script);
				script.setup = newScript.setup;
				script.update = newScript.update;
				script.cleanup = newScript.cleanup;
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
	 * Update a script that is from the engine. Checks if the class name has changed
	 * and if so, creates a new script object from the new class.
	 * @param {object} script needs to have a className property
	 * @param {object} config data model config
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
			script.parameters = newScript.parameters || {};
			script.enabled = false;

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};


	ScriptHandler.prototype._update = function (ref, config, options) {
		var that = this;

		return ConfigHandler.prototype._update.call(this, ref, config, options)
		.then(function (script) {
			if (!script) { return; }

			var addDependencyPromises = [];

			if (config.body && config.dependencies) {
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
					var neededScriptElement = ArrayUtil.find(scriptsElementsToRemove, function (scriptElement) {
						return scriptElement.src === url;
					});
					if (neededScriptElement) {
						ArrayUtil.remove(scriptsElementsToRemove, neededScriptElement);
					}

					addDependencyPromises.push(that._addDependency(script, url, config.id));
				}, null, 'sortValue');

				// Remove references to the current script from all the script
				// elements that are not needed anymore.
				_.forEach(scriptsElementsToRemove, function (scriptElement) {
					removeReference(scriptElement, config.id);
				});
			}

			return RSVP.all(addDependencyPromises)
			.then(function () {
				if (config.className) { // Engine script.
					that._updateFromClass(script, config, options);
				} else if (config.body) { // Custom script.
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
	 * Loads an external javascript lib as a dependency to this script (if it's
	 * not already loaded). If the dependency fails to load, an error is set
	 * on the script.
	 * @param {object} script config
	 * @param {string} url location of the javascript lib
	 * @param {string} scriptId the guid of the script
	 * @returns {RSVP.Promise} a promise that resolves when the dependency is loaded
	 */
	ScriptHandler.prototype._addDependency = function (script, url, scriptId) {
		var that = this;

		var scriptElem = document.querySelector('script[src="' + url + '"]');
		if (scriptElem) {
			addReference(scriptElem, scriptId);
			return this._dependencyPromises[url] || PromiseUtil.resolve();
		}

		scriptElem = document.createElement('script');
		scriptElem.src = url;
		scriptElem.setAttribute('data-script-id', scriptId);
		scriptElem.isDependency = true;
		addReference(scriptElem, scriptId);

		var parentElement = this.world.gooRunner.renderer.domElement.parentElement || document.body;
		parentElement.appendChild(scriptElem);

		var result = this._dependencyPromises[url] = loadExternalScript(script, scriptElem, url)
		.then(function () {
			delete that._dependencyPromises[url];
		});

		return result;
	};


	/*
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


	/*
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


	/*
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

		ArrayUtil.remove(scriptElement.scriptRefs, scriptId);
	}

	/*
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


	/*
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


	/*
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


	// The allowed types for the script parameters.
	var PARAMETER_TYPES = [
		'string',
		'int',
		'float',
		'vec2',
		'vec3',
		'vec4',
		'boolean',
		'texture',
		'image',
		'sound',
		'camera',
		'entity',
		'animation'
	];

	// Specifies which controls can be used with each type.
	var TYPE_CONTROLS = (function () {
		var typeControls = {
			'string': ['key'],
			'int': ['spinner', 'slider', 'jointSelector'],
			'float': ['spinner', 'slider'],
			'vec2': [],
			'vec3': ['color'],
			'vec4': ['color'],
			'boolean': ['checkbox'],
			'texture': [],
			'image': [],
			'sound': [],
			'camera': [],
			'entity': [],
			'animation': []
		};

		// Add the controls that can be used with any type to the mapping of
		// controls that ca be used for each type.
		for (var type in typeControls) {
			Array.prototype.push.apply(typeControls[type], ['dropdown', 'select']);
		}

		return typeControls;
	})();

	/**
	 * Load an external script
	 * @private
	 */
	function loadExternalScript(script, scriptElem, url) {
		return PromiseUtil.createPromise(function (resolve, reject) {
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

	var TYPE_VALIDATORS = {
		string: function (key, value) {
			if (typeof value !== 'string' || value.length === 0) {
				return { message: 'Property "' + key + '" must be a non-empty string' };
			}
		},
		number: function (key, value) {
			if (typeof value !== 'number') {
				return { message: 'Property "' + key + '" must be a number' };
			}
		},
		boolean: function (key, value) {
			if (typeof value !== 'boolean') {
				return { message: 'Property "' + key + '" must be a boolean' };
			}
		},
		array: function (key, value) {
			if (!(value instanceof Array)) {
				return { message: 'Property "' + key + '" must be an array' };
			}
		}
	};

	// why does the engine care about these thing si beyond me
	// there's a lot of very create specific validation done here
	// `exponential` for instance has NOTHING to do with the engine
	var PROPERTY_VALIDATORS = [
		{ name: 'key', validator: TYPE_VALIDATORS.string },
		{ name: 'name', validator: TYPE_VALIDATORS.string },
		{ name: 'control', validator: TYPE_VALIDATORS.string },
		{ name: 'min', validator: TYPE_VALIDATORS.number },
		{ name: 'max', validator: TYPE_VALIDATORS.number },
		{ name: 'scale', validator: TYPE_VALIDATORS.number },
		{ name: 'decimals', validator: TYPE_VALIDATORS.number },
		{ name: 'precision', validator: TYPE_VALIDATORS.number },
		{ name: 'exponential', validator: TYPE_VALIDATORS.boolean }
	];

	/**
	 * Validates every property of a parameter defined by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param parameter
	 * @returns {{message: string}|undefined} May return an error
	 */
	ScriptHandler.validateParameter = function (parameter) {
		// treat key separately; this needs to always be defined
		if (typeof parameter.key !== 'string' || parameter.key.length === 0) {
			return { message: 'Property "key" must be a non-empty string' };
		}

		// check for types
		for (var i = 0; i < PROPERTY_VALIDATORS.length; i++) {
			var entry = PROPERTY_VALIDATORS[i];

			if (typeof parameter[entry.name] !== 'undefined') {
				var maybeError = entry.validator(entry.name, parameter[entry.name]);
				if (maybeError) {
					return maybeError;
				}
			}
		}

		// check for type in a list of allowed types; must be defined
		if (PARAMETER_TYPES.indexOf(parameter.type) === -1) {
			return { message: 'Property "type" must be one of: ' + PARAMETER_TYPES.join(', ') };
		}

		// check for controls in a list of controls; this depends on type
		var allowedControls = TYPE_CONTROLS[parameter.type];
		if (parameter.control !== undefined && allowedControls.indexOf(parameter.control) === -1) {
			return { message: 'Property "control" must be one of: ' + allowedControls.join(', ') };
		}
	};

	/**
	 * Validates every parameter defined in the `externalParameters` collection by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param script
	 * @param outScript
	 */
	ScriptHandler.validateParameters = function (script, outScript) {
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
		for (var i = 0; i < externals.parameters.length; i++) {
			var parameter = externals.parameters[i];

			var maybeError = ScriptHandler.validateParameter(parameter);
			if (maybeError) {
				errors.push(maybeError);
			}

			// create cares about this, in order to build the control panel for the script
			if (parameter.default === null || parameter.default === undefined) {
				parameter.default = ScriptUtils.defaultsByType[parameter.type];
			}

			outScript.externals.parameters.push(parameter);
		}
		if (errors.length) {
			outScript.errors = errors;
		}
	};

	/**
	 * Flag a script with an error. The script will be disabled.
	 * @param {object} script
	 * @param {object} error
	 * @param {string} error.message
	 * @param {Number} [error.line]
	 * @param {string} [error.file]
	 * @private
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

			script.parameters = {};
			script.enabled = false;
		}
	}

	ScriptHandler.DOM_ID_PREFIX = '_script_';

	return ScriptHandler;
});
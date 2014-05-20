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
	'goo/entities/SystemBus',

	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts'
],
/** @lends */
function (
	ConfigHandler,
	RSVP,
	OrbitCamControlScript,
	OrbitNPanControlScript,
	FlyControlScript,
	WASDControlScript,
	BasicControlScript,
	PromiseUtil,
	_,
	SystemBus,

	ScriptUtils,
	Scripts
) {
	"use strict";

	/**
	* @class
	* @private
	*/
	function ScriptHandler() {
		ConfigHandler.apply(this, arguments);
		this._bodyCache = {};
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
		var script = this._objects[ref];
		if (script && script.cleanup && script.context) {
			try {
				script.cleanup(script.parameters, script.context, Scripts.getClasses());
			} catch (e) {
				// Some cleanup error
			}
			delete this._objects[ref];
		}
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
			"window._gooScriptFactories['" + config.id + "'] = function () { 'use strict';",
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
			'};'
		].join('\n');

		// create the element and add it to the page so the user can debug it
		// addition and execution of the script happens synchronously
		var newScriptElement = document.createElement('script');
		newScriptElement.id = ScriptHandler.DOM_ID_PREFIX + config.id;
		newScriptElement.innerHTML = scriptFactoryStr;
		this._currentScriptLoading = config.id;
		document.body.appendChild(newScriptElement);

		var newScript = window._gooScriptFactories[config.id];
		if (newScript) {
			try {
				newScript = newScript();
				script.id = config.id;
				script.externals = safeUp(newScript.externals);
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
				var m = e.stack.split('\n')[1].match(/(\d+):\d+\)$/);
				if (m) {
					err.line = parseInt(m[1], 10) - 1;
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
		.then(function (script) {
			if (!script) { return; }

			var promises = [];

			if (config.body && config.dependencies) {
				delete script.dependencyErrors;
				_.forEach(config.dependencies, function (dependencyConfig) {
					promises.push(that._addDependency(script, dependencyConfig.url, config.id));
				}, null, 'sortValue');
			}

			return RSVP.all(promises)
			.then(function () {
				if (config.className) { // Engine script.
					that._updateFromClass(script, config, options);
				} else if (config.body) { // Custom script.
					that._updateFromCustom(script, config, options);
				}

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
					SystemBus.emit('goo.scriptError', {id: ref, errors: null});
				}

				var error = { id: ref, errors: null };
				if (script.externals.errors || script.externals.dependencyErrors) {
					error.errors = script.externals.errors;
					error.dependencyErrors = script.externals.dependencyErrors;
				}

				//SystemBus.emit('scriptError', error);

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
	 * @return {RSVP.Promise} a promise that resolves when the dependency is loaded
	 */
	ScriptHandler.prototype._addDependency = function (script, url, scriptId) {
		var scriptElem = document.querySelector('script[src="' + url + '"]');
		if (scriptElem) {
			return PromiseUtil.createDummyPromise();
		}

		scriptElem = document.createElement('script');
		scriptElem.src = url;
		scriptElem.setAttribute('data-script-id', scriptId);

		var promise = new RSVP.Promise();
		scriptElem.onload = function () {
			promise.resolve();
		};
		scriptElem.onerror = function () {
			var err = {
				message: 'Could not load dependency',
				file: url
			};
			setError(script, err);
			scriptElem.parentNode.removeChild(scriptElem);
			promise.resolve();
		};
		document.body.appendChild(scriptElem);

		return promise;
	};


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
					var script = that._objects[scriptId];
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
			if (that._currentScriptLoading) {
				var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + that._currentScriptLoading);
				if (oldScriptElement) {
					oldScriptElement.parentNode.removeChild(oldScriptElement);
				}
				delete window._gooScriptFactories[that._currentScriptLoading];
				var script = that._objects[that._currentScriptLoading];
				var error = {
					message: evt.message,
					line: evt.lineno - 1
				};
				setError(script, error);
				that._currentScriptLoading = null;
			}
		});
	};



	var types = ['string', 'float', 'int', 'vec3', 'boolean', 'texture', 'entity'];

	/**
	 * Validate external parameters
	 * @private
	 */
	function safeUp(externals) {
		var	obj = {};
		var errors = externals.errors || [];
		if (typeof externals !== 'object') {
			return obj;
		}
		if (externals.parameters && !(externals.parameters instanceof Array)) {
			errors.push('externals.parameters needs to be an array');
		}
		if (errors.length) {
			obj.errors = errors;
			return obj;
		}
		if (!externals.parameters) {
			return obj;
		}
		obj.parameters = [];
		for (var i = 0; i < externals.parameters.length; i++) {
			var param = externals.parameters[i];
			if (typeof param.key !== 'string' || param.key.length === 0) {
				errors.push('parameter key needs to be string');
				continue;
			}
			if (param.name && typeof param.name !== 'string') {
				errors.push('parameter name needs to be string');
				continue;
			}
			if (types.indexOf(param.type) === -1) {
				errors.push('parameter type needs to be one of (' + types.join(', ') + ')');
				continue;
			}
			if (param.control && typeof param.control !== 'string') {
				errors.push('parameter control needs to be string');
				continue;
			}
			if (param.options && !(param.options instanceof Array)) {
				errors.push('parameter key needs to be array');
				continue;
			}
			if (param.min && isNaN(param.min)) {
				errors.push('parameter min needs to be number');
				continue;
			}
			if (param.max && isNaN(param.max)) {
				errors.push('parameter max needs to be number');
				continue;
			}
			if (param.scale && isNaN(param.scale)) {
				errors.push('parameter scale needs to be number');
				continue;
			}
			if (param.decimals && isNaN(param.decimals)) {
				errors.push('parameter decimals needs to be number');
				continue;
			}
			if (param.exponential !== undefined && typeof param.exponential !== 'boolean') {
				errors.push('parameter exponential needs to be boolean');
				continue;
			}
			if (param['default'] === undefined) {
				errors.push('parameter default is missing');
				continue;
			}
			obj.parameters.push(param);
		}
		if (errors.length) {
			obj.errors = errors;
		}
		return obj;
	}


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
		if (error.file) {
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line;
			}
			script.dependencyErrors = script.dependencyErrors || {};
			script.dependencyErrors[error.file] = error;
		} else {
			script.errors = script.errors || [];
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line;
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
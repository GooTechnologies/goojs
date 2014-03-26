define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/scripts/OrbitCamControlScript',
	'goo/scripts/OrbitNPanControlScript',
	'goo/scripts/FlyControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/BasicControlScript',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/entities/SystemBus',

	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts'
],
/** @lends */
function(
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

		var that = this;
		window.addEventListener('error', function(evt) {
			if (evt.filename) {
				var scriptElem = document.querySelector('script[src="'+evt.filename+'"]');
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
	}
	ScriptHandler.scripts = {
		OrbitCamControlScript: OrbitCamControlScript,
		OrbitNPanControlScript: OrbitNPanControlScript,
		FlyControlScript: FlyControlScript,
		WASDControlScript: WASDControlScript,
		BasicControlScript: BasicControlScript
	};

	ScriptHandler.prototype = Object.create(ConfigHandler.prototype);
	ScriptHandler.prototype.constructor = ScriptHandler;
	ConfigHandler._registerClass('script', ScriptHandler);

	ScriptHandler.prototype._specialPrepare = function(script, config) {
		config.options = config.options || {};
		// fill the rest of the parameters with default values
		if (script.externals && script.externals.parameters) {
			ScriptUtils.fillDefaultValues(config.options, script.externals.parameters);
		}
		if (config.body) {
			config._externals = script.externals;
		}
	};

	ScriptHandler.prototype._addDependency = function(script, url, scriptId) {
		var scriptElem = document.querySelector('script[src="'+url+'"]');
		if (scriptElem) {
			return PromiseUtil.createDummyPromise();
		}

		scriptElem = document.createElement('script');
		scriptElem.src = url;
		scriptElem.setAttribute('data-script-id', scriptId);

		var promise = new RSVP.Promise();
		scriptElem.onload = function() {
			promise.resolve();
		};
		scriptElem.onerror = function() {
			var err = {
				message: 'Could not load dependency',
				file: url
			};
			setError(script, err);
			promise.resolve();
		};
		document.body.appendChild(scriptElem);

		return promise;
	};

	ScriptHandler.prototype._create = function() {
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

	ScriptHandler.prototype._remove = function(ref) {
		var script = this._objects[ref];
		if (script && script.cleanup) {
			script.cleanup();
			delete this._objects[ref];
		}
	};

	ScriptHandler.prototype._updateFromCustom = function(script, config) {
		// cache the body of the function so parameter changes won't rebuild the function
		if (this._bodyCache[config.id] !== config.body) {
			delete script.externals.errors;
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
				} catch(e) {
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
		}
		return script;
	};

	ScriptHandler.prototype._updateFromClass = function(script, config) {
		if (!script.externals || script.externals.name !== config.className) {
			var newScript = Scripts.create(config.className);
			if (!newScript) {
				throw 'Unrecognized script name';
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

	ScriptHandler.prototype._update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(script) {
			if (!script) { return; }
			var promises = [];
			if (config.body && config.dependencies) {
				delete script.externals.dependencyErrors;
				for (var url in config.dependencies) {
					promises.push(that._addDependency(script, url, config.id));
				}
			}
			return RSVP.all(promises).then(function() {
				if (config.className) {
					that._updateFromClass(script, config, options);
				} else if (config.body) {
					that._updateFromCustom(script, config, options);
				}
				that._specialPrepare(script, config);
				script.name = config.name;
				if (script.externals.errors) {
					return script;
				}
				_.extend(script.parameters, config.options);
				if (options.script && options.script.disabled) {
					script.enabled = false;
				}
				return script;
			});
		});
	};

	var types = ['string', 'float', 'int', 'vec3', 'boolean'];
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
		if(!externals.parameters) {
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

	function setError(script, error) {
		if (error.file) {
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line;
			}
			script.externals.dependencyErrors = script.externals.dependencyErrors || {};
			script.externals.dependencyErrors[error.file] = message;
		} else {
			script.externals.errors = script.externals.errors || [];
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line;
			}
			script.externals.errors.push(message);

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
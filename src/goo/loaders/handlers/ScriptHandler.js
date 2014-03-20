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
			if (that._currentScriptLoading) {
				var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + that._currentScriptLoading);
				if (oldScriptElement) {
					oldScriptElement.parentNode.removeChild(oldScriptElement);
				}
				delete window._gooScriptFactories[that._currentScriptLoading];
				var script = that._objects[that._currentScriptLoading];
				script.externals = {
					errors: [evt.message + ' - On line ' + evt.lineno - 1]
				};
				script.setup = null;
				script.update = null;
				script.run = null;
				script.cleanup = null;
				script.parameters = {};
				script.enabled = false;
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
				' var obj = {};',
				' if (typeof externals !== "undefined") {',
				'  obj.externals = externals;',
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
					script.externals = {
						errors: [e.message || e]
					};
					script.setup = null;
					script.update = null;
					script.run = null;
					script.cleanup = null;
					script.parameters = {};
					script.enabled = false;
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
		if (config) {
			return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(script) {
				if (!script) { return; }
				if (config.className) {
					that._updateFromClass(script, config, options);
				} else if (config.body) {
					that._updateFromCustom(script, config, options);
				}
				that._specialPrepare(script, config);
				_.extend(script.parameters, config.options);
				if (options.script && options.script.disabled) {
					script.enabled = false;
				}
				return script;
			});
		}
		// Old style loading of OrbitNPanControlScript for now
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(script) {
			if (!config) { return; }

			if (config.className) {
				if (!script.run) {
					var name = config.className;
					if (ScriptHandler.scripts[name] instanceof Function) {
						script = that._objects[ref] = new ScriptHandler.scripts[name](config.options);
						script.id = config.id;
					}
				}
				else if (script.updateConfig) {
					script.updateConfig(config.options);
				}

				if (options.script && options.script.disabled) {
					script.enabled = script.active = false;
				}
				return script;
			}
		});
	};

	var types = ['string', 'float', 'int', 'vec3', 'boolean'];
	function safeUp(externals) {
		var	obj = {};
		var errors = [];
		if (typeof externals !== 'object') {
			return obj;
		}
		if (typeof externals.name !== 'string') {
			errors.push('externals.name needs to be a string');
		} else {
			obj.name = externals.name;
		}
		if (typeof externals.description === 'string') {
			obj.description = externals.description;
		}
		if (!(externals.parameters instanceof Array)) {
			errors.push('externals.parameters needs to be an array');
		}
		if (errors.length) {
			obj.errors = errors;
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

	ScriptHandler.DOM_ID_PREFIX = '_script_';

	return ScriptHandler;
});
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

	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts',

	'goo/scripts/NewWaveFPCamControlScript',
	'goo/scripts/NewWaveRotationScript'
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

//	ScriptHandler.prototype._prepare = function(/*config*/) {};
//	ScriptHandler.prototype._create = function(/*ref*/) {};

	ScriptHandler.htmlELementIdPrefix = '_script_';

	//! AT: needed?
	function updateParameters(existingParams, newParams) {
		var keys = Object.keys(newParams);
		keys.forEach(function (key) {
			existingParams[key] = newParams[key];
		});
	}

	ScriptHandler.prototype._specialPrepare = function(script, config) {
		config.options = config.options || {};
		if (config.className === 'OrbitNPanControlScript') { return; }
		// fill the rest of the parameters with default values
		ScriptUtils.fillDefaultValues(config.options, script.externals.parameters);
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
		var oldBody = this._bodyCache[config.id];
		if (oldBody !== config.body) {
			this._bodyCache[config.id] = config.body;

			// delete the old script tag and add a new one
			var oldScriptElement = document.getElementById(ScriptHandler.htmlELementIdPrefix + config.id);
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

				//! AT: these might throw undefined reference errors
				' return {',
				'  externals: externals,',
				'  parameters: {},',
				'  setup: setup,',
				'  update: update,',
				'  cleanup: cleanup,',
				'  enabled: false',
				' };',
				'};'
			].join('\n');

			// create the element and add it to the page so the user can debug it
			// addition and execution of the script happens synchronously
			var newScriptElement = document.createElement('script');
			newScriptElement.id = ScriptHandler.htmlELementIdPrefix + config.id;
			newScriptElement.innerHTML = scriptFactoryStr;
			document.body.appendChild(newScriptElement);
			
			var newScript = window._gooScriptFactories[config.id]();
			if (!newScript) {
				throw 'Unrecognized script body';

			}
			script.externals = newScript.externals;
			script.setup = newScript.setup;
			script.update = newScript.update;
			script.cleanup = newScript.cleanup;
			script.parameters = {};
			script.enabled = false;

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}
		return script;
	};

	ScriptHandler.prototype._updateFromClass = function(script, config) {
		if (script.externals.name !== config.className) {
			var newScript = Scripts.create(config.className);
			if (!newScript) {
				throw 'Unrecognized script name';
			}
			script.externals = newScript.externals;
			script.setup = newScript.setup;
			script.update = newScript.update;
			script.cleanup = newScript.cleanup;
			script.parameters = {};
			script.enabled = false;

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};

	ScriptHandler.prototype._update = function(ref, config, options) {
		var that = this;
		if (config.className !== 'OrbitNPanControlScript') {
			return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(script) {
				if (!script) { return; }
				if (config.className) {
					that._updateFromClass(script, config);
				} else if (config.body) {
					that._updateFromCustom(script, config);
				}
				that._specialPrepare(script, config);
				_.extend(script.parameters, config.options);
				return script;
			});
		}
		var that = this;
		var script;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(script) {
			if (!config) { return; }

			// first treat the oldstyle loading
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
			} // else ...


			// cache the body of the function so parameter changes won't rebuild the function
			var oldBody = this._bodyCache[config.id];
			if (oldBody !== config.body) {
				this._bodyCache[config.id] = config.body;

				// delete the old script tag and add a new one
				var oldScriptElement = document.getElementById(ScriptHandler.htmlELementIdPrefix + config.id);
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

					//! AT: these might throw undefined reference errors
					'\treturn {',
					'\t\texternals: externals,',
					'\t\tsetup: setup,',
					'\t\tupdate: update,',
					'\t\tcleanup: cleanup,',
					'\t\tparameters: {}',
					'\t};',
					'};'
				].join('\n');

				// create the element and add it to the page so the user can debug it
				// addition and execution of the script happens synchronously
				var newScriptElement = document.createElement('script');
				newScriptElement.id = ScriptHandler.htmlELementIdPrefix + config.id;
				newScriptElement.innerHTML = scriptFactoryStr;
				document.body.appendChild(newScriptElement);
			}

			// get an instance of the script
			script = window._gooScriptFactories[config.id]();

			// assign original parameters
			script.parameters = config.parameters;

			// fill the rest of the parameters with default values
			ScriptUtils.fillDefaultValues(script.parameters, script.externals.parameters);

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);

			return script;
		});
	};
	return ScriptHandler;
});
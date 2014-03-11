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

	'goo/scripts/NewWaveFPCamControlScript'
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

	ScriptHandler.prototype._create = function(ref, config, options) {
		if (!config) {
			return ConfigHandler.prototype._create.call(this, ref);
		}
		if (config.className) {
			var script = Scripts.create(config.className);
			if (!script) {
				throw 'Script was not recognized';
			}
			return this._objects[ref] = script;
		}
	};

	ScriptHandler.prototype._prepare = function(config) {
		config.options = config.options || {};
		_.defaults(config.options, this._objects[config.id].parameters);
	};

	ScriptHandler.prototype._remove = function(ref) {
		var script = this._objects[ref];
		if (script && script.cleanup) {
			script.cleanup();
			delete this._objects[ref];
		}
	};

	ScriptHandler.prototype._update = function(ref, config, options) {
		if (!config) {
			this._remove(ref);
			PromiseUtil.createDummyPromise(null);
		}
		if (config.className !== 'OrbitNPanControlScript') {
			var script;
			if (!this._objects[ref]) {
				script = this._create(ref, config, options);
			} else if (this._objects[ref].external.name !== config.className) {
				script = this._create(ref, config, options);
			} else {
				script = this._objects[ref];
			}
			this._prepare(config);
			_.extend(script.parameters, config.options);
			return PromiseUtil.createDummyPromise(script);
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
				if (!window._gooScripts) {
					// this holds scrips in 'compiled' form
					window._gooScripts = {};
				}

				var fullScript = [
					'window._gooScripts["' + config.id + '"] = (function() { "use strict"; ',
					config.body,
					'return {',
					'\tsetup: setup,',
					'\tupdate: update,',
					'\tcleanup: cleanup',
					'};',
					'})();'
				].join('\n');

				// create the element and add it to the page so the user can debug it
				// addition and execution of the script happens synchronously
				var newScriptElement = document.createElement('script');
				newScriptElement.id = ScriptHandler.htmlELementIdPrefix + config.id;
				newScriptElement.innerHTML = fullScript;
				document.body.appendChild(newScriptElement);
			}

			script = window._gooScripts[config.id];

			script.parameters = config.parameters;

			return script;
		});
	};
	return ScriptHandler;
});
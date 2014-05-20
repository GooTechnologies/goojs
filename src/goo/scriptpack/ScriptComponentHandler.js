define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',

	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
],
/** @lends */
function (
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_,

	Scripts,
	ScriptUtils
) {
	"use strict";

	/**
	* @class
	* @private
	*/
	function ScriptComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ScriptComponent';
	}
	ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
	ComponentHandler._registerClass('script', ScriptComponentHandler);


	ScriptComponentHandler.ENGINE_SCRIPT_PREFIX = "GOO_ENGINE_SCRIPTS/";


	ScriptComponentHandler.prototype._prepare = function (/*config*/) {};


	ScriptComponentHandler.prototype._create = function () {
		return new ScriptComponent();
	};


	ScriptComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;

		return ComponentHandler.prototype.update.call(this, entity, config, options)
		.then(function (component) {
			if (!component) { return; }

			// Load the scripts that are associated with each script instance
			// saved in the script component. For engine scripts we just have
			// to create them.
			var promises = [];
			_.forEach(config.scripts, function (scriptInstance) {
				var ref = scriptInstance.scriptRef;
				var isEngineScript = ref.indexOf(ScriptComponentHandler.ENGINE_SCRIPT_PREFIX) === 0;
				var promise = null;

				if (isEngineScript) {
					var scriptName = ref.slice(ScriptComponentHandler.ENGINE_SCRIPT_PREFIX.length);
					promise = _createEngineScript(scriptName);
				} else {
					promise = that._load(scriptInstance.scriptRef, {reload: true});
				}

				promise = promise.then(function (script) {
					if (script.externals && script.externals.parameters) {
						ScriptUtils.fillDefaultValues(scriptInstance.options, script.externals.parameters);
					}

					// We need to duplicate the script so we can have multiple
					// similar scripts with different parameters.
					var newScript = {};
					newScript.id = config.id;
					newScript.externals = script.externals;
					newScript.setup = script.setup;
					newScript.update = script.update;
					newScript.run = script.run;
					newScript.cleanup = script.cleanup;
					newScript.parameters = _.extend({}, script.parameters);
					newScript.enabled = false;

					return that._setParameters(newScript, scriptInstance, options);
				});

				promises.push(promise);
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	ScriptComponentHandler.prototype._setParameters = function (script, config, options) {
		var that = this;
		function loadKey(key, id) {
			return that._load(id, options).then(function (object) {
				script.parameters[key] = object;
			});
		}
		var promises = [];
		if (script.externals && script.externals.parameters) {
			var parameters = script.externals.parameters;
			for (var i = 0; i < parameters.length; i++) {
				var parameter = parameters[i];
				var key = parameter.key;
				if (parameter.type === 'texture') {
					var textureRef = config.options[key];
					if (!textureRef || !textureRef.textureRef || textureRef.enabled === false) {
						script.parameters[key] = null;
					} else {
						promises.push(loadKey(key, textureRef.textureRef));
					}
				} else if (parameter.type === 'entity') {
					var entityRef = config.options[key];
					if (!entityRef || !entityRef.entityRef || entityRef.enabled === false) {
						script.parameters[key] = null;
					} else {
						promises.push(loadKey(key, entityRef.entityRef));
					}
				} else {
					script.parameters[key] = _.extend(options[key]);
				}
			}
		}
		return RSVP.all(promises).then(function () { return script; });
	};


	/**
	 * Creates a new script engine.
	 *
	 * @param {object} scriptName
	 *		The name of the script which is to be created.
	 *
	 * @returns {Promise}
	 *		A promise which is resolved with the new script.
	 * @private
	 */
	function _createEngineScript(scriptName) {
		var script = Scripts.create(scriptName);
		if (!script) { throw new Error('Unrecognized script name'); }

		script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
		script.enabled = false;

		// Generate names from external variable names.
		ScriptUtils.fillDefaultNames(script.externals.parameters);

		var promise = new RSVP.Promise();
		promise.resolve(script);
		return promise;
	}


	return ScriptComponentHandler;
});
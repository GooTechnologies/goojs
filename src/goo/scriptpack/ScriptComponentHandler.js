define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',
	'goo/util/PromiseUtil',

	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
],
/** @lends */
function (
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_,
	PromiseUtil,

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
					// REVIEW No need for externals
					newScript.externals = script.externals;
					newScript.setup = script.setup;
					newScript.update = script.update;
					newScript.run = script.run;
					newScript.cleanup = script.cleanup;
					// REVIEW newScript.parameters = {}
					newScript.parameters = _.extend({}, script.parameters);
					newScript.enabled = false;

					return that._setParameters(newScript.parameters, scriptInstance.options, script.externals, options).then(function () {
						return newScript;
					});
				});

				promises.push(promise);
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	ScriptComponentHandler.prototype._setParameters = function (parameters, config, externals, options) {
		if (!externals.parameters) { return; }

		var promises = [];
		for (var i = 0; i < externals.parameters.length; i++) {
			var external = externals.parameters[i];
			this._setParameter(parameters, config[external.key], external, options);

		}
		return RSVP.all(promises);
	};

	ScriptComponentHandler.prototype._setParameter = function (parameters, config, external, options) {
		var key = external.key;
		if (external.type === 'texture') {
			if (!config || !config.textureRef || config.enabled === false) {
				parameters[key] = null;
				return PromiseUtil.createDummyPromise();
			} else {
				return this._load(config.textureRef, options).then(function (texture) {
					parameters[key] = texture;
				});
			}
		} else if (external.type === 'entity') {
			if (!config || !config.entityRef || config.enabled === false) {
				parameters[key] = null;
				return PromiseUtil.createDummyPromise();
			} else {
				return this._load(config.entityRef, options).then(function (entity) {
					parameters[key] = entity;
				});
			}
		} else {
			parameters[key] = _.extend(config);
			return PromiseUtil.createDummyPromise();
		}
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
		// REVIEW This is surely the way to load it, but as it is implemented now it will still
		// create a new script on each load. Something for the engine peopel though
		var script = Scripts.create(scriptName);
		if (!script) { throw new Error('Unrecognized script name'); }

		script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
		script.enabled = false;

		// REVIEW Maybe this is a good a place as any to call SystemBus.emit('goo.scriptExternals')

		// Generate names from external variable names.
		// REVIEW This should probably be done in Scripts.create if it's not already
		ScriptUtils.fillDefaultNames(script.externals.parameters);

		// REVIEW return PromiseUtil.createDummyPromise(script)
		var promise = new RSVP.Promise();
		promise.resolve(script);
		return promise;
	}


	return ScriptComponentHandler;
});
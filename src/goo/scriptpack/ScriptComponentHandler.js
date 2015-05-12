define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtils',
	'goo/util/PromiseUtils',
	'goo/entities/SystemBus',

	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
], function (
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_,
	PromiseUtils,
	SystemBus,

	Scripts,
	ScriptUtils
) {
	'use strict';

	/**
	 * @hidden
	 */
	function ScriptComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ScriptComponent';
	}

	ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
	ComponentHandler._registerClass('script', ScriptComponentHandler);

	ScriptComponentHandler.ENGINE_SCRIPT_PREFIX = 'GOO_ENGINE_SCRIPTS/';

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
					promise = that._load(scriptInstance.scriptRef, { reload: true });
				}

				promise = promise.then(function (script) {
					scriptInstance.options = scriptInstance.options || {};
					if (script.parameters) {
						_.defaults(scriptInstance.options, script.parameters);
					}

					if (script.externals && script.externals.parameters) {
						ScriptUtils.fillDefaultValues(scriptInstance.options, script.externals.parameters);
					}

					// We need to duplicate the script so we can have multiple
					// similar scripts with different parameters.
					var newScript = Object.create(script);
					newScript.parameters = {};
					newScript.enabled = false;

					return that._setParameters(newScript.parameters, scriptInstance.options, script.externals, options)
					.then(function () {
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
		if (!externals || !externals.parameters) {
			return PromiseUtils.resolve();
		}

		var promises = [];
		for (var i = 0; i < externals.parameters.length; i++) {
			var external = externals.parameters[i];
			this._setParameter(parameters, config[external.key], external, options);
		}
		parameters.enabled = (config.enabled !== undefined) ? config.enabled : true;
		return RSVP.all(promises);
	};

	ScriptComponentHandler.prototype._setParameter = function (parameters, config, external, options) {
		var key = external.key;
		if (external.type === 'texture') {
			if (!config || !config.textureRef || config.enabled === false) {
				parameters[key] = null;
				return PromiseUtils.resolve();
			} else {
				return this._load(config.textureRef, options).then(function (texture) {
					parameters[key] = texture;
				});
			}
		} else if (external.type === 'entity') {
			if (!config || !config.entityRef || config.enabled === false) {
				parameters[key] = null;
				return PromiseUtils.resolve();
			} else {
				return this._load(config.entityRef, options).then(function (entity) {
					parameters[key] = entity;
				});
			}
		} else {
			parameters[key] = _.extend(config);
			return PromiseUtils.resolve();
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
		var script = Scripts.create(scriptName);
		if (!script) { throw new Error('Unrecognized script name'); }

		script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
		script.enabled = false;

		SystemBus.emit('goo.scriptExternals', {
			id: script.id,
			externals: script.externals
		});

		return PromiseUtils.resolve(script);
	}

	return ScriptComponentHandler;
});
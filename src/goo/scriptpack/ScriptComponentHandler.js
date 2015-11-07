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
			return RSVP.all(_.map(config.scripts, function (instanceConfig) {
				return that._updateScriptInstance(instanceConfig, options);
			}, null, 'sortValue'))
			.then(function (scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	ScriptComponentHandler.prototype._updateScriptInstance = function (instanceConfig, options) {
		var that = this;

		return this._createOrLoadScript(handler, instanceConfig)
		.then(function (script) {
			var newParameters = instanceConfig.options || {};
			if (script.parameters) {
				_.defaults(newParameters, script.parameters);
			}

			if (script.externals && script.externals.parameters) {
				ScriptUtils.fillDefaultValues(newParameters, script.externals.parameters);
			}

			// We need to duplicate the script so we can have multiple
			// similar scripts with different parameters.
			// TODO: Check if script exists in the component and just update it
			// instead of creating a new one.
			var newScript = Object.create(script);
			newScript.parameters = {};
			newScript.enabled = false;

			return that._setParameters(
				newScript.parameters,
				newParameters,
				script.externals,
				options
			)
			.then(_.constant(newScript));
		});
	}

	ScriptComponentHandler.prototype._createOrLoadScript = function (instanceConfig) {
		var ref = instanceConfig.scriptRef;
		var prefix = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX
		var isEngineScript = ref.indexOf(prefix) === 0;

		if (isEngineScript) {
			return this._createEngineScript(ref.slice(prefix.length));
		} else {
			return this._load(instanceConfig.scriptRef, { reload: true });
		}
	}

	/**
	 * Creates a new instance of one of the default scripts provided by the
	 * engine.
	 *
	 * @param {Object} scriptName
	 *		The name of the script which is to be created.
	 *
	 * @returns {RSVP.Promise}
	 *		A promise which is resolved with the new script.
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._createEngineScript = function (scriptName) {
		var script = Scripts.create(scriptName);
		if (!script) {
			throw new Error('Unrecognized script name');
		}

		script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
		script.enabled = false;

		SystemBus.emit('goo.scriptExternals', {
			id: script.id,
			externals: script.externals
		});

		return PromiseUtils.resolve(script);
	}

	/**
	 * Sets the parameters of a script instance.
	 *
	 * @param {object} parameters
	 *        The parameters of the new script instance which are to be filled
	 *        out according to the json config and the script externals.
	 * @param {object}
	 *        The json config Script values from the json config
	 * @param externals Parameter definitions as defined in a script's external.parameters object
	 * @param options Dynamic loader options
	 * @returns {*}
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._setParameters = function (parameters, config, externals, options) {
		var that = this;

		// is externals ever falsy?
		if (!externals || !externals.parameters) {
			return PromiseUtils.resolve();
		}

		var promises = externals.parameters.map(function (external) {
			return that._setParameter(parameters, config[external.key], external, options);
		});

		parameters.enabled = config.enabled !== false;

		return RSVP.all(promises);
	};

	ScriptComponentHandler.prototype._setParameter = function (parameters, config, external, options) {
		var key = external.key;
		var type = external.type;

		if (!ScriptUtils.typeValidators[external.type](config)) {
			if (typeof external.default === 'undefined') {
				parameters[key] = _.deepClone(ScriptUtils.defaultsByType[external.type]);
			} else {
				parameters[key] = _.deepClone(external.default);
			}

			return PromiseUtils.resolve();
		}

		if (type === 'texture' || type === 'entity') {
			this._setRefParameter(type + 'Ref', parameters, config, external, options);
		} else {
			// Revert to default if value has a bad type.
			parameters[key] = _.clone(config);
			return PromiseUtils.resolve();
		}
	};

	ScriptComponentHandler.prototype._setRefParameter = function (refKey, parameters, config, external, options) {
		if (!config || !config[refKey] || config.enabled === false) {
			parameters[external.key] = null;
			return PromiseUtils.resolve();
		}

		return this._load(config[refKey], options)
		.then(function (obj) {
			parameters[external.key] = obj;
		});
	}

	return ScriptComponentHandler;
});
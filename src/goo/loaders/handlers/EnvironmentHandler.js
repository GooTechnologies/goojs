define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/ObjectUtil',
	'goo/entities/SystemBus',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/Snow' // TODO Should move!
], function(
	ConfigHandler,
	_,
	SystemBus,
	ShaderBuilder,
	Snow
) {
	'use strict';

	/*
	 * @class Handling environments
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function EnvironmentHandler() {
		ConfigHandler.apply(this, arguments);
	}

	EnvironmentHandler.prototype = Object.create(ConfigHandler.prototype);
	EnvironmentHandler.prototype.constructor = EnvironmentHandler;
	ConfigHandler._registerClass('environment', EnvironmentHandler);

	EnvironmentHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			backgroundColor: [0,0,0,1],
			globalAmbient: [0,0,0,1],
			fog: {
				enabled: false,
				color: [1,1,1,1],
				near: 10,
				far: 1000
			}
		});
	};

	EnvironmentHandler.prototype._create = function() {
		return {
			weatherState: {}
		};
	};

	/*
	 * Adds/updates/removes an environment
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated environment or null if removed
	 */
	EnvironmentHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(object) {
			object.backgroundColor = config.backgroundColor.slice();
			object.globalAmbient = config.globalAmbient.slice(0,3);

			object.fog = _.deepClone(config.fog);



			// Background color
			SystemBus.emit('goo.setClearColor', object.backgroundColor);

			// Fog and ambient
			ShaderBuilder.GLOBAL_AMBIENT = object.globalAmbient;
			ShaderBuilder.USE_FOG = object.fog.enabled;
			ShaderBuilder.FOG_COLOR = object.fog.color;
			ShaderBuilder.FOG_SETTINGS = [object.fog.near, config.fog.far];


			// Weather
			for (var key in config.weather) {
				var handler = EnvironmentHandler.weatherHandlers[key];
				if (handler) {
					handler.update.call(that, config.weather[key], object.weatherState);
				}
			}

			// Skybox
			if(config.skyboxRef) {
				return that._load(config.skyboxRef, options).then(function(/*skybox*/) {
					return object;
				});
			}
			return object;
		});
	};


	EnvironmentHandler.weatherHandlers = {
		snow: {
			update: function(config, weatherState) {
				if (config.enabled) {
					if (weatherState.snow && weatherState.snow.enabled) {
						// adjust snow
						weatherState.snow.snow.setEmissionVelocity(config.velocity);
						weatherState.snow.snow.setReleaseRatePerSecond(config.rate);
						weatherState.snow.snow.setEmissionHeight(config.height);
					} else {
						// add snow
						weatherState.snow = weatherState.snow || {};
						weatherState.snow.enabled = true;
						weatherState.snow.snow = new Snow(this.world.gooRunner);
					}
				} else {
					if (weatherState.snow && weatherState.snow.enabled) {
						// remove snow
						weatherState.snow.snow.remove();
						weatherState.snow.enabled = false;
						delete weatherState.snow.snow;
					}
				}
			},
			remove: function(weatherState) {
				if (weatherState.snow.snow) {
					weatherState.snow.snow.remove();
					weatherState.snow.enabled = false;
					delete weatherState.snow.snow;
				}
			}
		}
	};

	return EnvironmentHandler;
});
define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/ObjectUtils',
	'goo/entities/SystemBus',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/Snow', // TODO Should move!
	'goo/util/rsvp'
], function(
	ConfigHandler,
	_,
	SystemBus,
	ShaderBuilder,
	Snow,
	RSVP
) {
	'use strict';

	var defaults = {
		backgroundColor: [0.3,0.3,0.3,1],
		globalAmbient: [0,0,0],
		fog: {
			enabled: false,
			color: [1,1,1],
			near: 10,
			far: 1000
		}
	};
	var soundDefaults = {
		volume: 1,
		reverb: 0,
		dopplerFactor: 1,
		rolloffFactor: 0.4,
		maxDistance: 100
	};

	/**
	 * Handling environments
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function EnvironmentHandler() {
		ConfigHandler.apply(this, arguments);
	}

	EnvironmentHandler.prototype = Object.create(ConfigHandler.prototype);
	EnvironmentHandler.prototype.constructor = EnvironmentHandler;
	ConfigHandler._registerClass('environment', EnvironmentHandler);

	EnvironmentHandler.prototype._prepare = function(config) {
		_.defaults(config, defaults);
	};

	EnvironmentHandler.prototype._create = function() {
		return {
			weatherState: {}
		};
	};

	EnvironmentHandler.prototype._remove = function(ref) {
		var object = this._objects.get(ref);
		this._objects.delete(ref);
		if (!object) {
			return;
		}

		// Remove weather
		for (var key in object.weatherState) {
			EnvironmentHandler.weatherHandlers[key].remove(object.weatherState);
		}

		// Reset environment
		SystemBus.emit('goo.setClearColor', defaults.backgroundColor);
		ShaderBuilder.CLEAR_COLOR = defaults.backgroundColor;
		ShaderBuilder.GLOBAL_AMBIENT = defaults.globalAmbient.slice(0,3);
		ShaderBuilder.USE_FOG = defaults.fog.enabled;
		ShaderBuilder.FOG_COLOR = defaults.fog.color.slice(0,3);
		ShaderBuilder.FOG_SETTINGS = [defaults.fog.near, defaults.fog.far];

		// Reset Sound
		var soundSystem = this.world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.updateConfig(soundDefaults);
			soundSystem.setReverb(null);
		}
	};

	/**
	 * Adds/updates/removes an environment
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated environment or null if removed
	 */
	EnvironmentHandler.prototype._update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(object) {
			if (!object) { return; }
			var bgc = config.backgroundColor;
			var a = bgc[3];
			// Premultiply alpha
			object.backgroundColor = [
				bgc[0] * a,
				bgc[1] * a,
				bgc[2] * a,
				bgc[3]
			];
			object.globalAmbient = config.globalAmbient.slice(0,3);

			object.fog = _.deepClone(config.fog);

			// Background color
			SystemBus.emit('goo.setClearColor', object.backgroundColor);

			// Fog and ambient
			ShaderBuilder.CLEAR_COLOR = object.backgroundColor;
			ShaderBuilder.GLOBAL_AMBIENT = object.globalAmbient;
			ShaderBuilder.USE_FOG = object.fog.enabled;
			ShaderBuilder.FOG_COLOR = object.fog.color.slice(0,3);
			ShaderBuilder.FOG_SETTINGS = [object.fog.near, config.fog.far];

			// Weather
			for (var key in config.weather) {
				var handler = EnvironmentHandler.weatherHandlers[key];
				if (handler) {
					handler.update.call(that, config.weather[key], object.weatherState);
				}
			}

			var promises = [];

			// Skybox
			if (config.skyboxRef) {
				EnvironmentHandler.currentSkyboxRef = config.skyboxRef;
				promises.push(that._load(config.skyboxRef, {reload: true}));
			} else if (EnvironmentHandler.currentSkyboxRef) {
				var p = that.updateObject(EnvironmentHandler.currentSkyboxRef, null)
				.then(function () {
					delete EnvironmentHandler.currentSkyboxRef;
				});
				promises.push(p);
			}

			// Sound
			var soundSystem = that.world.getSystem('SoundSystem');
			if (config.sound && soundSystem) {
				soundSystem.updateConfig(config.sound);
				if (config.sound.reverbRef) {
					var p = that._load(config.sound.reverbRef, options).then(function(sound) {
						soundSystem.setReverb(sound._buffer);
					});
					promises.push(p);
				} else {
					soundSystem.setReverb(null);
				}
			}
			return RSVP.all(promises).then(function() { return object; });
		});
	};


	EnvironmentHandler.weatherHandlers = {
		snow: {
			update: function(config, weatherState) {
				if (config.enabled) {
					if (!weatherState.snow || !weatherState.snow.enabled) {
						// add snow
						weatherState.snow = weatherState.snow || {};
						weatherState.snow.enabled = true;
						weatherState.snow.snow = new Snow(this.world.gooRunner);
					}

					weatherState.snow.snow.setEmissionVelocity(config.velocity);
					weatherState.snow.snow.setReleaseRatePerSecond(config.rate);
					weatherState.snow.snow.setEmissionHeight(config.height);
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
				if (weatherState.snow && weatherState.snow.snow) {
					weatherState.snow.snow.remove();
					weatherState.snow.enabled = false;
					delete weatherState.snow.snow;
				}
			}
		}
	};

	return EnvironmentHandler;
});
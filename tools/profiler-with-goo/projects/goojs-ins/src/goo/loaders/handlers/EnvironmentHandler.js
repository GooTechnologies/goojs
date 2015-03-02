define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/util/ObjectUtil',
    'goo/entities/SystemBus',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/util/Snow',
    'goo/util/rsvp'
], function (ConfigHandler, _, SystemBus, ShaderBuilder, Snow, RSVP) {
    'use strict';
    __touch(8881);
    var defaults = {
        backgroundColor: [
            0.3,
            0.3,
            0.3,
            1
        ],
        globalAmbient: [
            0,
            0,
            0
        ],
        fog: {
            enabled: false,
            color: [
                1,
                1,
                1
            ],
            near: 10,
            far: 1000
        }
    };
    __touch(8882);
    var soundDefaults = {
        volume: 1,
        reverb: 0,
        dopplerFactor: 1,
        rolloffFactor: 0.4,
        maxDistance: 100
    };
    __touch(8883);
    function EnvironmentHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(8894);
    }
    __touch(8884);
    EnvironmentHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(8885);
    EnvironmentHandler.prototype.constructor = EnvironmentHandler;
    __touch(8886);
    ConfigHandler._registerClass('environment', EnvironmentHandler);
    __touch(8887);
    EnvironmentHandler.prototype._prepare = function (config) {
        _.defaults(config, defaults);
        __touch(8895);
    };
    __touch(8888);
    EnvironmentHandler.prototype._create = function () {
        return { weatherState: {} };
        __touch(8896);
    };
    __touch(8889);
    EnvironmentHandler.prototype._remove = function (ref) {
        var object = this._objects[ref];
        __touch(8897);
        delete this._objects[ref];
        __touch(8898);
        for (var key in object.weatherState) {
            EnvironmentHandler.weatherHandlers[key].remove(object.weatherState);
            __touch(8907);
        }
        __touch(8899);
        SystemBus.emit('goo.setClearColor', defaults.backgroundColor);
        __touch(8900);
        ShaderBuilder.CLEAR_COLOR = defaults.backgroundColor;
        __touch(8901);
        ShaderBuilder.GLOBAL_AMBIENT = defaults.globalAmbient.slice(0, 3);
        __touch(8902);
        ShaderBuilder.USE_FOG = defaults.fog.enabled;
        __touch(8903);
        ShaderBuilder.FOG_COLOR = defaults.fog.color.slice(0, 3);
        __touch(8904);
        ShaderBuilder.FOG_SETTINGS = [
            defaults.fog.near,
            defaults.fog.far
        ];
        __touch(8905);
        var soundSystem = this.world.getSystem('SoundSystem');
        __touch(8906);
        if (soundSystem) {
            soundSystem.updateConfig(soundDefaults);
            __touch(8908);
            soundSystem.setReverb(null);
            __touch(8909);
        }
    };
    __touch(8890);
    EnvironmentHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(8910);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (object) {
            if (!object) {
                return;
                __touch(8925);
            }
            object.backgroundColor = config.backgroundColor.slice(0);
            __touch(8912);
            object.globalAmbient = config.globalAmbient.slice(0, 3);
            __touch(8913);
            object.fog = _.deepClone(config.fog);
            __touch(8914);
            SystemBus.emit('goo.setClearColor', object.backgroundColor);
            __touch(8915);
            ShaderBuilder.CLEAR_COLOR = object.backgroundColor;
            __touch(8916);
            ShaderBuilder.GLOBAL_AMBIENT = object.globalAmbient;
            __touch(8917);
            ShaderBuilder.USE_FOG = object.fog.enabled;
            __touch(8918);
            ShaderBuilder.FOG_COLOR = object.fog.color.slice(0, 3);
            __touch(8919);
            ShaderBuilder.FOG_SETTINGS = [
                object.fog.near,
                config.fog.far
            ];
            __touch(8920);
            for (var key in config.weather) {
                var handler = EnvironmentHandler.weatherHandlers[key];
                __touch(8926);
                if (handler) {
                    handler.update.call(that, config.weather[key], object.weatherState);
                    __touch(8927);
                }
            }
            __touch(8921);
            var promises = [];
            __touch(8922);
            if (config.skyboxRef) {
                object.skyboxRef = config.skyboxRef;
                __touch(8928);
                promises.push(that._load(config.skyboxRef, { reload: true }));
                __touch(8929);
            } else if (object.skyboxRef) {
                var p = that.updateObject(object.skyboxRef, null).then(function () {
                    delete object.skyboxRef;
                    __touch(8932);
                });
                __touch(8930);
                promises.push(p);
                __touch(8931);
            }
            var soundSystem = that.world.getSystem('SoundSystem');
            __touch(8923);
            if (config.sound && soundSystem) {
                soundSystem.updateConfig(config.sound);
                __touch(8933);
                if (config.sound.reverbRef) {
                    var p = that._load(config.sound.reverbRef, options).then(function (sound) {
                        soundSystem.setReverb(sound._buffer);
                        __touch(8936);
                    });
                    __touch(8934);
                    promises.push(p);
                    __touch(8935);
                } else {
                    soundSystem.setReverb(null);
                    __touch(8937);
                }
            }
            return RSVP.all(promises).then(function () {
                return object;
                __touch(8938);
            });
            __touch(8924);
        });
        __touch(8911);
    };
    __touch(8891);
    EnvironmentHandler.weatherHandlers = {
        snow: {
            update: function (config, weatherState) {
                if (config.enabled) {
                    if (weatherState.snow && weatherState.snow.enabled) {
                        weatherState.snow.snow.setEmissionVelocity(config.velocity);
                        __touch(8939);
                        weatherState.snow.snow.setReleaseRatePerSecond(config.rate);
                        __touch(8940);
                        weatherState.snow.snow.setEmissionHeight(config.height);
                        __touch(8941);
                    } else {
                        weatherState.snow = weatherState.snow || {};
                        __touch(8942);
                        weatherState.snow.enabled = true;
                        __touch(8943);
                        weatherState.snow.snow = new Snow(this.world.gooRunner);
                        __touch(8944);
                    }
                } else {
                    if (weatherState.snow && weatherState.snow.enabled) {
                        weatherState.snow.snow.remove();
                        __touch(8945);
                        weatherState.snow.enabled = false;
                        __touch(8946);
                        delete weatherState.snow.snow;
                        __touch(8947);
                    }
                }
            },
            remove: function (weatherState) {
                if (weatherState.snow.snow) {
                    weatherState.snow.snow.remove();
                    __touch(8948);
                    weatherState.snow.enabled = false;
                    __touch(8949);
                    delete weatherState.snow.snow;
                    __touch(8950);
                }
            }
        }
    };
    __touch(8892);
    return EnvironmentHandler;
    __touch(8893);
});
__touch(8880);
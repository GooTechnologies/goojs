define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/LightComponent',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/SpotLight',
    'goo/renderer/light/DirectionalLight',
    'goo/math/Vector',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ComponentHandler, LightComponent, PointLight, SpotLight, DirectionalLight, Vector, RSVP, pu, _) {
    'use strict';
    __touch(9022);
    function LightComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9033);
        this._type = 'LightComponent';
        __touch(9034);
    }
    __touch(9023);
    LightComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9024);
    LightComponentHandler.prototype.constructor = LightComponentHandler;
    __touch(9025);
    ComponentHandler._registerClass('light', LightComponentHandler);
    __touch(9026);
    var cachedSupportsShadows;
    __touch(9027);
    var supportsShadows = function () {
        if (cachedSupportsShadows === undefined) {
            var isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
            __touch(9036);
            cachedSupportsShadows = !isIos;
            __touch(9037);
        }
        return cachedSupportsShadows;
        __touch(9035);
    };
    __touch(9028);
    LightComponentHandler.prototype._prepare = function (config) {
        _.defaults(config, {
            direction: [
                0,
                0,
                0
            ],
            color: [
                1,
                1,
                1
            ],
            shadowCaster: false,
            lightCookie: null
        });
        __touch(9038);
        if (config.type !== 'DirectionalLight') {
            config.range = config.range !== undefined ? config.range : 1000;
            __touch(9039);
        }
        if (config.shadowCaster && supportsShadows()) {
            config.shadowSettings = config.shadowSettings || {};
            __touch(9040);
            _.defaults(config.shadowSettings, {
                shadowType: 'Basic',
                near: 1,
                far: 1000,
                resolution: [
                    512,
                    512
                ],
                darkness: 0.5
            });
            __touch(9041);
            var settings = config.shadowSettings;
            __touch(9042);
            if (settings.projection === 'Parallel') {
                settings.size = settings.size !== undefined ? settings.size : 400;
                __touch(9043);
            } else {
                settings.fov = settings.fov !== undefined ? settings.fov : 55;
                __touch(9044);
            }
        }
    };
    __touch(9029);
    LightComponentHandler.prototype._create = function () {
        return new LightComponent();
        __touch(9045);
    };
    __touch(9030);
    LightComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(9046);
        var Light = {
            SpotLight: SpotLight,
            DirectionalLight: DirectionalLight,
            PointLight: PointLight
        };
        __touch(9047);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(9051);
            }
            var light = component.light;
            __touch(9049);
            if (!light || Light[config.type] !== light.constructor) {
                light = new Light[config.type]();
                __touch(9052);
                component.light = light;
                __touch(9053);
            }
            for (var key in config) {
                var value = config[key];
                __touch(9054);
                if (light.hasOwnProperty(key)) {
                    if (key === 'shadowSettings') {
                        for (var key in value) {
                            var shadowVal = value[key];
                            __touch(9056);
                            if (light.shadowSettings[key] instanceof Vector) {
                                light.shadowSettings[key].set(shadowVal);
                                __touch(9057);
                            } else {
                                light.shadowSettings[key] = _.clone(shadowVal);
                                __touch(9058);
                            }
                        }
                        __touch(9055);
                    } else if (light[key] instanceof Vector) {
                        light[key].set(value);
                        __touch(9059);
                    } else {
                        light[key] = _.clone(value);
                        __touch(9060);
                    }
                }
            }
            __touch(9050);
            if (config.type === 'PointLight' || !supportsShadows()) {
                light.shadowCaster = false;
                __touch(9061);
            }
            if (config.lightCookie && config.type !== 'PointLight') {
                var textureObj = config.lightCookie;
                __touch(9062);
                if (!textureObj || !textureObj.textureRef || textureObj.enabled === false) {
                    light.lightCookie = null;
                    __touch(9063);
                    return component;
                    __touch(9064);
                } else {
                    return that._load(textureObj.textureRef, options).then(function (texture) {
                        light.lightCookie = texture;
                        __touch(9066);
                        return component;
                        __touch(9067);
                    });
                    __touch(9065);
                }
            } else {
                light.lightCookie = null;
                __touch(9068);
                return component;
                __touch(9069);
            }
        });
        __touch(9048);
    };
    __touch(9031);
    return LightComponentHandler;
    __touch(9032);
});
__touch(9021);
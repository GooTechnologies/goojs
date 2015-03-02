define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/util/ArrayUtil',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil',
    'goo/renderer/pass/Composer',
    'goo/renderer/pass/RenderPass',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Util',
    'goo/passpack/PassLib'
], function (ConfigHandler, ArrayUtil, RSVP, PromiseUtil, _, Composer, RenderPass, FullscreenPass, ShaderLib, Util, PassLib) {
    'use strict';
    __touch(15020);
    function PosteffectsHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(15030);
        this._composer = new Composer();
        __touch(15031);
        var renderSystem = this.world.getSystem('RenderSystem');
        __touch(15032);
        this._renderPass = new RenderPass(renderSystem.renderList);
        __touch(15033);
        this._outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
        __touch(15034);
        this._outPass.renderToScreen = true;
        __touch(15035);
    }
    __touch(15021);
    PosteffectsHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(15022);
    PosteffectsHandler.prototype.constructor = PosteffectsHandler;
    __touch(15023);
    ConfigHandler._registerClass('posteffects', PosteffectsHandler);
    __touch(15024);
    PosteffectsHandler.prototype._remove = function (ref) {
        var renderSystem = this.world.getSystem('RenderSystem');
        __touch(15036);
        ArrayUtil.remove(renderSystem.composers, this._composer);
        __touch(15037);
        delete this._objects[ref];
        __touch(15038);
        if (this.world) {
            this._composer.destroy(this.world.gooRunner.renderer);
            __touch(15040);
        }
        this._composer = new Composer();
        __touch(15039);
    };
    __touch(15025);
    PosteffectsHandler.prototype._create = function () {
        return [];
        __touch(15041);
    };
    __touch(15026);
    PosteffectsHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(15042);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (posteffects) {
            if (!posteffects) {
                return;
                __touch(15048);
            }
            var oldEffects = posteffects.slice();
            __touch(15044);
            var promises = [];
            __touch(15045);
            _.forEach(config.posteffects, function (effectConfig) {
                promises.push(that._updateEffect(effectConfig, oldEffects, options));
                __touch(15049);
            }, null, 'sortValue');
            __touch(15046);
            return RSVP.all(promises).then(function (effects) {
                for (var i = 0; i < effects.length; i++) {
                    posteffects[i] = effects[i];
                    __touch(15052);
                }
                posteffects.length = i;
                __touch(15050);
                return posteffects;
                __touch(15051);
            });
            __touch(15047);
        }).then(function (posteffects) {
            if (!posteffects) {
                return;
                __touch(15057);
            }
            var enabled = posteffects.some(function (effect) {
                return effect.enabled;
                __touch(15058);
            });
            __touch(15053);
            var renderSystem = that.world.getSystem('RenderSystem');
            __touch(15054);
            var composer = that._composer;
            __touch(15055);
            if (enabled) {
                composer.passes = [];
                __touch(15059);
                composer.addPass(that._renderPass);
                __touch(15060);
                for (var i = 0; i < posteffects.length; i++) {
                    var posteffect = posteffects[i];
                    __touch(15062);
                    if (posteffect && posteffect.enabled) {
                        composer.addPass(posteffects[i], that.world.gooRunner.renderer);
                        __touch(15063);
                    }
                }
                composer.addPass(that._outPass);
                __touch(15061);
                if (renderSystem.composers.indexOf(composer) === -1) {
                    renderSystem.composers.push(composer);
                    __touch(15064);
                }
            } else {
                ArrayUtil.remove(renderSystem.composers, that._composer);
                __touch(15065);
            }
            return posteffects;
            __touch(15056);
        });
        __touch(15043);
    };
    __touch(15027);
    PosteffectsHandler.prototype._updateEffect = function (config, posteffects, options) {
        var that = this;
        __touch(15066);
        function loadConfig(key, id) {
            return that._load(id, options).then(function (object) {
                config.options[key] = object;
                __touch(15072);
            });
            __touch(15071);
        }
        __touch(15067);
        var effect;
        __touch(15068);
        for (var i = 0; i < posteffects.length; i++) {
            if (posteffects[i].id === config.id) {
                effect = posteffects[i];
                __touch(15073);
                break;
                __touch(15074);
            }
        }
        if (!effect) {
            if (!PassLib[config.type]) {
                return null;
                __touch(15076);
            }
            effect = new PassLib[config.type](config.id);
            __touch(15075);
        }
        var promises = [];
        __touch(15069);
        for (var i = 0; i < PassLib[config.type].options.length; i++) {
            var option = PassLib[config.type].options[i];
            __touch(15077);
            var key = option.key;
            __touch(15078);
            var type = option.type;
            __touch(15079);
            if (type === 'texture') {
                if (config.options[key] && config.options[key].textureRef && config.options[key].enabled) {
                    promises.push(loadConfig(key, config.options[key].textureRef));
                    __touch(15080);
                } else {
                    config.options[key] = null;
                    __touch(15081);
                }
            } else if (type === 'entity') {
                if (config.options[key] && config.options[key].entityRef && config.options[key].enabled) {
                    promises.push(loadConfig(key, config.options[key].entityRef));
                    __touch(15082);
                } else {
                    config.options[key] = null;
                    __touch(15083);
                }
            }
        }
        return RSVP.all(promises).then(function () {
            effect.update(config);
            __touch(15084);
            return effect;
            __touch(15085);
        });
        __touch(15070);
    };
    __touch(15028);
    return PosteffectsHandler;
    __touch(15029);
});
__touch(15019);
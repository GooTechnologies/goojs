define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/renderer/Material',
    'goo/renderer/Util',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/RenderQueue',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ConfigHandler, Material, Util, ShaderLib, RenderQueue, RSVP, PromiseUtil, _) {
    'use strict';
    __touch(9071);
    function MaterialHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9082);
    }
    __touch(9072);
    MaterialHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9073);
    MaterialHandler.prototype.constructor = MaterialHandler;
    __touch(9074);
    ConfigHandler._registerClass('material', MaterialHandler);
    __touch(9075);
    MaterialHandler.ENGINE_SHADER_PREFIX = 'GOO_ENGINE_SHADERS/';
    __touch(9076);
    MaterialHandler.prototype._prepare = function (config) {
        if (!config.blendState) {
            config.blendState = {};
            __touch(9086);
        }
        _.defaults(config.blendState, {
            blending: 'NoBlending',
            blendEquation: 'AddEquation',
            blendSrc: 'SrcAlphaFactor',
            blendDst: 'OneMinusSrcAlphaFactor'
        });
        __touch(9083);
        if (!config.cullState) {
            config.cullState = {};
            __touch(9087);
        }
        _.defaults(config.cullState, {
            enabled: true,
            cullFace: 'Back',
            frontFace: 'CCW'
        });
        __touch(9084);
        if (!config.depthState) {
            config.depthState = {};
            __touch(9088);
        }
        _.defaults(config.depthState, {
            enabled: true,
            write: true
        });
        __touch(9085);
        if (config.renderQueue === null || config.renderQueue === undefined) {
            config.renderQueue = -1;
            __touch(9089);
        }
        if (config.dualTransparency === null || config.dualTransparency === undefined) {
            config.dualTransparency = false;
            __touch(9090);
        }
        if (config.wireframe === null || config.wireframe === undefined) {
            config.wireframe = false;
            __touch(9091);
        }
        if (config.flat === null || config.flat === undefined) {
            config.flat = false;
            __touch(9092);
        }
    };
    __touch(9077);
    MaterialHandler.prototype._create = function () {
        return new Material();
        __touch(9093);
    };
    __touch(9078);
    MaterialHandler.prototype._remove = function (ref) {
        var material = this._objects[ref];
        __touch(9094);
        if (!material) {
            return;
            __touch(9098);
        }
        material.shader.destroy();
        __touch(9095);
        material.empty();
        __touch(9096);
        delete this._objects[ref];
        __touch(9097);
    };
    __touch(9079);
    MaterialHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(9099);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (material) {
            if (!material) {
                return;
                __touch(9118);
            }
            var promises = [];
            __touch(9101);
            _.extend(material.blendState, config.blendState);
            __touch(9102);
            _.extend(material.cullState, config.cullState);
            __touch(9103);
            _.extend(material.depthState, config.depthState);
            __touch(9104);
            material.id = config.id;
            __touch(9105);
            material.name = config.name;
            __touch(9106);
            material.wireframe = config.wireframe;
            __touch(9107);
            material.flat = config.flat;
            __touch(9108);
            material.dualTransparency = config.dualTransparency;
            __touch(9109);
            if (config.renderQueue === -1) {
                if (config.blendState.blending !== 'NoBlending') {
                    material.renderQueue = RenderQueue.TRANSPARENT;
                    __touch(9119);
                } else {
                    material.renderQueue = null;
                    __touch(9120);
                }
            } else {
                material.renderQueue = config.renderQueue;
                __touch(9121);
            }
            material.uniforms = {};
            __touch(9110);
            for (var name in config.uniforms) {
                if (config.uniforms[name].enabled === undefined) {
                    material.uniforms[name] = _.clone(config.uniforms[name]);
                    __touch(9122);
                } else if (config.uniforms[name].enabled) {
                    material.uniforms[name] = _.clone(config.uniforms[name].value);
                    __touch(9123);
                }
            }
            __touch(9111);
            var shaderRef = config.shaderRef;
            __touch(9112);
            if (!shaderRef) {
                material.shader = Material.createShader(ShaderLib.texturedLit, 'DefaultShader');
                __touch(9124);
            } else if (shaderRef.indexOf(MaterialHandler.ENGINE_SHADER_PREFIX) === 0) {
                var shaderName = shaderRef.slice(MaterialHandler.ENGINE_SHADER_PREFIX.length);
                __touch(9125);
                material.shader = Material.createShader(ShaderLib[shaderName]);
                __touch(9126);
            } else {
                var p = that._load(shaderRef, options).then(function (shader) {
                    material.shader = shader;
                    __touch(9129);
                }).then(null, function (err) {
                    throw new Error('Error loading shader: ' + err);
                    __touch(9130);
                });
                __touch(9127);
                promises.push(p);
                __touch(9128);
            }
            function addTexture(type, ref, options) {
                return that._load(ref, options).then(function (texture) {
                    material.setTexture(type, texture);
                    __touch(9132);
                }).then(null, function (err) {
                    throw new Error('Error loading texture: ' + ref + ' - ' + err);
                    __touch(9133);
                });
                __touch(9131);
            }
            __touch(9113);
            var textureRef;
            __touch(9114);
            for (var type in config.texturesMapping) {
                textureRef = config.texturesMapping[type];
                __touch(9134);
                if (!textureRef || !textureRef.textureRef || textureRef.enabled === false) {
                    material.removeTexture(type);
                    __touch(9135);
                } else {
                    promises.push(addTexture(type, textureRef.textureRef, options));
                    __touch(9136);
                }
            }
            __touch(9115);
            for (var type in material._textureMaps) {
                if (!config.texturesMapping[type]) {
                    material.removeTexture(type);
                    __touch(9137);
                }
            }
            __touch(9116);
            return RSVP.all(promises).then(function () {
                return material;
                __touch(9138);
            });
            __touch(9117);
        });
        __touch(9100);
    };
    __touch(9080);
    return MaterialHandler;
    __touch(9081);
});
__touch(9070);
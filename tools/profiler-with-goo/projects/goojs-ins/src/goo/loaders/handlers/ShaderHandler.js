define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/renderer/Material',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/util/rsvp',
    'goo/util/PromiseUtil'
], function (ConfigHandler, Material, MeshData, Shader, ShaderBuilder, RSVP, PromiseUtil) {
    'use strict';
    __touch(9356);
    function ShaderHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9364);
    }
    __touch(9357);
    ShaderHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9358);
    ShaderHandler.prototype.constructor = ShaderHandler;
    __touch(9359);
    ConfigHandler._registerClass('shader', ShaderHandler);
    __touch(9360);
    ShaderHandler.prototype._remove = function (ref) {
        if (this._objects[ref] && this._objects[ref].destroy) {
            this._objects[ref].destroy();
            __touch(9366);
        }
        delete this._objects[ref];
        __touch(9365);
    };
    __touch(9361);
    ShaderHandler.prototype._update = function (ref, config, options) {
        if (!config) {
            this._remove(ref);
            __touch(9370);
            return PromiseUtil.resolve();
            __touch(9371);
        }
        if (!config.vshaderRef) {
            return PromiseUtil.reject('Shader error, missing vertex shader ref');
            __touch(9372);
        }
        if (!config.fshaderRef) {
            return PromiseUtil.reject('Shader error, missing fragment shader ref');
            __touch(9373);
        }
        var promises = [
            this.loadObject(config.vshaderRef, options),
            this.loadObject(config.fshaderRef, options)
        ];
        __touch(9367);
        var that = this;
        __touch(9368);
        return RSVP.all(promises).then(function (shaders) {
            var vshader = shaders[0];
            __touch(9374);
            var fshader = shaders[1];
            __touch(9375);
            if (!vshader) {
                return PromiseUtil.reject('Vertex shader' + config.vshaderRef + 'in shader' + ref + 'not found');
                __touch(9380);
            }
            if (!fshader) {
                return PromiseUtil.reject('Fragment shader' + config.fshaderRef + 'in shader' + ref + 'not found');
                __touch(9381);
            }
            var shaderDefinition = {
                defines: config.defines || {},
                attributes: config.attributes || {},
                uniforms: config.uniforms || {},
                vshader: vshader,
                fshader: fshader
            };
            __touch(9376);
            if (config.processors) {
                shaderDefinition.processors = [];
                __touch(9382);
                for (var i = 0; i < config.processors.length; i++) {
                    var processor = config.processors[i];
                    __touch(9383);
                    if (ShaderBuilder[processor]) {
                        shaderDefinition.processors.push(ShaderBuilder[processor].processor);
                        __touch(9384);
                    } else {
                        console.error('Unknown processor ' + processor);
                        __touch(9385);
                    }
                }
            }
            var shader = Material.createShader(shaderDefinition, ref);
            __touch(9377);
            that._objects[ref] = shader;
            __touch(9378);
            return shader;
            __touch(9379);
        });
        __touch(9369);
    };
    __touch(9362);
    return ShaderHandler;
    __touch(9363);
});
__touch(9355);
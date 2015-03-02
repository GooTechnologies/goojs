define(['goo/renderer/Shader'], function (Shader) {
    'use strict';
    __touch(15850);
    function Material(name, shaderDefinition) {
        this.id = null;
        __touch(15866);
        this.name = 'Default Material';
        __touch(15867);
        this.shader = null;
        __touch(15868);
        if (typeof arguments[0] === 'string') {
            this.name = arguments[0];
            __touch(15879);
        } else if (arguments[0] && arguments[0].vshader && arguments[0].fshader) {
            this.shader = Material.createShader(arguments[0]);
            __touch(15880);
        }
        if (arguments[1] && arguments[1].vshader && arguments[1].fshader) {
            this.shader = Material.createShader(arguments[1]);
            __touch(15881);
        } else if (typeof arguments[1] === 'string') {
            this.name = arguments[1];
            __touch(15882);
        }
        this.uniforms = {};
        __touch(15869);
        this._textureMaps = {};
        __touch(15870);
        this.cullState = {
            enabled: true,
            cullFace: 'Back',
            frontFace: 'CCW'
        };
        __touch(15871);
        this.blendState = {
            blending: 'NoBlending',
            blendEquation: 'AddEquation',
            blendSrc: 'SrcAlphaFactor',
            blendDst: 'OneMinusSrcAlphaFactor'
        };
        __touch(15872);
        this.depthState = {
            enabled: true,
            write: true
        };
        __touch(15873);
        this.offsetState = {
            enabled: false,
            factor: 1,
            units: 1
        };
        __touch(15874);
        this.dualTransparency = false;
        __touch(15875);
        this.wireframe = false;
        __touch(15876);
        this.flat = false;
        __touch(15877);
        this.renderQueue = null;
        __touch(15878);
    }
    __touch(15851);
    Material.prototype.setTexture = function (name, texture) {
        this._textureMaps[name] = texture;
        __touch(15883);
    };
    __touch(15852);
    Material.prototype.getTexture = function (name) {
        return this._textureMaps[name];
        __touch(15884);
    };
    __touch(15853);
    Material.prototype.removeTexture = function (name) {
        delete this._textureMaps[name];
        __touch(15885);
    };
    __touch(15854);
    Material.prototype.getTextures = function () {
        var textures = [];
        __touch(15886);
        for (var key in this._textureMaps) {
            textures.push(this._textureMaps[key]);
            __touch(15889);
        }
        __touch(15887);
        return textures;
        __touch(15888);
    };
    __touch(15855);
    Material.prototype.getTextureEntries = function () {
        return this._textureMaps;
        __touch(15890);
    };
    __touch(15856);
    Material.prototype.getRenderQueue = function () {
        if (this.renderQueue !== null) {
            return this.renderQueue;
            __touch(15892);
        } else if (this.shader !== null) {
            return this.shader.renderQueue;
            __touch(15893);
        }
        return 1000;
        __touch(15891);
    };
    __touch(15857);
    Material.prototype.setRenderQueue = function (queue) {
        this.renderQueue = queue;
        __touch(15894);
    };
    __touch(15858);
    Material.store = [];
    __touch(15859);
    Material.hash = [];
    __touch(15860);
    Material.createShader = function (shaderDefinition, name) {
        var index = Material.store.indexOf(shaderDefinition);
        __touch(15895);
        if (index !== -1) {
            return Material.hash[index];
            __touch(15900);
        }
        var shader = new Shader(name || null, shaderDefinition);
        __touch(15896);
        if (shader.name === null) {
            shader.name = 'DefaultShader' + shader._id;
            __touch(15901);
        }
        Material.store.push(shaderDefinition);
        __touch(15897);
        Material.hash.push(shader);
        __touch(15898);
        return shader;
        __touch(15899);
    };
    __touch(15861);
    Material.clearShaderCache = function () {
        Material.store.length = 0;
        __touch(15902);
        Material.hash.length = 0;
        __touch(15903);
    };
    __touch(15862);
    Material.createEmptyMaterial = function (shaderDefinition, name) {
        var material = new Material(name || 'Empty Material');
        __touch(15904);
        material.empty();
        __touch(15905);
        if (shaderDefinition) {
            material.shader = Material.createShader(shaderDefinition);
            __touch(15907);
        } else {
            material.shader = undefined;
            __touch(15908);
        }
        return material;
        __touch(15906);
    };
    __touch(15863);
    Material.prototype.empty = function () {
        this.cullState = {};
        __touch(15909);
        this.blendState = {};
        __touch(15910);
        this.depthState = {};
        __touch(15911);
        this.offsetState = {};
        __touch(15912);
        this.wireframe = undefined;
        __touch(15913);
        this.renderQueue = undefined;
        __touch(15914);
        this.flat = undefined;
        __touch(15915);
        this._textureMaps = {};
        __touch(15916);
        this.shader = undefined;
        __touch(15917);
        this.uniforms = {};
        __touch(15918);
    };
    __touch(15864);
    return Material;
    __touch(15865);
});
__touch(15849);
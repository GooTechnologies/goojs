define([
    'goo/renderer/Material',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderFragment',
    'goo/renderer/pass/RenderPass',
    'goo/renderer/pass/FullscreenPass',
    'goo/passpack/BlurPass',
    'goo/renderer/Util',
    'goo/util/Skybox',
    'goo/renderer/pass/Pass'
], function (Material, RenderTarget, MeshData, Shader, ShaderFragment, RenderPass, FullscreenPass, BlurPass, Util, Skybox, Pass) {
    'use strict';
    __touch(14550);
    function DOFPass(renderList, outShader) {
        this.depthPass = new RenderPass(renderList, function (item) {
            return !(item instanceof Skybox);
            __touch(14577);
        });
        __touch(14558);
        this.regularPass = new RenderPass(renderList);
        __touch(14559);
        var packDepthMaterial = new Material(packDepth);
        __touch(14560);
        this.depthPass.overrideMaterial = packDepthMaterial;
        __touch(14561);
        var shader = outShader || unpackDepth;
        __touch(14562);
        this.outPass = new FullscreenPass(shader);
        __touch(14563);
        this.outPass.useReadBuffer = false;
        __touch(14564);
        this.outPass.renderToScreen = true;
        __touch(14565);
        var width = window.innerWidth || 1;
        __touch(14566);
        var height = window.innerHeight || 1;
        __touch(14567);
        var size = Util.nearestPowerOfTwo(Math.max(width, height));
        __touch(14568);
        this.depthTarget = new RenderTarget(width, height);
        __touch(14569);
        this.regularTarget = new RenderTarget(size / 2, size / 2);
        __touch(14570);
        this.regularTarget2 = new RenderTarget(width, height);
        __touch(14571);
        this.regularTarget.generateMipmaps = true;
        __touch(14572);
        this.regularTarget.minFilter = 'Trilinear';
        __touch(14573);
        this.enabled = true;
        __touch(14574);
        this.clear = false;
        __touch(14575);
        this.needsSwap = true;
        __touch(14576);
    }
    __touch(14551);
    DOFPass.prototype = Object.create(Pass.prototype);
    __touch(14552);
    DOFPass.prototype.constructor = DOFPass;
    __touch(14553);
    DOFPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
        this.depthPass.render(renderer, null, this.depthTarget, delta);
        __touch(14578);
        this.regularPass.render(renderer, null, this.regularTarget, delta);
        __touch(14579);
        this.regularPass.render(renderer, null, this.regularTarget2, delta);
        __touch(14580);
        this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
        __touch(14581);
        this.outPass.material.setTexture(Shader.DIFFUSE_MAP, this.regularTarget);
        __touch(14582);
        this.outPass.material.setTexture('DIFFUSE_MIP', this.regularTarget2);
        __touch(14583);
        this.outPass.render(renderer, writeBuffer, readBuffer, delta);
        __touch(14584);
    };
    __touch(14554);
    var packDepth = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            farPlane: Shader.FAR_PLANE
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec4 vPosition;',
            'void main(void) {',
            '\tvPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = projectionMatrix * vPosition;',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform float farPlane;',
            ShaderFragment.methods.packDepth,
            'varying vec4 vPosition;',
            'void main(void)',
            '{',
            '\tfloat linearDepth = min(-vPosition.z, farPlane) / farPlane;',
            '\tgl_FragColor = packDepth(linearDepth);',
            '}'
        ].join('\n')
    };
    __touch(14555);
    var unpackDepth = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            worldMatrix: Shader.WORLD_MATRIX,
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            depthMap: Shader.DEPTH_MAP,
            diffuseMap: Shader.DIFFUSE_MAP,
            diffuseMip: 'DIFFUSE_MIP',
            zfar: Shader.FAR_PLANE,
            focalDepth: 100,
            fStop: 2,
            CoC: 0.003,
            focalLength: 75,
            maxBlur: 16
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tgl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: '' + 'uniform sampler2D diffuseMap;\n' + 'uniform sampler2D diffuseMip;\n' + 'uniform sampler2D depthMap;\n' + 'uniform float zfar; //camera clipping end\n' + 'uniform float focalDepth;\n' + 'uniform float focalLength;\n' + 'uniform float fStop;\n' + 'uniform float CoC;\n' + 'uniform float maxBlur;\n' + 'varying vec2 texCoord0;\n' + ShaderFragment.methods.unpackDepth + 'void main() \n' + '{\n' + '\tfloat depth = unpackDepth(texture2D(depthMap,texCoord0)) * zfar;\n' + '\tfloat f = focalLength; //focal length in mm\n' + '\tfloat d = focalDepth*1000.0; //focal plane in mm\n' + '\tfloat o = depth*1000.0; //depth in mm\n' + '\tfloat a = (o*f)/(o-f); \n' + '\tfloat b = (d*f)/(d-f); \n' + '\tfloat c = (d-f)/(d*fStop*CoC); \n' + '\tfloat blur = clamp(abs(a-b)*c, 0.0, maxBlur);\n' + ' if (blur < 0.3) {\n' + '   gl_FragColor = texture2D(diffuseMip, texCoord0);\n' + ' } else { \n' + '   gl_FragColor = texture2D(diffuseMap, texCoord0, log2(blur));\n' + ' }\n' + ' gl_FragColor.a = 1.0;' + '}'
    };
    __touch(14556);
    return DOFPass;
    __touch(14557);
});
__touch(14549);
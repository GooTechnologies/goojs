define([
    'goo/renderer/Material',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderFragment',
    'goo/renderer/pass/RenderPass',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/pass/Pass',
    'goo/passpack/BlurPass'
], function (Material, RenderTarget, MeshData, Shader, ShaderFragment, RenderPass, FullscreenPass, Pass, BlurPass) {
    'use strict';
    __touch(14586);
    function DepthPass(renderList, outShader) {
        this.depthPass = new RenderPass(renderList);
        __touch(14594);
        var packDepthMaterial = new Material(packDepth);
        __touch(14595);
        this.depthPass.overrideMaterial = packDepthMaterial;
        __touch(14596);
        this.blurTarget = new RenderTarget(256, 256);
        __touch(14597);
        this.blurPass = new BlurPass({ target: this.blurTarget });
        __touch(14598);
        var shader = outShader || unpackDepth;
        __touch(14599);
        this.outPass = new FullscreenPass(shader);
        __touch(14600);
        this.outPass.useReadBuffer = false;
        __touch(14601);
        var width = window.innerWidth || 1;
        __touch(14602);
        var height = window.innerHeight || 1;
        __touch(14603);
        this.depthTarget = new RenderTarget(width, height);
        __touch(14604);
        this.enabled = true;
        __touch(14605);
        this.clear = false;
        __touch(14606);
        this.needsSwap = true;
        __touch(14607);
    }
    __touch(14587);
    DepthPass.prototype = Object.create(Pass.prototype);
    __touch(14588);
    DepthPass.prototype.constructor = DepthPass;
    __touch(14589);
    DepthPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
        this.depthPass.render(renderer, null, this.depthTarget, delta);
        __touch(14608);
        this.blurPass.render(renderer, writeBuffer, readBuffer, delta);
        __touch(14609);
        this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
        __touch(14610);
        this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
        __touch(14611);
        this.outPass.material.setTexture('BLUR_MAP', this.blurTarget);
        __touch(14612);
        this.outPass.render(renderer, writeBuffer, readBuffer, delta);
        __touch(14613);
    };
    __touch(14590);
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
            '\tfloat linearDepth = min(length(vPosition), farPlane) / farPlane;',
            '\tgl_FragColor = packDepth(linearDepth);',
            '}'
        ].join('\n')
    };
    __touch(14591);
    var unpackDepth = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            depthMap: Shader.DEPTH_MAP,
            diffuseMap: Shader.DIFFUSE_MAP
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform sampler2D depthMap;',
            'uniform sampler2D diffuseMap;',
            'varying vec2 texCoord0;',
            ShaderFragment.methods.unpackDepth,
            'void main(void)',
            '{',
            '\tvec4 depthCol = texture2D(depthMap, texCoord0);',
            '\tvec4 diffuseCol = texture2D(diffuseMap, texCoord0);',
            '\tfloat depth = unpackDepth(depthCol);',
            '\tgl_FragColor = diffuseCol * vec4(depth);',
            '}'
        ].join('\n')
    };
    __touch(14592);
    return DepthPass;
    __touch(14593);
});
__touch(14585);
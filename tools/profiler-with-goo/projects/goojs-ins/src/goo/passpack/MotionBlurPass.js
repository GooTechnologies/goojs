define([
    'goo/renderer/Material',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/MeshData',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/pass/Pass'
], function (Material, Shader, ShaderLib, FullscreenUtil, MeshData, RenderTarget, FullscreenPass, Pass) {
    'use strict';
    __touch(14697);
    function MotionBlurPass() {
        this.inPass = new FullscreenPass(blendShader);
        __touch(14706);
        this.outPass = new FullscreenPass(ShaderLib.copyPure);
        __touch(14707);
        var width = window.innerWidth || 1024;
        __touch(14708);
        var height = window.innerHeight || 1024;
        __touch(14709);
        this.updateSize({
            x: 0,
            y: 0,
            width: width,
            height: height
        });
        __touch(14710);
        this.enabled = true;
        __touch(14711);
        this.clear = false;
        __touch(14712);
        this.needsSwap = true;
        __touch(14713);
    }
    __touch(14698);
    MotionBlurPass.prototype = Object.create(Pass.prototype);
    __touch(14699);
    MotionBlurPass.prototype.constructor = MotionBlurPass;
    __touch(14700);
    MotionBlurPass.prototype.destroy = function (renderer) {
        this.inPass.destroy(renderer);
        __touch(14714);
        this.outPass.destroy(renderer);
        __touch(14715);
        if (this.targetSwap) {
            this.targetSwap[0].destroy(renderer.context);
            __touch(14716);
            this.targetSwap[1].destroy(renderer.context);
            __touch(14717);
            this.targetSwap = undefined;
            __touch(14718);
        }
    };
    __touch(14701);
    MotionBlurPass.prototype.updateSize = function (size, renderer) {
        var sizeX = size.width;
        __touch(14719);
        var sizeY = size.height;
        __touch(14720);
        if (this.targetSwap) {
            for (var i = 0; i < this.targetSwap.length; i++) {
                renderer._deallocateRenderTarget(this.targetSwap[i]);
                __touch(14722);
            }
        }
        this.targetSwap = [
            new RenderTarget(sizeX, sizeY),
            new RenderTarget(sizeX, sizeY)
        ];
        __touch(14721);
    };
    __touch(14702);
    MotionBlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        this.inPass.material.setTexture('MOTION_MAP', this.targetSwap[1]);
        __touch(14723);
        this.inPass.render(renderer, this.targetSwap[0], readBuffer);
        __touch(14724);
        this.outPass.render(renderer, writeBuffer, this.targetSwap[0]);
        __touch(14725);
        this.targetSwap.reverse();
        __touch(14726);
    };
    __touch(14703);
    var blendShader = {
        defines: {},
        processors: [function (shader, shaderInfo) {
                if (shaderInfo.material._textureMaps.MOTION_MAP.glTexture) {
                    shader.defines.MOTION_MAP = true;
                    __touch(14727);
                } else {
                    delete shader.defines.MOTION_MAP;
                    __touch(14728);
                }
            }],
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            blend: 0.9,
            scale: 1,
            diffuseMap: Shader.DIFFUSE_MAP,
            motionMap: 'MOTION_MAP'
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec2 texCoord0;',
            'void main(void) {',
            'texCoord0 = vertexUV0;',
            'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D diffuseMap;',
            'uniform sampler2D motionMap;',
            'uniform float blend;',
            'uniform float scale;',
            'varying vec2 texCoord0;',
            'void main(void)',
            '{',
            'vec4 colA = texture2D(diffuseMap, texCoord0);',
            '#ifdef MOTION_MAP',
            'vec4 colB = texture2D(motionMap, (texCoord0 - 0.5) / scale + 0.5);',
            'float wBlend = blend;// * length(colB) / sqrt(3.0);',
            'gl_FragColor = mix(colA, colB, wBlend);',
            '#else',
            'gl_FragColor = colA;',
            '#endif',
            '}'
        ].join('\n')
    };
    __touch(14704);
    return MotionBlurPass;
    __touch(14705);
});
__touch(14696);
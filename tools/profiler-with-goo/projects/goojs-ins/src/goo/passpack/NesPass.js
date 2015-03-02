define([
    'goo/renderer/TextureCreator',
    'goo/renderer/Material',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/pass/Pass'
], function (TextureCreator, Material, FullscreenUtil, ShaderLib, Pass) {
    'use strict';
    __touch(14730);
    function NesPass(textureUrl) {
        this.material = new Material(nesShader);
        __touch(14737);
        this.renderToScreen = false;
        __touch(14738);
        this.renderable = {
            meshData: FullscreenUtil.quad,
            materials: [this.material]
        };
        __touch(14739);
        this.mapping = new TextureCreator().loadTexture2D(textureUrl);
        __touch(14740);
        this.mapping.minFilter = 'NearestNeighborNoMipMaps';
        __touch(14741);
        this.mapping.magFilter = 'NearestNeighbor';
        __touch(14742);
        this.mapping.generateMipmaps = false;
        __touch(14743);
        this.enabled = true;
        __touch(14744);
        this.clear = false;
        __touch(14745);
        this.needsSwap = true;
        __touch(14746);
    }
    __touch(14731);
    NesPass.prototype = Object.create(Pass.prototype);
    __touch(14732);
    NesPass.prototype.constructor = NesPass;
    __touch(14733);
    NesPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        this.material.setTexture('DIFFUSE_MAP', readBuffer);
        __touch(14747);
        this.material.setTexture('COLOR_MAPPING', this.mapping);
        __touch(14748);
        if (this.renderToScreen) {
            renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
            __touch(14749);
        } else {
            renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
            __touch(14750);
        }
    };
    __touch(14734);
    var nesShader = {
        attributes: ShaderLib.copy.attributes,
        uniforms: {
            diffuse: 'DIFFUSE_MAP',
            mapping: 'COLOR_MAPPING',
            $link: ShaderLib.copy.uniforms
        },
        vshader: ShaderLib.copy.vshader,
        fshader: [
            'precision mediump float;',
            'uniform sampler2D diffuse;',
            'uniform sampler2D mapping;',
            'varying vec2 texCoord0;',
            'void main() {',
            '\tvec4 texCol = texture2D( diffuse, texCoord0 );',
            '\tfloat r = floor(texCol.r * 31.0);',
            '\tfloat g = floor(texCol.g * 31.0);',
            '\tfloat b = floor(texCol.b * 31.0);',
            '\tvec4 texPalette = texture2D( mapping, vec2((r * 32.0 + g)/1024.0, b / 32.0) );',
            '\tgl_FragColor = vec4( texPalette.rgb, 1.0 );',
            '}'
        ].join('\n')
    };
    __touch(14735);
    return NesPass;
    __touch(14736);
});
__touch(14729);
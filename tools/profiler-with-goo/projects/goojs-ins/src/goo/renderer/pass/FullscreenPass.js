define([
    'goo/renderer/Material',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/pass/Pass'
], function (Material, FullscreenUtil, ShaderLib, Pass) {
    'use strict';
    __touch(18463);
    function FullscreenPass(shader) {
        this.material = new Material(shader || ShaderLib.simple);
        __touch(18470);
        this.useReadBuffer = true;
        __touch(18471);
        this.renderToScreen = false;
        __touch(18472);
        this.renderable = {
            meshData: FullscreenUtil.quad,
            materials: [this.material]
        };
        __touch(18473);
        this.enabled = true;
        __touch(18474);
        this.clear = false;
        __touch(18475);
        this.needsSwap = true;
        __touch(18476);
    }
    __touch(18464);
    FullscreenPass.prototype = Object.create(Pass.prototype);
    __touch(18465);
    FullscreenPass.prototype.constructor = FullscreenPass;
    __touch(18466);
    FullscreenPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        if (this.useReadBuffer) {
            this.material.setTexture('DIFFUSE_MAP', readBuffer);
            __touch(18477);
        }
        if (this.renderToScreen) {
            renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
            __touch(18478);
        } else {
            renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
            __touch(18479);
        }
    };
    __touch(18467);
    FullscreenPass.prototype.destroy = function () {
        this.material.shader.destroy();
        __touch(18480);
    };
    __touch(18468);
    return FullscreenPass;
    __touch(18469);
});
__touch(18462);
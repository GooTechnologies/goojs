define([
    'goo/renderer/Material',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/Util',
    'goo/renderer/shaders/ShaderLib',
    'goo/passpack/ShaderLibExtra',
    'goo/renderer/pass/Pass'
], function (Material, FullscreenUtil, RenderTarget, Util, ShaderLib, ShaderLibExtra, Pass) {
    'use strict';
    __touch(14437);
    function BloomPass(settings) {
        settings = settings || {};
        __touch(14447);
        this.target = settings.target !== undefined ? settings.target : null;
        __touch(14448);
        var strength = settings.strength !== undefined ? settings.strength : 0;
        __touch(14449);
        var sigma = settings.sigma !== undefined ? settings.sigma : 4;
        __touch(14450);
        var kernelSize = 2 * Math.ceil(sigma * 3) + 1;
        __touch(14451);
        this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 4;
        __touch(14452);
        var width = window.innerWidth || 1024;
        __touch(14453);
        var height = window.innerHeight || 1024;
        __touch(14454);
        this.updateSize({
            x: 0,
            y: 0,
            width: width,
            height: height
        });
        __touch(14455);
        this.renderable = {
            meshData: FullscreenUtil.quad,
            materials: []
        };
        __touch(14456);
        this.copyMaterial = new Material(ShaderLib.copyPure);
        __touch(14457);
        this.copyMaterial.uniforms.opacity = strength;
        __touch(14458);
        this.copyMaterial.blendState.blending = 'AdditiveBlending';
        __touch(14459);
        this.convolutionShader = Util.clone(ShaderLib.convolution);
        __touch(14460);
        this.convolutionShader.defines = {
            'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
            'KERNEL_SIZE_INT': kernelSize.toFixed(0)
        };
        __touch(14461);
        this.convolutionMaterial = new Material(this.convolutionShader);
        __touch(14462);
        this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;
        __touch(14463);
        this.convolutionMaterial.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
        __touch(14464);
        this.bcMaterial = new Material(ShaderLibExtra.brightnesscontrast);
        __touch(14465);
        this.bcMaterial.uniforms.brightness = 0;
        __touch(14466);
        this.bcMaterial.uniforms.contrast = 0;
        __touch(14467);
        this.enabled = true;
        __touch(14468);
        this.clear = false;
        __touch(14469);
        this.needsSwap = false;
        __touch(14470);
    }
    __touch(14438);
    BloomPass.prototype = Object.create(Pass.prototype);
    __touch(14439);
    BloomPass.prototype.constructor = BloomPass;
    __touch(14440);
    BloomPass.prototype.destroy = function (renderer) {
        if (this.renderTargetX) {
            this.renderTargetX.destroy(renderer.context);
            __touch(14474);
        }
        if (this.renderTargetY) {
            this.renderTargetY.destroy(renderer.context);
            __touch(14475);
        }
        this.convolutionMaterial.shader.destroy();
        __touch(14471);
        this.copyMaterial.shader.destroy();
        __touch(14472);
        this.bcMaterial.shader.destroy();
        __touch(14473);
    };
    __touch(14441);
    BloomPass.prototype.updateSize = function (size, renderer) {
        var sizeX = size.width / this.downsampleAmount;
        __touch(14476);
        var sizeY = size.height / this.downsampleAmount;
        __touch(14477);
        if (this.renderTargetX) {
            this.renderTargetX.destroy(renderer.context);
            __touch(14480);
        }
        if (this.renderTargetY) {
            this.renderTargetY.destroy(renderer.context);
            __touch(14481);
        }
        this.renderTargetX = new RenderTarget(sizeX, sizeY);
        __touch(14478);
        this.renderTargetY = new RenderTarget(sizeX, sizeY);
        __touch(14479);
    };
    __touch(14442);
    BloomPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        this.renderable.materials[0] = this.bcMaterial;
        __touch(14482);
        this.bcMaterial.setTexture('DIFFUSE_MAP', readBuffer);
        __touch(14483);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);
        __touch(14484);
        this.renderable.materials[0] = this.convolutionMaterial;
        __touch(14485);
        this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);
        __touch(14486);
        this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurY;
        __touch(14487);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);
        __touch(14488);
        this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
        __touch(14489);
        this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;
        __touch(14490);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);
        __touch(14491);
        this.renderable.materials[0] = this.copyMaterial;
        __touch(14492);
        this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);
        __touch(14493);
        if (this.target !== null) {
            renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
            __touch(14494);
        } else {
            renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
            __touch(14495);
        }
    };
    __touch(14443);
    BloomPass.blurX = [
        0.001953125,
        0
    ];
    __touch(14444);
    BloomPass.blurY = [
        0,
        0.001953125
    ];
    __touch(14445);
    return BloomPass;
    __touch(14446);
});
__touch(14436);
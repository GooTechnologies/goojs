define([
    'goo/renderer/Material',
    'goo/renderer/pass/FullscreenUtil',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/Util',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/pass/Pass'
], function (Material, FullscreenUtil, RenderTarget, Util, ShaderLib, Pass) {
    'use strict';
    __touch(14497);
    function BlurPass(settings) {
        settings = settings || {};
        __touch(14505);
        this.target = settings.target !== undefined ? settings.target : null;
        __touch(14506);
        var strength = settings.strength !== undefined ? settings.strength : 1;
        __touch(14507);
        var sigma = settings.sigma !== undefined ? settings.sigma : 4;
        __touch(14508);
        var kernelSize = 2 * Math.ceil(sigma * 3) + 1;
        __touch(14509);
        this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 4;
        __touch(14510);
        this.blurX = [
            0.001953125,
            0
        ];
        __touch(14511);
        this.blurY = [
            0,
            0.001953125
        ];
        __touch(14512);
        var width = window.innerWidth || 1024;
        __touch(14513);
        var height = window.innerHeight || 1024;
        __touch(14514);
        this.updateSize({
            x: 0,
            y: 0,
            width: width,
            height: height
        });
        __touch(14515);
        this.renderable = {
            meshData: FullscreenUtil.quad,
            materials: []
        };
        __touch(14516);
        this.copyMaterial = new Material(ShaderLib.copyPure);
        __touch(14517);
        this.copyMaterial.uniforms.opacity = strength;
        __touch(14518);
        this.copyMaterial.blendState.blending = 'CustomBlending';
        __touch(14519);
        this.convolutionShader = Util.clone(ShaderLib.convolution);
        __touch(14520);
        this.convolutionShader.defines = {
            'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
            'KERNEL_SIZE_INT': kernelSize.toFixed(0)
        };
        __touch(14521);
        this.convolutionShader.uniforms.uImageIncrement = this.blurX;
        __touch(14522);
        this.convolutionShader.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
        __touch(14523);
        this.convolutionMaterial = new Material(this.convolutionShader);
        __touch(14524);
        this.enabled = true;
        __touch(14525);
        this.clear = false;
        __touch(14526);
        this.needsSwap = false;
        __touch(14527);
    }
    __touch(14498);
    BlurPass.prototype = Object.create(Pass.prototype);
    __touch(14499);
    BlurPass.prototype.constructor = BlurPass;
    __touch(14500);
    BlurPass.prototype.destroy = function (renderer) {
        if (this.renderTargetX) {
            this.renderTargetX.destroy(renderer.context);
            __touch(14530);
        }
        if (this.renderTargetY) {
            this.renderTargetY.destroy(renderer.context);
            __touch(14531);
        }
        this.convolutionMaterial.shader.destroy();
        __touch(14528);
        this.copyMaterial.shader.destroy();
        __touch(14529);
    };
    __touch(14501);
    BlurPass.prototype.updateSize = function (size, renderer) {
        var sizeX = size.width / this.downsampleAmount;
        __touch(14532);
        var sizeY = size.height / this.downsampleAmount;
        __touch(14533);
        if (this.renderTargetX) {
            renderer._deallocateRenderTarget(this.renderTargetX);
            __touch(14536);
        }
        if (this.renderTargetY) {
            renderer._deallocateRenderTarget(this.renderTargetY);
            __touch(14537);
        }
        this.renderTargetX = new RenderTarget(sizeX, sizeY);
        __touch(14534);
        this.renderTargetY = new RenderTarget(sizeX, sizeY);
        __touch(14535);
    };
    __touch(14502);
    BlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        this.renderable.materials[0] = this.convolutionMaterial;
        __touch(14538);
        this.convolutionMaterial.setTexture('DIFFUSE_MAP', readBuffer);
        __touch(14539);
        this.convolutionMaterial.uniforms.uImageIncrement = this.blurY;
        __touch(14540);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);
        __touch(14541);
        this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
        __touch(14542);
        this.convolutionMaterial.uniforms.uImageIncrement = this.blurX;
        __touch(14543);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);
        __touch(14544);
        this.renderable.materials[0] = this.copyMaterial;
        __touch(14545);
        this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);
        __touch(14546);
        if (this.target !== null) {
            renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
            __touch(14547);
        } else {
            renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
            __touch(14548);
        }
    };
    __touch(14503);
    return BlurPass;
    __touch(14504);
});
__touch(14496);
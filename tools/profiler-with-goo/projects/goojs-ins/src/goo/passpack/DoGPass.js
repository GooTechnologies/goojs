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
    __touch(14615);
    function DoGPass(settings) {
        settings = settings || {};
        __touch(14628);
        this.target = settings.target !== undefined ? settings.target : null;
        __touch(14629);
        var width = settings.width !== undefined ? settings.width : 1024;
        __touch(14630);
        var height = settings.height !== undefined ? settings.height : 1024;
        __touch(14631);
        var sigma = settings.sigma !== undefined ? settings.sigma : 0.6;
        __touch(14632);
        var threshold = settings.threshold !== undefined ? settings.threshold : 0.005;
        __touch(14633);
        this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 2;
        __touch(14634);
        if (sigma > 2.5) {
            sigma = 2.5;
            __touch(14646);
        }
        this.updateSize({
            width: width,
            height: height
        });
        __touch(14635);
        this.renderable = {
            meshData: FullscreenUtil.quad,
            materials: []
        };
        __touch(14636);
        this.convolutionShader1 = Util.clone(ShaderLib.convolution);
        __touch(14637);
        this.convolutionShader2 = Util.clone(ShaderLib.convolution);
        __touch(14638);
        this.differenceShader = Util.clone(ShaderLibExtra.differenceOfGaussians);
        __touch(14639);
        this.differenceShader.uniforms.threshold = threshold;
        __touch(14640);
        this.differenceMaterial = new Material(this.differenceShader);
        __touch(14641);
        this.updateSigma(sigma);
        __touch(14642);
        this.enabled = true;
        __touch(14643);
        this.clear = false;
        __touch(14644);
        this.needsSwap = true;
        __touch(14645);
    }
    __touch(14616);
    DoGPass.prototype = Object.create(Pass.prototype);
    __touch(14617);
    DoGPass.prototype.constructor = DoGPass;
    __touch(14618);
    DoGPass.prototype.destroy = function (renderer) {
        var context = renderer.context;
        __touch(14647);
        if (this.convolutionMaterial1) {
            this.convolutionMaterial1.shader.destroy();
            __touch(14649);
        }
        if (this.convolutionMaterial2) {
            this.convolutionMaterial2.shader.destroy();
            __touch(14650);
        }
        this.differenceMaterial.shader.destroy();
        __touch(14648);
        if (this.gaussian1) {
            this.gaussian1.destroy(context);
            __touch(14651);
        }
        if (this.gaussian2) {
            this.gaussian2.destroy(context);
            __touch(14652);
        }
        if (this.renderTargetX) {
            this.renderTargetX.destroy(context);
            __touch(14653);
        }
        if (this.target) {
            this.target.destroy(context);
            __touch(14654);
        }
    };
    __touch(14619);
    DoGPass.prototype.updateThreshold = function (threshold) {
        this.differenceMaterial.shader.uniforms.threshold = threshold;
        __touch(14655);
    };
    __touch(14620);
    DoGPass.prototype.updateEdgeColor = function (color) {
        this.differenceMaterial.shader.uniforms.edgeColor = [
            color[0],
            color[1],
            color[2],
            1
        ];
        __touch(14656);
    };
    __touch(14621);
    DoGPass.prototype.updateBackgroundColor = function (color) {
        this.differenceMaterial.shader.uniforms.backgroundColor = [
            color[0],
            color[1],
            color[2],
            1
        ];
        __touch(14657);
    };
    __touch(14622);
    DoGPass.prototype.updateBackgroundMix = function (amount) {
        this.differenceMaterial.shader.uniforms.backgroundMix = amount;
        __touch(14658);
    };
    __touch(14623);
    DoGPass.prototype.updateSize = function (size) {
        var sizeX = size.width / this.downsampleAmount;
        __touch(14659);
        var sizeY = size.height / this.downsampleAmount;
        __touch(14660);
        this.renderTargetX = new RenderTarget(sizeX, sizeY);
        __touch(14661);
        this.gaussian1 = new RenderTarget(sizeX, sizeY);
        __touch(14662);
        this.gaussian2 = new RenderTarget(sizeX, sizeY);
        __touch(14663);
        this.blurX = [
            0.5 / sizeX,
            0
        ];
        __touch(14664);
        this.blurY = [
            0,
            0.5 / sizeY
        ];
        __touch(14665);
    };
    __touch(14624);
    DoGPass.prototype.updateSigma = function (sigma) {
        var kernel1 = this.convolutionShader1.buildKernel(sigma);
        __touch(14666);
        var kernel2 = this.convolutionShader2.buildKernel(1.6 * sigma);
        __touch(14667);
        var kernelSize = kernel1.length;
        __touch(14668);
        this.convolutionShader1.defines = {
            'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
            'KERNEL_SIZE_INT': kernelSize.toFixed(0)
        };
        __touch(14669);
        kernelSize = kernel2.length;
        __touch(14670);
        this.convolutionShader2.defines = {
            'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
            'KERNEL_SIZE_INT': kernelSize.toFixed(0)
        };
        __touch(14671);
        this.convolutionShader1.uniforms.cKernel = kernel1;
        __touch(14672);
        this.convolutionShader2.uniforms.cKernel = kernel2;
        __touch(14673);
        this.convolutionMaterial1 = new Material(this.convolutionShader1);
        __touch(14674);
        this.convolutionMaterial2 = new Material(this.convolutionShader2);
        __touch(14675);
    };
    __touch(14625);
    DoGPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
        this.renderable.materials[0] = this.convolutionMaterial1;
        __touch(14676);
        this.convolutionMaterial1.setTexture('DIFFUSE_MAP', readBuffer);
        __touch(14677);
        this.convolutionShader1.uniforms.uImageIncrement = this.blurX;
        __touch(14678);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);
        __touch(14679);
        this.convolutionMaterial1.setTexture('DIFFUSE_MAP', this.renderTargetX);
        __touch(14680);
        this.convolutionShader1.uniforms.uImageIncrement = this.blurY;
        __touch(14681);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.gaussian1, true);
        __touch(14682);
        this.renderable.materials[0] = this.convolutionMaterial2;
        __touch(14683);
        this.convolutionMaterial2.setTexture('DIFFUSE_MAP', readBuffer);
        __touch(14684);
        this.convolutionShader2.uniforms.uImageIncrement = this.blurX;
        __touch(14685);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);
        __touch(14686);
        this.convolutionMaterial2.setTexture('DIFFUSE_MAP', this.renderTargetX);
        __touch(14687);
        this.convolutionShader2.uniforms.uImageIncrement = this.blurY;
        __touch(14688);
        renderer.render(this.renderable, FullscreenUtil.camera, [], this.gaussian2, true);
        __touch(14689);
        this.renderable.materials[0] = this.differenceMaterial;
        __touch(14690);
        this.differenceMaterial.setTexture('BLUR1', this.gaussian1);
        __touch(14691);
        this.differenceMaterial.setTexture('BLUR2', this.gaussian2);
        __touch(14692);
        this.differenceMaterial.setTexture('ORIGINAL', readBuffer);
        __touch(14693);
        if (this.target !== null) {
            renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
            __touch(14694);
        } else {
            renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
            __touch(14695);
        }
    };
    __touch(14626);
    return DoGPass;
    __touch(14627);
});
__touch(14614);
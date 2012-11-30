define(['goo/renderer/Renderer', 'goo/renderer/Camera', 'goo/renderer/TextureCreator', 'goo/renderer/Material', 'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/pass/RenderTarget', 'goo/renderer/Util'], function(Renderer, Camera, TextureCreator, Material, FullscreenUtil, RenderTarget,
	Util) {
	"use strict";

	function BloomPass(strength, kernelSize, sigma, sizeX, sizeY) {
		strength = (strength !== undefined) ? strength : 1.0;
		kernelSize = (kernelSize !== undefined) ? kernelSize : 25;
		sigma = (sigma !== undefined) ? sigma : 4.0;
		sizeX = (sizeX !== undefined) ? sizeX : 256;
		sizeY = (sizeY !== undefined) ? sizeY : 256;

		this.renderTargetX = new RenderTarget(sizeX, sizeY);
		this.renderTargetY = new RenderTarget(sizeX, sizeY);

		this.renderable = {
			meshData : FullscreenUtil.quad,
			materials : []
		};

		this.copyShader = Util.clone(Material.shaders.copy);
		this.copyShader.uniforms.opacity.value = strength;
		this.copyMaterial = Material.createMaterial(this.copyShader);
		this.copyMaterial.blendState.blending = 'AdditiveBlending';

		this.convolutionShader = Util.clone(Material.shaders.convolution);
		this.convolutionShader.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};
		this.convolutionShader.uniforms.uImageIncrement = BloomPass.blurX;
		this.convolutionShader.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
		this.convolutionMaterial = Material.createMaterial(this.convolutionShader);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	BloomPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		this.renderable.materials[0] = this.convolutionMaterial;

		this.convolutionMaterial.textures[0] = readBuffer;
		this.convolutionShader.uniforms.uImageIncrement.value = BloomPass.blurX;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);

		this.convolutionMaterial.textures[0] = this.renderTargetX;
		this.convolutionShader.uniforms.uImageIncrement.value = BloomPass.blurY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);

		this.renderable.materials[0] = this.copyMaterial;
		this.copyMaterial.textures[0] = this.renderTargetY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
	};

	BloomPass.blurX = [0.001953125, 0.0];
	BloomPass.blurY = [0.0, 0.001953125];

	return BloomPass;
});
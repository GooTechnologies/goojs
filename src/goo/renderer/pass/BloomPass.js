define([
	'goo/renderer/Material',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib'
], function (
	Material,
	FullscreenUtil,
	RenderTarget,
	Util,
	ShaderLib
) {
	"use strict";

	/**
	 * <pre>
	 * settings: {
	 *     strength : 1.0,
	 *     kernelSize : 25,
	 *     sigma : 4.0,
	 *     sizeX : 256,
	 *     sizeY : 256
	 * }
	 * </pre>
	 */
	function BloomPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var strength = settings.strength !== undefined ? settings.strength : 0.0;
		var kernelSize = settings.kernelSize !== undefined ? settings.kernelSize : 25;
		var sigma = settings.sigma !== undefined ? settings.sigma : 4.0;
		var sizeX = settings.sizeX !== undefined ? settings.sizeX : 256;
		var sizeY = settings.sizeY !== undefined ? settings.sizeY : 256;

		this.renderTargetX = new RenderTarget(sizeX, sizeY);
		this.renderTargetY = new RenderTarget(sizeX, sizeY);

		this.renderable = {
			meshData : FullscreenUtil.quad,
			materials : []
		};

		this.copyMaterial = Material.createMaterial(ShaderLib.copyPure);
		this.copyMaterial.uniforms.opacity = strength;
		this.copyMaterial.blendState.blending = 'AdditiveBlending';

		this.convolutionShader = Util.clone(ShaderLib.convolution);
		this.convolutionShader.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};
		this.convolutionMaterial = Material.createMaterial(this.convolutionShader);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;
		this.convolutionMaterial.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);

		this.bcMaterial = Material.createMaterial(ShaderLib.brightnesscontrast);
		this.bcMaterial.uniforms.brightness = 0.0;
		this.bcMaterial.uniforms.contrast = 0.5;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	BloomPass.prototype.render = function(renderer, writeBuffer, readBuffer) {
		// Brightness & contrast
		this.renderable.materials[0] = this.bcMaterial;

		this.bcMaterial.setTexture('DIFFUSE_MAP', readBuffer);
		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);

		// Blur Y
		this.renderable.materials[0] = this.convolutionMaterial;

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);

		// Blur X
		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);

		// Additive blend
		this.renderable.materials[0] = this.copyMaterial;
		this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
		}
	};

	BloomPass.blurX = [0.001953125, 0.0];
	BloomPass.blurY = [0.0, 0.001953125];

	return BloomPass;
});
define([
	'goo/renderer/Material',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib'
], function(
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
	 *     target : null,
	 *     strength : 1.0,
	 *     kernelSize : 25,
	 *     sigma : 4.0,
	 *     sizeX : 256,
	 *     sizeY : 256
	 * }
	 * </pre>
	 */
	function BlurPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var strength = settings.strength !== undefined ? settings.strength : 1.0;
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

		this.copyShader = Util.clone(ShaderLib.copyPure);
		this.copyShader.uniforms.opacity = strength;
		this.copyMaterial = Material.createMaterial(this.copyShader);

		this.convolutionShader = Util.clone(ShaderLib.convolution);
		this.convolutionShader.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};
		this.convolutionShader.uniforms.uImageIncrement = BlurPass.blurX;
		this.convolutionShader.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
		this.convolutionMaterial = Material.createMaterial(this.convolutionShader);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	BlurPass.prototype.render = function(renderer, writeBuffer, readBuffer) {
		this.renderable.materials[0] = this.convolutionMaterial;

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', readBuffer);
		this.convolutionMaterial.uniforms.uImageIncrement = BlurPass.blurY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionMaterial.uniforms.uImageIncrement = BlurPass.blurX;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetY, true);

		this.renderable.materials[0] = this.copyMaterial;
		this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
		}
	};

	BlurPass.blurX = [0.001953125, 0.0];
	BlurPass.blurY = [0.0, 0.001953125];

	return BlurPass;
});
define([
		'goo/renderer/Renderer',
		'goo/renderer/Camera',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/pass/RenderTarget',
		'goo/renderer/Util',
		'goo/renderer/shaders/ShaderLib'
	],
	function(
		Renderer,
		Camera,
		TextureCreator,
		Material,
		FullscreenUtil,
		RenderTarget,
		Util,
		ShaderLib
	) {
	"use strict";

	/*
	*	Difference of Gaussian Filter pass. 
	*	Usable for edge detection.
	*	
	*	A lower sigma will create thinner edgelines, tune to get the sweetspot.
	*	Maximum sigma is 2.5.
	*	
	*	http://en.wikipedia.org/wiki/Difference_of_Gaussians
	*	http://www.tara.tcd.ie/bitstream/2262/12840/1/eg07.pdf , Adaptive Abstraction of 3D Scenes in Real-Time by Redmond and Dingliana, 2007
	*/
	function DoGPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var sizeX = settings.sizeX !== undefined ? settings.sizeX : 512;
		var sizeY = settings.sizeY !== undefined ? settings.sizeY : 512;
		var sigma = settings.sigma !== undefined ? settings.sigma : 0.6;
		var threshold = settings.threshold !== undefined ? settings.threshold : 0.005;

		if (sigma > 2.5) {
			sigma = 2.5;
		}

		this.renderTargetX = new RenderTarget(sizeX, sizeY);

		this.gaussian1 = new RenderTarget(sizeX, sizeY);
		this.gaussian2 = new RenderTarget(sizeX, sizeY);

		this.renderable = {
			meshData : FullscreenUtil.quad,
			materials : []
		};

		this.convolutionShader1 = Util.clone(ShaderLib.convolution);
		this.convolutionShader2 = Util.clone(ShaderLib.convolution);

		this.differenceShader = Util.clone(ShaderLib.differenceOfGaussians);
		this.differenceShader.uniforms.threshold = threshold;
		this.differenceMaterial = Material.createMaterial(this.differenceShader);

		// Use a ratio between the sigmas of 1.6 to approximate the Laplacian of Gaussian [Marr–Hildreth].
		// The max kernelsize is 2.5 , as implemented at this time in the convolutionShader, this means the max sigma to be used properly is 4.0
		var kernel1 = this.convolutionShader1.buildKernel(sigma);
		var kernel2 = this.convolutionShader2.buildKernel(1.6 * sigma);

		var kernelSize = kernel1.length;

		this.convolutionShader1.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};

		kernelSize = kernel2.length;

		this.convolutionShader2.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};

		this.convolutionShader1.uniforms.cKernel = kernel1;
		this.convolutionShader2.uniforms.cKernel = kernel2;

		this.blurX = [0.5 / sizeX, 0.0];
		this.blurY = [0.0, 0.5 / sizeY];

		this.convolutionMaterial1 = Material.createMaterial(this.convolutionShader1);
		this.convolutionMaterial2 = Material.createMaterial(this.convolutionShader2);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	DoGPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

		// Gaussian sigma1
		this.renderable.materials[0] = this.convolutionMaterial1;

		this.convolutionMaterial1.textures[0] = readBuffer;
		this.convolutionShader1.uniforms.uImageIncrement = this.blurX;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);

		this.convolutionMaterial1.textures[0] = this.renderTargetX;
		this.convolutionShader1.uniforms.uImageIncrement = this.blurY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.gaussian1, true);

		// Gaussian sigma2 
		this.renderable.materials[0] = this.convolutionMaterial2;

		this.convolutionMaterial2.textures[0] = readBuffer;
		this.convolutionShader2.uniforms.uImageIncrement = this.blurX;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.renderTargetX, true);

		this.convolutionMaterial2.textures[0] = this.renderTargetX;
		this.convolutionShader2.uniforms.uImageIncrement = this.blurY;

		renderer.render(this.renderable, FullscreenUtil.camera, [], this.gaussian2, true);

		// OUT
		this.renderable.materials[0] = this.differenceMaterial;
		// produces the difference gaussian1 - gaussian2
		this.differenceMaterial.textures[0] = this.gaussian1;
		this.differenceMaterial.textures[1] = this.gaussian2;
		this.differenceMaterial.textures[2] = readBuffer;

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], readBuffer, this.clear);
		}
	};

	return DoGPass;
});
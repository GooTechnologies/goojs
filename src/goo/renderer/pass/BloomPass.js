define(['goo/renderer/Renderer', 'goo/renderer/Camera', 'goo/renderer/TextureCreator', 'goo/renderer/Material', 'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/pass/RenderTarget', 'goo/renderer/Util', 'goo/renderer/pass/BlurPass'],
	function (Renderer, Camera, TextureCreator, Material, FullscreenUtil, RenderTarget, Util, BlurPass) {
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
		BlurPass.call(this, settings);

		this.copyMaterial.blendState.blending = 'AdditiveBlending';
	}

	BloomPass.prototype = Object.create(BlurPass.prototype);

	return BloomPass;
});
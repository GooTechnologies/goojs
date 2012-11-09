define(['goo/renderer/Renderer', 'goo/shapes/ShapeCreator', 'goo/renderer/Camera', 'goo/renderer/TextureCreator', 'goo/renderer/Material'], function(
	Renderer, ShapeCreator, Camera, TextureCreator, Material) {
	"use strict";

	function FullscreenPass(shader) {
		this.material = Material.createDefaultMaterial(shader);
		this.useReadBuffer = true;

		this.renderToScreen = false;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	FullscreenPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		if (this.useReadBuffer) {
			this.material.textures[0] = readBuffer;
		}

		var renderable = {
			meshData : FullscreenPass.quad,
			materials : [this.material],
		};

		if (this.renderToScreen) {
			renderer.render([renderable], FullscreenPass.camera, [], null, this.clear);
		} else {
			renderer.render([renderable], FullscreenPass.camera, [], writeBuffer, this.clear);
		}
	};

	FullscreenPass.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	FullscreenPass.quad = ShapeCreator.createPlaneData(2, 2);

	return FullscreenPass;
});
define(['goo/renderer/Renderer', 'goo/shapes/ShapeCreator', 'goo/renderer/Camera', 'goo/renderer/TextureCreator'], function(Renderer, ShapeCreator,
	Camera, TextureCreator) {
	"use strict";

	function FullscreenPass(material) {
		this.material = material;
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
	FullscreenPass.quad = ShapeCreator.createPlaneData(0.5, 0.5);

	return FullscreenPass;
});
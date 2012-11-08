define(['goo/renderer/Renderer', 'goo/shapes/ShapeCreator', 'goo/renderer/Camera'], function(Renderer, ShapeCreator, Camera) {
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

		var renderInfo = {
			meshData : FullscreenPass.quad,
			materials : [this.material],
			camera : FullscreenPass.camera
		};

		if (this.renderToScreen) {
			renderer.renderMesh(renderInfo);
		} else {
			renderer.renderMesh(renderInfo, writeBuffer);
		}
	};

	FullscreenPass.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	FullscreenPass.quad = ShapeCreator.createPlaneData(2, 2);

	return FullscreenPass;
});
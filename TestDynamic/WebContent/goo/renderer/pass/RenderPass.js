define(['goo/renderer/Renderer', 'goo/math/Vector', 'goo/math/Vector4'], function(Renderer, Vector, Vector4) {
	"use strict";

	function RenderPass(renderList) {
		this.renderList = renderList;

		this.clearColor = new Vector4(0.0, 0.0, 0.0, 0.0);
		this.oldClearColor = new Vector4();
		this.renderToScreen = false;

		this.overrideMaterial = null;

		this.enabled = true;
		this.clear = true;
		this.needsSwap = false;
	}

	RenderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		if (this.clearColor) {
			Vector.copy(renderer.clearColor, this.oldClearColor);
			renderer.setClearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
		}

		// TODO: how to get lights?
		renderer.overrideMaterial = this.overrideMaterial;
		if (this.renderToScreen) {
			renderer.render(this.renderList, Renderer.mainCamera, []);
		} else {
			renderer.render(this.renderList, Renderer.mainCamera, [], readBuffer, this.clear);
		}
		renderer.overrideMaterial = null;

		if (this.clearColor) {
			renderer.setClearColor(this.oldClearColor.r, this.oldClearColor.g, this.oldClearColor.b, this.oldClearColor.a);
		}
	};

	return RenderPass;
});
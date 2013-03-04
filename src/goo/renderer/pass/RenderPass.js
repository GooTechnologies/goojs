define(['goo/renderer/Renderer', 'goo/math/Vector', 'goo/math/Vector4'],
	/** @lends RenderPass */
	function (Renderer, Vector, Vector4) {
	"use strict";

	/**
	 * @class A pass that renders provided renderlist to the rendertarget or screen
	 */
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

	// RenderPasses may have a fourth additional parameter called delta
	RenderPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		if (this.clearColor) {
			this.oldClearColor.setv(renderer.clearColor);
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
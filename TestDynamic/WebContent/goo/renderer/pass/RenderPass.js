define(function() {
	"use strict";

	function RenderPass(renderList) {
		this.renderList = renderList;

		this.enabled = true;
		this.clear = true;
		this.needsSwap = false;
	}

	RenderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		// if (this.clearColor) {
		// this.oldClearColor.copy(renderer.getClearColor());
		// this.oldClearAlpha = renderer.getClearAlpha();
		//
		// renderer.setClearColor(this.clearColor, this.clearAlpha);
		// }

		renderer.render(this.renderList, readBuffer);

		// if (this.clearColor) {
		// renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
		// }
	};

	return RenderPass;
});
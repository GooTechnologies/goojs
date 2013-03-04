define(['goo/renderer/pass/RenderTarget', 'goo/renderer/pass/FullscreenPass',
	'goo/renderer/shaders/ShaderLib'],
	/** @lends Composer */
	function (RenderTarget, FullscreenPass,
	ShaderLib) {
	"use strict";

	var WebGLRenderingContext = window.WebGLRenderingContext;

	/**
	 * @class Post processing handler
	 * @param {RenderTarget} renderTarget Data to wrap
	 * @property {RenderTarget} renderTarget Data to wrap
	 */
	function Composer(renderTarget) {
		this.renderTarget1 = renderTarget;

		if (this.renderTarget1 === undefined) {
			var width = window.innerWidth || 1;
			var height = window.innerHeight || 1;

			this.renderTarget1 = new RenderTarget(width, height);
		}

		this.renderTarget2 = this.renderTarget1.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.passes = [];

		this.copyPass = new FullscreenPass(ShaderLib.copy);
	}

	Composer.prototype.swapBuffers = function () {
		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	};

	Composer.prototype.addPass = function (pass) {
		this.passes.push(pass);
	};

	Composer.prototype.render = function (renderer, delta) {
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;
		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i++) {
			pass = this.passes[i];
			if (!pass.enabled) {
				continue;
			}

			pass.render(renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

			if (pass.needsSwap) {
				if (maskActive) {
					var context = this.renderer.context;
					context.stencilFunc(WebGLRenderingContext.NOTEQUAL, 1, 0xffffffff);
					this.copyPass.render(renderer, this.writeBuffer, this.readBuffer, delta);
					context.stencilFunc(WebGLRenderingContext.EQUAL, 1, 0xffffffff);
				}
				this.swapBuffers();
			}

			// TODO
			// if (pass instanceof MaskPass) {
			// maskActive = true;
			// } else if (pass instanceof ClearMaskPass) {
			// maskActive = false;
			// }
		}
	};

	return Composer;
});
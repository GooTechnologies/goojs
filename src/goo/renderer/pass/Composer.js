define(['goo/renderer/pass/RenderTarget', 'goo/renderer/pass/FullscreenPass',
	'goo/renderer/shaders/ShaderLib'],
	/** @lends */
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
		this._clearColor = [0,0,0,1];
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

	Composer.prototype.setClearColor = function(color) {
		this._clearColor[0] = color[0];
		this._clearColor[1] = color[1];
		this._clearColor[2] = color[2];
		this._clearColor[3] = color[3];
	};

	Composer.prototype.render = function (renderer, delta, camera, lights) {
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;
		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i++) {
			pass = this.passes[i];
			if (!pass.enabled) {
				continue;
			}

			pass.render(renderer, this.writeBuffer, this.readBuffer, delta, maskActive, camera, lights, this._clearColor);

			if (pass.needsSwap) {
				if (maskActive) {
					var context = this.renderer.context;
					context.stencilFunc(WebGLRenderingContext.NOTEQUAL, 1, 0xffffffff);
					this.copyPass.render(renderer, this.writeBuffer, this.readBuffer, delta, camera, lights);
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
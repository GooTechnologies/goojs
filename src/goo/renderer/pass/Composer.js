var RenderTarget = require('../../renderer/pass/RenderTarget');
var FullscreenPass = require('../../renderer/pass/FullscreenPass');
var ShaderLib = require('../../renderer/shaders/ShaderLib');
var SystemBus = require('../../entities/SystemBus');

/**
 * Post processing handler
 * @param {RenderTarget} renderTarget Data to wrap
 * @property {RenderTarget} renderTarget Data to wrap
 */
function Composer(renderTarget) {
	this._passedWriteBuffer = !!renderTarget;
	this.writeBuffer = renderTarget;

	if (this.writeBuffer === undefined) {
		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;

		this.writeBuffer = new RenderTarget(width, height);
	}

	this.readBuffer = this.writeBuffer.clone();

	this.passes = [];
	this._clearColor = [0, 0, 0, 1];
	this.copyPass = new FullscreenPass(ShaderLib.copy);

	this.size = null;
	this.dirty = false;

	this._viewportResizeHandler = function (size) {
		this.dirty = true;
		this.size = size;
	}.bind(this);

	SystemBus.addListener('goo.viewportResize', this._viewportResizeHandler, true);
}

/**
 * Deallocate all allocated WebGL buffers, listeners, and passes.
 * @param  {Renderer} renderer
 */
Composer.prototype.destroy = function (renderer) {
	this.deallocateBuffers(renderer);
	for (var i = 0; i < this.passes.length; i++) {
		var pass = this.passes[i];
		pass.destroy(renderer);
	}
	SystemBus.removeListener('goo.viewportResize', this._viewportResizeHandler);
};

/**
 * Deallocate the read and write buffers.
 * @param {Renderer} renderer
 */
Composer.prototype.deallocateBuffers = function (renderer) {
	if (this.writeBuffer && !this._passedWriteBuffer) {
		this.writeBuffer.destroy(renderer.context);
	}
	if (this.readBuffer) {
		this.readBuffer.destroy(renderer.context);
	}
	this.copyPass.destroy(renderer);
};

Composer.prototype.swapBuffers = function () {
	var tmp = this.readBuffer;
	this.readBuffer = this.writeBuffer;
	this.writeBuffer = tmp;
};

Composer.prototype._checkPassResize = function (pass, size) {
	return !pass.viewportSize ||
		pass.viewportSize.x !== size.x ||
		pass.viewportSize.y !== size.y ||
		pass.viewportSize.width !== size.width ||
		pass.viewportSize.height !== size.height;
};

Composer.prototype.addPass = function (pass, renderer) {
	this.passes.push(pass);
	if (pass.updateSize && this.size && this._checkPassResize(pass, this.size)) {
		pass.updateSize(this.size, renderer);
		pass.viewportSize = this.size;
	}
};

Composer.prototype.setClearColor = function (color) {
	this._clearColor[0] = color[0];
	this._clearColor[1] = color[1];
	this._clearColor[2] = color[2];
	this._clearColor[3] = color[3];
};

Composer.prototype.updateSize = function (renderer) {
	var size = this.size;
	if (!size) {
		return;
	}
	var width = size.width;
	var height = size.height;

	this.deallocateBuffers(renderer);

	this.writeBuffer = new RenderTarget(width, height);
	this.readBuffer = this.writeBuffer.clone();

	for (var i = 0, il = this.passes.length; i < il; i++) {
		var pass = this.passes[i];
		if (pass.updateSize && this._checkPassResize(pass, size)) {
			pass.updateSize(size, renderer);
			pass.viewportSize = size;
		}
	}
};

Composer.prototype.render = function (renderer, delta, camera, lights) {
	if (this.dirty) {
		this.updateSize(renderer);
		this.dirty = false;
	}

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
				context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
				this.copyPass.render(renderer, this.writeBuffer, this.readBuffer, delta, camera, lights);
				context.stencilFunc(context.EQUAL, 1, 0xffffffff);
			}
			this.swapBuffers();
		}
	}
};

module.exports = Composer;
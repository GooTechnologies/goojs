define([
	'goo/renderer/Renderer',
	'goo/renderer/RendererRecord',
	'goo/renderer/pass/RenderTarget'
], function (
	Renderer,
	RendererRecord,
	RenderTarget
) {
	'use strict';

	Renderer.prototype.invalidateBuffer = function (buffer) {
		buffer.glBuffer = null;
	};

	Renderer.prototype.invalidateMeshData = function (meshData) {
		this.invalidateBuffer(meshData.vertexData);
		if (meshData.indexData) {
			this.invalidateBuffer(meshData.indexData);
		}
	};

	Renderer.prototype.invalidateTexture = function (texture) {
		texture.glTexture = null;
		delete texture.textureRecord;
	};

	Renderer.prototype.invalidateShader = function (shader) {
		shader.shaderProgram = null;
		shader.vertexShader = null;
		shader.fragmentShader = null;
	};

	Renderer.prototype.invalidateMaterial = function (material) {
		var keys = Object.keys(material._textureMaps);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var texture = material._textureMaps[key];
			this.invalidateTexture(texture);
		}

		this.invalidateShader(material.shader);
	};

	Renderer.prototype.invalidateRenderTarget = function (renderTarget) {
		renderTarget.glTexture = null;
		renderTarget._glRenderBuffer = null;
		renderTarget._glFrameBuffer = null;
	};

	Renderer.prototype.invalidateComposer = function (composer) {
		if (composer.writeBuffer && !composer._passedWriteBuffer) {
			this.invalidateRenderTarget(composer.writeBuffer);
		}
		if (composer.readBuffer) {
			this.invalidateRenderTarget(composer.readBuffer);
		}

		composer.copyPass.invalidateHandles(this);

		for (var i = 0; i < composer.passes.length; i++) {
			var pass = composer.passes[i];
			// every pass has to do its own internal cleaning
			pass.invalidateHandles(this);
		}

		// should not need to do this
//		composer.writeBuffer = new RenderTarget(composer.size.width, composer.size.height);
		composer.readBuffer = composer.writeBuffer.clone();
		// composer.dirty = true; // should not be needed
	};

	Renderer.prototype._restoreContext = function () {
		this.establishContext();

		this.rendererRecord = new RendererRecord();

		this.context.clearColor(
			this._clearColor[0],
			this._clearColor[1],
			this._clearColor[2],
			this._clearColor[3]
		);
	};
});
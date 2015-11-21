var Renderer = require('../renderer/Renderer');
var RendererRecord = require('../renderer/RendererRecord');

	'use strict';

	Renderer.prototype.invalidateBuffer = function (buffer) {
		buffer.glBuffer = null;
	};

	Renderer.prototype.invalidateMeshData = function (meshData) {
		this.invalidateBuffer(meshData.vertexData);
		if (meshData.indexData) {
			this.invalidateBuffer(meshData.indexData);
		}
		if (meshData.wireframeData) {
			this.invalidateMeshData(meshData.wireframeData);
		}
		if (meshData.flatMeshData) {
			this.invalidateMeshData(meshData.flatMeshData);
		}
	};

	Renderer.prototype.invalidateTexture = function (texture) {
		texture.glTexture = null;
		texture.textureRecord = {};
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
		delete renderTarget.textureRecord;
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
	};

	Renderer.prototype.invalidatePicking = function () {
		if (this.hardwarePicking) {
			if (this.hardwarePicking.pickingTarget) {
				this.invalidateRenderTarget(this.hardwarePicking.pickingTarget);
			}
			this.invalidateMaterial(this.hardwarePicking.pickingMaterial);
		}
	};

	Renderer.prototype._restoreContext = function () {
		this.establishContext();

		this.rendererRecord = new RendererRecord();

		this.context.clearColor(
			this._clearColor.x,
			this._clearColor.y,
			this._clearColor.z,
			this._clearColor.w
		);
	};
});
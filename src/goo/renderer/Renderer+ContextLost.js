define([
	'goo/renderer/Renderer',
	'goo/renderer/RendererRecord'
], function (
	Renderer,
	RendererRecord
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
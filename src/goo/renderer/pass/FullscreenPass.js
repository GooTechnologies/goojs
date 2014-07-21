define([
	'goo/renderer/Material',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/Pass'
],
/** @lends */
function (
	Material,
	FullscreenUtil,
	ShaderLib,
	Pass
) {
	'use strict';

	/** @class */
	function FullscreenPass(shader) {
		this.material = new Material(shader || ShaderLib.simple);
		this.useReadBuffer = true;

		this.renderToScreen = false;

		this.renderable = {
			meshData: FullscreenUtil.quad,
			materials: [this.material]
		};

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	FullscreenPass.prototype = Object.create(Pass.prototype);
	FullscreenPass.prototype.constructor = FullscreenPass;

	FullscreenPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		if (this.useReadBuffer) {
			this.material.setTexture('DIFFUSE_MAP', readBuffer);
		}

		if (this.renderToScreen) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
		}
	};

	FullscreenPass.prototype.destroy = function (/* renderer */) {
		this.material.shader.destroy();
	};

	return FullscreenPass;
});
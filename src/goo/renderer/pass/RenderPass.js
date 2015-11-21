var Renderer = require('goo/renderer/Renderer');
var Pass = require('goo/renderer/pass/Pass');
var Vector4 = require('goo/math/Vector4');

	'use strict';

	/**
	 * A pass that renders provided renderlist to the rendertarget or screen
	 */
	function RenderPass(renderList, filter) {
		this.renderList = renderList;
		this.filter = filter;

		this.clearColor = new Vector4(0.0, 0.0, 0.0, 0.0);
		this.oldClearColor = new Vector4();
		this.renderToScreen = false;

		this.overrideMaterial = null;

		this.enabled = true;
		this.clear = true;
		this.needsSwap = false;
		this.viewportSize = undefined;
	}

	RenderPass.prototype = Object.create(Pass.prototype);
	RenderPass.prototype.constructor = RenderPass;

	// RenderPasses may have a fourth additional parameter called delta
	RenderPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta, maskActive, camera, lights, clearColor) {
		camera = camera || Renderer.mainCamera;

		if (!camera) {
			return;
		}

		lights = lights || [];
		if (clearColor && false) {
			this.oldClearColor.set(renderer.clearColor);
			renderer.setClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
		}

		var renderList;
		if (this.filter) {
			renderList = this.renderList.filter(this.filter);
		} else {
			renderList = this.renderList;
		}
		if (this.renderToScreen) {
			renderer.render(renderList, camera, lights, null, this.clear, this.overrideMaterial);
		} else {
			renderer.render(renderList, camera, lights, readBuffer, this.clear, this.overrideMaterial);
		}

		if (this.clearColor && false) {
			renderer.setClearColor(this.oldClearColor.x, this.oldClearColor.y, this.oldClearColor.z, this.oldClearColor.w);
		}
	};

	module.exports = RenderPass;
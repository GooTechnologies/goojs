define([
	'goo/renderer/Material',
		'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/shaders/ShaderLib'
		],
	function (
	Material,
		FullscreenUtil,
		ShaderLib
		) {
		"use strict";

		function FullscreenPass(shader) {
			this.material = Material.createMaterial(shader || ShaderLib.simple);
			this.useReadBuffer = true;

			this.renderToScreen = false;

			this.renderable = {
				meshData : FullscreenUtil.quad,
				materials : [this.material]
			};

			this.enabled = true;
			this.clear = false;
			this.needsSwap = true;
		}

		FullscreenPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
			if (this.useReadBuffer) {
				this.material.textures[0] = readBuffer;
			}

			if (this.renderToScreen) {
				renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
			} else {
				renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
			}
		};

		return FullscreenPass;
	});
define([
		'goo/renderer/Renderer',
		'goo/renderer/Camera',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/shaders/ShaderLib'
		],
	function (
		Renderer,
		Camera,
		TextureCreator,
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

		FullscreenPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
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
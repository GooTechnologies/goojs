define(['goo/entities/systems/System', 'goo/renderer/TextureCreator', 'goo/renderer/Util', 'goo/entities/EventHandler'], function(System,
	TextureCreator, Util, EventHandler) {
	"use strict";

	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null);

		this.renderList = renderList;
		this.doRender = true;

		this.camera = null;
		this.lights = [];

		var that = this;
		EventHandler.addListener({
			setCurrentCamera : function(camera) {
				that.camera = camera;
			},
			setLights : function(lights) {
				that.lights = lights;
			}
		});
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		renderer.checkResize(this.camera);

		if (!this.doRender) {
			return;
		}

		if (this.camera) {
			renderer.render(this.renderList, this.camera, this.lights);
		}
	};

	return RenderSystem;
});
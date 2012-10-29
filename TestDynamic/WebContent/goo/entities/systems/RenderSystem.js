define(['goo/entities/systems/System', 'goo/renderer/TextureCreator', 'goo/renderer/Util'], function(System,
	TextureCreator, Util) {
	"use strict";

	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null, true);

		this.renderList = renderList;
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		renderer.checkResize();

		renderer.clear();

		for ( var i in this.renderList) {
			this.renderEntity(renderer, this.renderList[i]);
		}

		renderer.flush();
	};

	RenderSystem.prototype.renderEntity = function(renderer, entity) {
		var meshData = entity.meshDataComponent.meshData;
		var materials = entity.meshRendererComponent.materials;

		var shaderInfo = {
			meshData : meshData,
			transform : entity.transformComponent.worldTransform,
			lights : entity._world.getManager('LightManager').lights
		};

		renderer.render(meshData, materials, shaderInfo);
	};

	return RenderSystem;
});
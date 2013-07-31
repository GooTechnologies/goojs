define([
	'goo/entities/systems/System',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'goo/debug/components/MarkerComponent',
	'goo/renderer/Renderer'],
	/** @lends */
	function (
		System,
		Material,
		ShaderLib,
		ShapeCreator,
		MarkerComponent,
		Renderer
	) {
	"use strict";

	/**
	 * @class Processes all entities with a marker component
	 */
	function MarkerSystem(goo) {
		System.call(this, 'MarkerSystem', ['MarkerComponent']);

		this.material = Material.createMaterial(ShaderLib.simpleColored, '');
		this.material.depthState.enabled = false;
		this.material.shader.uniforms.color = [0.0, 1.0, 0.0];
		this.material.wireframe = true;

		this.goo = goo;
		this.renderer = this.goo.renderer;

		// drawing needs to be performed AFTER the render system completes its execution
		this.entities = [];
		var that = this;
		this.goo.callbacks.push(function() {
			for (var i = 0; i < that.entities.length; i++) {
				var entity = that.entities[i];
				var transform = entity.transformComponent.transform;

				var renderableMarker = {
					meshData: entity.markerComponent.meshData,
					materials: [that.material],
					transform: transform
				};

				that.goo.renderer.render(renderableMarker, Renderer.mainCamera, [], null, false);
			}
		});
	}

	MarkerSystem.prototype = Object.create(System.prototype);

	MarkerSystem.prototype.process = function (entities) {
		this.entities = entities;
	};

	return MarkerSystem;
});
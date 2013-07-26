define([
	'goo/entities/systems/System',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/LightPointer'],
	/** @lends */
	function (
		System,
		MeshDataComponent,
		MeshRendererComponent,
		Material,
		ShaderLib,
		LightPointer
	) {
	"use strict";

	/**
	 * @class Processes all entities with a light debug component
	 */
	function LightDebugSystem() {
		System.call(this, 'LightDebugSystem', ['LightDebugComponent']);
	}

	LightDebugSystem.prototype = Object.create(System.prototype);

	LightDebugSystem.prototype.inserted = function (entity) {
		var light = entity.lightComponent.light;

		var meshData = LightPointer.getMeshData(light);
		entity.setComponent(new MeshDataComponent(meshData));

		var material = Material.createMaterial(ShaderLib.simpleColored, '');
		material.uniforms.color = [
			light.color.data[0],
			light.color.data[1],
			light.color.data[2]
		];

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, entity.transformComponent.worldTransform);
	};

	LightDebugSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var light = entity.lightComponent.light;
			if(light.changedProperties) {
				entity.meshDataComponent.meshData = LightPointer.getMeshData(light);
				entity.meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, entity.transformComponent.worldTransform);
			}
			if(light.changedColor) {
				entity.meshRendererComponent.materials[0].uniforms.color = [
					light.color.data[0],
					light.color.data[1],
					light.color.data[2]
				];
			}
		}
	};

	return LightDebugSystem;
});
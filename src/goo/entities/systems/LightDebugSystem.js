define([
	'goo/entities/systems/System',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
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
	/*
	 * REVIEW:
	 * I think all debug drawing should be collected in a DebugDrawComponent/System
	 * I also think the system shouldn't update the entity, but do a separate render call
	 * (Renderer.render(renderList, ...))
	 *
	 * Also the meshes should be reused and not rebuilt every process, you could visualize all light and
	 * camera properties with transforms.
	 * If you do this I think you could skip the changedProperties and changedColor and still get decent
	 * performance.
	 *
	 * The DebugDrawSystem shouldn't be added to world by default, it should be a parameter of some sort.
	 * You should also be able to turn it off an on by setting DebugDrawSystem.passive to true or false
	 *
	 * Come to think of it, you could even skip the debugdrawcomponent, and let the components add their
	 * own debug geometry!
	 * So entity.lightComponent.getDebugGeometry() would hand you meshData, materials and a transform.
	 * Then you combine it with entity.transformComponent.worldTransform and voila, you have a modular
	 * debugdraw system!
	 */

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
				light.changedProperties = false;
				entity.meshDataComponent.meshData = LightPointer.getMeshData(light);
				entity.meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, entity.transformComponent.worldTransform);
			}
			if(light.changedColor) {
				light.changedColor = false;
				entity.meshRendererComponent.materials[0].uniforms.color = [
					light.color.data[0],
					light.color.data[1],
					light.color.data[2]
				];
			}
		}
	};

	LightDebugSystem.prototype.deleted = function(entity) {
		entity.clearComponent('MeshDataComponent');
		entity.clearComponent('MeshRendererComponent');
	};

	return LightDebugSystem;
});
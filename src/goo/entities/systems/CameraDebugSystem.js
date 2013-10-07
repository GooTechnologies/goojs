define([
	'goo/entities/systems/System',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/FrustumViewer'],
	/** @lends */
	function (
		System,
		MeshDataComponent,
		MeshRendererComponent,
		Material,
		ShaderLib,
		FrustumViewer
	) {
	"use strict";

	/**
	 * @class Processes all entities with a camera debug component
	 */
	function CameraDebugSystem() {
		System.call(this, 'CameraDebugSystem', ['CameraDebugComponent']);
	}

	CameraDebugSystem.prototype = Object.create(System.prototype);

	CameraDebugSystem.prototype.inserted = function (entity) {
		var camera = entity.cameraComponent.camera;

		var meshData = FrustumViewer.getMeshData(camera);
		entity.setComponent(new MeshDataComponent(meshData));

		var material = Material.createMaterial(ShaderLib.simpleColored, '');
		material.uniforms.color = [0.4, 0.7, 1.0];

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, entity.transformComponent.worldTransform);
	};

	CameraDebugSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var camera = entity.cameraComponent.camera;
			if(camera.changedProperties) {
				entity.meshDataComponent.meshData = FrustumViewer.getMeshData(camera);
				entity.meshRendererComponent.updateBounds(entity.meshDataComponent.modelBound, entity.transformComponent.worldTransform);
				camera.changedProperties = false;
			}
		}
	};

	CameraDebugSystem.prototype.deleted = function(entity) {
		entity.clearComponent('MeshDataComponent');
		entity.clearComponent('MeshRendererComponent');
	};

	return CameraDebugSystem;
});
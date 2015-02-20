define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib'
],
function (
	System,
	SystemBus,
	Sphere,
	SphereCollider,
	Quaternion,
	Vector3,
	Transform,
	Material,
	ShaderLib
) {
	'use strict';

	/* global CANNON */

	/**
	 * @extends System
	 */
	function PhysicsDebugRenderSystem() {
		System.call(this, 'PhysicsDebugRenderSystem', ['TransformComponent']);

		this.priority = -1; // make sure it processes after transformsystem and collidersystem

		this.renderList = [];
		this.camera = null;
		this.lights = [];

		var that = this;
		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			that.camera = newCam.camera;
		});

		SystemBus.addListener('goo.setLights', function (lights) {
			that.lights = lights;
		});

		this.sphereMeshData = new Sphere(20, 20, 1);
		this.material = new Material(ShaderLib.simpleLit);
	}
	PhysicsDebugRenderSystem.prototype = Object.create(System.prototype);
	PhysicsDebugRenderSystem.prototype.constructor = PhysicsDebugRenderSystem;

	var tmpQuaternion = new Quaternion();
	var tmpPosition = new Vector3();

	PhysicsDebugRenderSystem.prototype.process = function (entities) {
		this.renderList.length = 0;

		for (var i = 0, N = entities.length; i !== N; i++) {
			var entity = entities[i];

			// Colliders in rigid bodies
			if (entity.colliderComponent && entity.colliderComponent.bodyEntity && entity.colliderComponent.bodyEntity.rigidbodyComponent) {
				var bodyEntity = entity.colliderComponent.bodyEntity;

				// Get the transform of the collider in the physics world
				var transform = new Transform();
				bodyEntity.rigidbodyComponent.getQuaternion(tmpQuaternion);
				bodyEntity.rigidbodyComponent.getPosition(tmpPosition);

				// These should really sit in the RigidbodyComponent
				var cannonBody = bodyEntity.rigidbodyComponent.cannonBody;
				var cannonShapeIndex = cannonBody.shapes.indexOf(entity.colliderComponent.cannonShape);
				var cannonLocalShapePosition = cannonBody.shapeOffsets[cannonShapeIndex];
				var cannonLocalShapeQuaternion = cannonBody.shapeOrientations[cannonShapeIndex];
				var cannonWorldShapePosition = new CANNON.Vec3();
				var cannonWorldShapeQuaternion = new CANNON.Quaternion();
				cannonBody.quaternion.mult(cannonLocalShapeQuaternion, cannonWorldShapeQuaternion);
				cannonBody.quaternion.vmult(cannonLocalShapePosition, cannonWorldShapePosition);

				// Convert translation
				var translation = transform.translation;
				translation.x = cannonWorldShapePosition.x;
				translation.y = cannonWorldShapePosition.y;
				translation.z = cannonWorldShapePosition.z;

				// Convert quaternion
				tmpQuaternion.x = cannonWorldShapeQuaternion.x;
				tmpQuaternion.y = cannonWorldShapeQuaternion.y;
				tmpQuaternion.z = cannonWorldShapeQuaternion.z;
				tmpQuaternion.w = cannonWorldShapeQuaternion.w;
				transform.rotation.copyQuaternion(tmpQuaternion);
				transform.update();

				var collider = entity.colliderComponent.collider;

				var meshData;
				if (collider instanceof SphereCollider) {
					meshData = this.sphereMeshData;
				}

				var renderable = {
					meshData: meshData,
					transform: transform,
					materials: [this.material]
				};

				this.renderList.push(renderable);
			}
		}
	};

	PhysicsDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, this.lights, null, false);
		}
	};

	/**
	 * @private
	 */
	//PhysicsDebugRenderSystem.prototype.inserted = function (entity) {
		// TODO: check if MeshCollider, and create it in that case
	//};

	/**
	 * @private
	 */
	//PhysicsDebugRenderSystem.prototype.deleted = function (entity) {
	//};

	return PhysicsDebugRenderSystem;
});
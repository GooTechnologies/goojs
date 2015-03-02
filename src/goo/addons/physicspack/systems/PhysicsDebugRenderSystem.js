define([
	'goo/entities/EntitySelection',
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/addons/physicspack/shapes/PhysicsPlaneDebugShape',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/addons/physicspack/util/RenderablePool'
],
function (
	EntitySelection,
	System,
	SystemBus,
	Sphere,
	Box,
	Cylinder,
	PhysicsPlaneDebugShape,
	SphereCollider,
	BoxCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,
	Quaternion,
	Vector3,
	Transform,
	Material,
	ShaderLib,
	RenderablePool
) {
	'use strict';

	/* global CANNON */

	/**
	 * Renders all ColliderComponents in the scene.
	 * @extends System
	 * @example
	 * world.setSystem(new PhysicsDebugRenderSystem());
	 */
	function PhysicsDebugRenderSystem() {
		System.call(this, 'PhysicsDebugRenderSystem', ['TransformComponent']);

		this.priority = 3;

		this.renderList = [];
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		/**
		 * If set to true, all entities with any physics in them will be debug rendered, and the selection will be disregarded.
		 * @type {Boolean}
		 */
		this.renderAll = true;

		/**
		 * The selected entities to be rendered.
		 * @type {EntitySelection}
		 */
		this.selection = new EntitySelection();

		this.sphereMeshData = new Sphere(8, 8, 1);
		this.boxMeshData = new Box(1, 1, 1);
		this.cylinderMeshData = new Cylinder(10, 1, 1, 1);
		this.planeMeshData = new PhysicsPlaneDebugShape();

		this.material = new Material(ShaderLib.simpleColored);
		this.material.uniforms.color = [0, 1, 0];
		this.material.wireframe = true;
		this.renderablePool = new RenderablePool();
	}
	PhysicsDebugRenderSystem.prototype = Object.create(System.prototype);
	PhysicsDebugRenderSystem.prototype.constructor = PhysicsDebugRenderSystem;

	var tmpQuaternion = new Quaternion();

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsDebugRenderSystem.prototype.process = function (entities) {
		this.clear();

		for (var i = 0, N = entities.length; i !== N; i++) {
			var entity = entities[i];

			if (!this.renderAll && !this.selection.contains(entity)) {
				// Render selection is enabled, but this entity is not a part of it
				continue;
			}

			// Colliders
			if (entity.colliderComponent && entity.colliderComponent.bodyEntity && entity.colliderComponent.bodyEntity.rigidbodyComponent) {
				var bodyEntity = entity.colliderComponent.bodyEntity;

				var cannonBody = bodyEntity.rigidbodyComponent.cannonBody;
				if (!cannonBody || !entity.colliderComponent.cannonShape) {
					continue;
				}

				var collider = entity.colliderComponent.worldCollider;
				var meshData = this.getMeshData(collider);
				var renderable = this.renderablePool.get(meshData, this.material);

				this.getWorldTransform(bodyEntity, entity, collider, renderable.transform);
				renderable.transform.update();

				this.renderList.push(renderable);
			}

			// TODO: Joints
		}
	};

	// Cannot allocate these until CANNON is loaded for sure.
	var cannonWorldShapePosition;
	var cannonWorldShapeQuaternion;

	/**
	 * Get the world transform of the debug rendering mesh data from a collider.
	 * @private
	 * @param  {Entity} bodyEntity
	 * @param  {Entity} colliderEntity
	 * @param  {Collider} collider
	 * @param  {Transform} targetTransform
	 */
	PhysicsDebugRenderSystem.prototype.getWorldTransform = function (bodyEntity, colliderEntity, collider, targetTransform) {
		var cannonBody = bodyEntity.rigidbodyComponent.cannonBody;
		cannonWorldShapePosition = cannonWorldShapePosition || new CANNON.Vec3();
		cannonWorldShapeQuaternion = cannonWorldShapeQuaternion || new CANNON.Quaternion();

		var cannonShapeIndex = cannonBody.shapes.indexOf(colliderEntity.colliderComponent.cannonShape);
		var cannonLocalShapePosition = cannonBody.shapeOffsets[cannonShapeIndex];
		var cannonLocalShapeQuaternion = cannonBody.shapeOrientations[cannonShapeIndex];
		cannonBody.quaternion.mult(cannonLocalShapeQuaternion, cannonWorldShapeQuaternion);
		cannonBody.quaternion.vmult(cannonLocalShapePosition, cannonWorldShapePosition);
		cannonWorldShapePosition.vadd(cannonBody.position, cannonWorldShapePosition);

		// Convert translation
		var translation = targetTransform.translation;
		translation.x = cannonWorldShapePosition.x;
		translation.y = cannonWorldShapePosition.y;
		translation.z = cannonWorldShapePosition.z;

		// Convert quaternion
		tmpQuaternion.x = cannonWorldShapeQuaternion.x;
		tmpQuaternion.y = cannonWorldShapeQuaternion.y;
		tmpQuaternion.z = cannonWorldShapeQuaternion.z;
		tmpQuaternion.w = cannonWorldShapeQuaternion.w;
		targetTransform.rotation.copyQuaternion(tmpQuaternion);

		if (collider instanceof SphereCollider) {
			var scale = collider.radius;
			targetTransform.scale.set(scale, scale, scale);
		} else if (collider instanceof BoxCollider) {
			targetTransform.scale.copy(collider.halfExtents).mul(2);
		} else if (collider instanceof CylinderCollider) {
			targetTransform.scale.set(collider.radius, collider.radius, collider.height);
		} else if (collider instanceof PlaneCollider) {
			targetTransform.scale.set(1, 1, 1);
		} else if (collider instanceof MeshCollider) {
			targetTransform.scale.setVector(collider.scale);
		}
	};

	/**
	 * Get mesh data to use for debug rendering.
	 * @private
	 * @param  {Collider} collider
	 * @returns {MeshData}
	 */
	PhysicsDebugRenderSystem.prototype.getMeshData = function (collider) {
		var meshData;
		if (collider instanceof SphereCollider) {
			meshData = this.sphereMeshData;
		} else if (collider instanceof BoxCollider) {
			meshData = this.boxMeshData;
		} else if (collider instanceof CylinderCollider) {
			meshData = this.cylinderMeshData;
		} else if (collider instanceof PlaneCollider) {
			meshData = this.planeMeshData;
		} else if (collider instanceof MeshCollider) {
			meshData = collider.meshData;
		}
		return meshData;
	};

	/**
	 * @private
	 * @param  {Renderer} renderer
	 */
	PhysicsDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, null, null, false);
		}
	};

	/**
	 * Release all previous renderables in the renderList
	 * @private
	 */
	PhysicsDebugRenderSystem.prototype.clear = function () {
		for (var i = 0, N = this.renderList.length; i !== N; i++) {
			this.renderablePool.release(this.renderList[i]);
		}
		this.renderList.length = 0;
	};

	/**
	 * @private
	 */
	PhysicsDebugRenderSystem.prototype.cleanup = function () {
		this.clear();
	};

	return PhysicsDebugRenderSystem;
});
define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/TextureGrid',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
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
	Box,
	Cylinder,
	TextureGrid,
	SphereCollider,
	BoxCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,
	Quaternion,
	Vector3,
	Transform,
	Material,
	ShaderLib
) {
	'use strict';

	/* global CANNON */

	/**
	 * Renders all ColliderComponents in the scene.
	 * @extends System
	 */
	function PhysicsDebugRenderSystem() {
		System.call(this, 'PhysicsDebugRenderSystem', ['TransformComponent']);

		this.priority = -1;

		this.renderList = [];
		this.renderablePool = [];
		this.camera = null;
		this.lights = [];

		var that = this;
		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			that.camera = newCam.camera;
		});

		SystemBus.addListener('goo.setLights', function (lights) {
			that.lights = lights;
		});

		this.sphereMeshData = new Sphere(8, 8, 1);
		this.boxMeshData = new Box(1, 1, 1);
		this.cylinderMeshData = new Cylinder(10, 1, 1, 1);
		this.planeMeshData = this.createPlaneMeshData();
		this.material = new Material(ShaderLib.simpleColored);
		this.material.uniforms.color = [0, 1, 0];
		this.material.wireframe = true;
	}
	PhysicsDebugRenderSystem.prototype = Object.create(System.prototype);
	PhysicsDebugRenderSystem.prototype.constructor = PhysicsDebugRenderSystem;

	/**
	 * @private
	 * @return {MeshData}
	 */
	PhysicsDebugRenderSystem.prototype.createPlaneMeshData = function () {
		var matrix = [];
		for (var i = 0; i < 10; i++) {
			var row = [];
			for (var j = 0; j < 10; j++) {
				row.push(0);
			}
			matrix.push(row);
		}
		var meshData = new TextureGrid(matrix, 1);

		// Move all verts so it's centered
		var verts = meshData.getAttributeBuffer('POSITION');
		for (var i = 0; i < verts.length / 3; i++) {
			verts[i * 3] -= 5;
			verts[i * 3 + 1] += 5;
		}

		return meshData;
	};

	var tmpQuaternion = new Quaternion();
	var tmpPosition = new Vector3();

	// Cannot allocate these until CANNON is loaded for sure.
	var cannonWorldShapePosition;
	var cannonWorldShapeQuaternion;

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsDebugRenderSystem.prototype.process = function (entities) {
		// Release all previous renderables
		for (var i = 0, N = this.renderList.length; i !== N; i++) {
			this.releaseRenderable(this.renderList[i]);
		}
		this.renderList.length = 0;

		cannonWorldShapePosition = cannonWorldShapePosition || new CANNON.Vec3();
		cannonWorldShapeQuaternion = cannonWorldShapeQuaternion || new CANNON.Quaternion();

		for (var i = 0, N = entities.length; i !== N; i++) {
			var entity = entities[i];

			// Colliders in rigid bodies
			if (entity.colliderComponent && entity.colliderComponent.bodyEntity && entity.colliderComponent.bodyEntity.rigidbodyComponent) {
				var bodyEntity = entity.colliderComponent.bodyEntity;

				// Get the transform of the collider in the physics world
				bodyEntity.rigidbodyComponent.getQuaternion(tmpQuaternion);
				bodyEntity.rigidbodyComponent.getPosition(tmpPosition);

				// These should really sit in the RigidbodyComponent
				var cannonBody = bodyEntity.rigidbodyComponent.cannonBody;
				if (!cannonBody || !entity.colliderComponent.cannonShape) {
					continue;
				}

				var renderable = this.getRenderable();
				var transform = renderable.transform;

				var cannonShapeIndex = cannonBody.shapes.indexOf(entity.colliderComponent.cannonShape);
				var cannonLocalShapePosition = cannonBody.shapeOffsets[cannonShapeIndex];
				var cannonLocalShapeQuaternion = cannonBody.shapeOrientations[cannonShapeIndex];
				cannonBody.quaternion.mult(cannonLocalShapeQuaternion, cannonWorldShapeQuaternion);
				cannonBody.quaternion.vmult(cannonLocalShapePosition, cannonWorldShapePosition);
				cannonWorldShapePosition.vadd(cannonBody.position, cannonWorldShapePosition);

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

				var collider = entity.colliderComponent.worldCollider;
				var meshData;
				if (collider instanceof SphereCollider) {
					meshData = this.sphereMeshData;
					var scale = collider.radius;
					transform.scale.set(scale, scale, scale);
				} else if (collider instanceof BoxCollider) {
					meshData = this.boxMeshData;
					transform.scale.copy(collider.halfExtents).mul(2);
				} else if (collider instanceof CylinderCollider) {
					meshData = this.cylinderMeshData;
					transform.scale.set(collider.radius, collider.radius, collider.height);
				} else if (collider instanceof PlaneCollider) {
					meshData = this.planeMeshData;
					transform.scale.set(1, 1, 1);
				} else if (collider instanceof MeshCollider) {
					meshData = collider.meshData;
					transform.scale.set(1, 1, 1);
				}

				transform.update();
				renderable.meshData = meshData;

				this.renderList.push(renderable);
			}
		}
	};

	/**
	 * @private
	 * @return {Object}
	 */
	PhysicsDebugRenderSystem.prototype.getRenderable = function () {
		var renderable = this.renderablePool.length ? this.renderablePool.pop() : {
			meshData: null,
			transform: new Transform(),
			materials: [this.material]
		};
		return renderable;
	};

	/**
	 * @private
	 * @param {Object} renderable
	 */
	PhysicsDebugRenderSystem.prototype.releaseRenderable = function (renderable) {
		renderable.meshData = null;
		this.renderablePool.push(renderable);
	};

	PhysicsDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, this.lights, null, false);
		}

	};

	return PhysicsDebugRenderSystem;
});
define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Quaternion',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData'
],
/** @lends */
function(
	System,
	BoundingBox,
	BoundingSphere,
	Quaternion,
	Box,
	Quad,
	Sphere,
	MeshData
) {
	"use strict";

	var CANNON = window.CANNON;

	/**
	 * @class Handles integration with Cannon.js.
	 * Depends on the global CANNON object,
	 * so load cannon.js using a script tag before using this system.
	 * See also {@link CannonComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {number} settings.stepFrequency (defaults to 60)
	 * @example
	 * var cannonSystem = new CannonSystem({stepFrequency:60});
	 * goo.world.setSystem(cannonSystem);
	 */
	function CannonSystem(settings) {
		System.call(this, 'CannonSystem', ['CannonComponent', 'TransformComponent']);

		settings = settings || {};

		var world = this.world = new CANNON.World();
		world.gravity.y = -9.82;
		world.broadphase = new CANNON.NaiveBroadphase();

		this.stepFrequency = settings.stepFrequency || 60;

		this.quat = new Quaternion();
	}

	CannonSystem.prototype = Object.create(System.prototype);

	CannonSystem.prototype.createShape = function(entity) {
		var cannonComponent = entity.cannonComponent;
		var transformComponent = entity.transformComponent;

		var shape;
		if (!entity.meshDataComponent) {
			var children = transformComponent.children;
			for (var i = 0; i < children.length; i++) {
				var childEntity = children[i].entity;
				var childShape = this.createShape(childEntity);
				if (childShape) {
					if (!shape) {
						shape = new CANNON.Compound();
					}

					var childTranslation = childEntity.transformComponent.transform.translation;
					var childOrientation = childEntity.transformComponent.transform.rotation;
					var offset = new CANNON.Vec3(childTranslation.x, childTranslation.y, childTranslation.z);
					this.quat.fromRotationMatrix(childOrientation);
					var orientation = new CANNON.Quaternion(this.quat.x, this.quat.y, this.quat.z, this.quat.w);

					shape.addChild(childShape, offset, orientation);
				}
			}
		} else {
			var meshDataComponent = entity.meshDataComponent;

			if (cannonComponent.useBounds) {
				meshDataComponent.computeBoundFromPoints();
				var bound = meshDataComponent.modelBound;
				if (bound instanceof BoundingBox) {
					shape = new CANNON.Box(new CANNON.Vec3(bound.xExtent, bound.yExtent, bound.zExtent));
				} else if (bound instanceof BoundingSphere) {
					shape = new CANNON.Sphere(bound.radius);
				}
			} else {
				var meshData = meshDataComponent.meshData;
				if (meshData instanceof Box) {
					shape = new CANNON.Box(new CANNON.Vec3(meshData.xExtent, meshData.yExtent, meshData.zExtent));
				} else if (meshData instanceof Sphere) {
					shape = new CANNON.Sphere(meshData.radius);
				} else if (meshData instanceof Quad) {
					shape = new CANNON.Plane();
				} else {
					var points = [];
					var faces = [];

					var vbuf = meshData.getAttributeBuffer(MeshData.POSITION);
					var indices = meshData.getIndexBuffer();

					for (var i = 0; i < meshData.vertexCount*3; i+=3) {
						points.push(new CANNON.Vec3(vbuf[i], vbuf[i+1], vbuf[i+2]));
					}
					for (var i = 0; i < meshData.indexCount; i += 3) {
						var face = [indices[i], indices[i + 1], indices[i + 2]];
						faces.push(face);
					}

					shape = new CANNON.ConvexPolyhedron(points, faces);
				}
			}
		}

		return shape;
	};

	CannonSystem.prototype.inserted = function(entity) {
		var cannonComponent = entity.cannonComponent;
		var transformComponent = entity.transformComponent;

		var shape = this.createShape(entity);
		if (!shape) {
			entity.clearComponent('CannonComponent');
			return;
		}

		var body = new CANNON.RigidBody(cannonComponent.mass, shape);
		body.position.set(transformComponent.transform.translation.x, transformComponent.transform.translation.y, transformComponent.transform.translation.z);
		this.quat.fromRotationMatrix(transformComponent.transform.rotation);
		body.quaternion.set(this.quat.x, this.quat.y, this.quat.z, this.quat.w);
		cannonComponent.body = body;

		//b.aabbNeedsUpdate = true;
		this.world.add(body);
	};

	CannonSystem.prototype.deleted = function(entity) {
		var cannonComponent = entity.cannonComponent;

		if (cannonComponent) {
			this.world.remove(cannonComponent.body);
		}
	};

	CannonSystem.prototype.process = function(entities /*, tpf */) {
		this.world.step(1 / this.stepFrequency);

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var cannonComponent = entity.cannonComponent;

			var position = cannonComponent.body.position;
			entity.transformComponent.setTranslation( position.x, position.y, position.z);

			var cannonQuat = cannonComponent.body.quaternion;
			this.quat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			entity.transformComponent.transform.rotation.copyQuaternion(this.quat);
			entity.transformComponent.setUpdated();
		}
	};

	return CannonSystem;
});

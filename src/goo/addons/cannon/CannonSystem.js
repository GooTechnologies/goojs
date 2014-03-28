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
	'use strict';

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
		System.call(this, 'CannonSystem', ['CannonRigidbodyComponent','TransformComponent']);

		settings = settings || {};

		var world = this.world = new CANNON.World();
		world.gravity.y = -9.82;
		world.broadphase = new CANNON.NaiveBroadphase();

		this.stepFrequency = settings.stepFrequency || 60;

		this.quat = new Quaternion();
	}

	CannonSystem.prototype = Object.create(System.prototype);

	CannonSystem.prototype.createShape = function(entity) {
		var shape;
		var rbComponent = entity.cannonRigidbodyComponent;

		if (!entity.cannonColliderComponent) {
			// No collider. Check children.
			shape = new CANNON.Compound();

			var that = this;
			entity.traverse(function(entity){
				if(entity.cannonColliderComponent){

					// TODO: Should look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					var t = entity.transformComponent.transform;
					var trans = t.translation;
					var rot = t.rotation;
					var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
					var q = that.quat;
					q.fromRotationMatrix(rot);
					var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
					shape.addChild(entity.cannonColliderComponent.cannonShape, offset, orientation);
				}
			});

		} else {

			// Entity has a collider on the root
			// Create a simple shape
			shape = entity.cannonColliderComponent.cannonShape;
		}

		return shape;
	};

	CannonSystem.prototype.inserted = function(entity) {
		var rbComponent = entity.cannonRigidbodyComponent;
		var transformComponent = entity.transformComponent;

		var shape = this.createShape(entity);
		if (!shape) {
			entity.clearComponent('CannonComponent');
			return;
		}

		var body = new CANNON.RigidBody(rbComponent.mass, shape);
		body.position.set(transformComponent.transform.translation.x, transformComponent.transform.translation.y, transformComponent.transform.translation.z);
		this.quat.fromRotationMatrix(transformComponent.transform.rotation);
		body.quaternion.set(this.quat.x, this.quat.y, this.quat.z, this.quat.w);
		rbComponent.body = body;

		//b.aabbNeedsUpdate = true;
		this.world.add(body);
	};

	CannonSystem.prototype.deleted = function(entity) {
		var rbComponent = entity.cannonRigidbodyComponent;

		if (rbComponent) {
			this.world.remove(rbComponent.body);
		}
	};

	CannonSystem.prototype.process = function(entities /*, tpf */) {
		this.world.step(1 / this.stepFrequency);

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var cannonComponent = entity.cannonRigidbodyComponent;

			var position = cannonComponent.body.position;
			entity.transformComponent.setTranslation(position.x, position.y, position.z);

			var cannonQuat = cannonComponent.body.quaternion;
			this.quat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			entity.transformComponent.transform.rotation.copyQuaternion(this.quat);
			entity.transformComponent.setUpdated();
		}
	};

	return CannonSystem;
});

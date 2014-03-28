define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	System,
	BoundingBox,
	BoundingSphere,
	Quaternion,
	Transform,
	Vector3,
	_
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

		_.defaults(settings, {
			gravity :		new Vector3(0, -10, 0),
			stepFrequency : 60
		});

		var world = this.world = new CANNON.World();
		world.gravity.x = settings.gravity.x;
		world.gravity.y = settings.gravity.y;
		world.gravity.z = settings.gravity.z;
		world.broadphase = new CANNON.NaiveBroadphase();

		this.stepFrequency = settings.stepFrequency;

		this.quat = new Quaternion();
	}

	CannonSystem.prototype = Object.create(System.prototype);

	CannonSystem.prototype.inserted = function(entity) {
		var rbComponent = entity.cannonRigidbodyComponent;
		var transformComponent = entity.transformComponent;

		var shape = rbComponent.createShape(entity);
		if (!shape) {
			entity.clearComponent('CannonComponent');
			return;
		}

		var body = new CANNON.RigidBody(rbComponent.mass, shape);
		body.position.set(transformComponent.transform.translation.x, transformComponent.transform.translation.y, transformComponent.transform.translation.z);
		var v = rbComponent._initialVelocity;
		body.velocity.set(v.x, v.y, v.z);
		this.quat.fromRotationMatrix(transformComponent.transform.rotation);
		body.quaternion.set(this.quat.x, this.quat.y, this.quat.z, this.quat.w);
		rbComponent.body = body;

		//b.aabbNeedsUpdate = true;
		this.world.add(body);

		var c = entity.cannonDistanceJointComponent;
		if(c){
			this.world.addConstraint(c.createConstraint(entity));
		}
	};

	CannonSystem.prototype.deleted = function(entity) {
		var rbComponent = entity.cannonRigidbodyComponent;

		if (rbComponent) {
			// TODO: remove joints?
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

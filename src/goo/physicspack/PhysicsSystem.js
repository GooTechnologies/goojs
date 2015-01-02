define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Vector3',
	'goo/math/Quaternion'
],
/** @lends */
function (
	System,
	SystemBus,
	Vector3,
	Quaternion
) {
	'use strict';

	/**
	 * @class
	 */
	function PhysicsSystem(settings) {
		System.call(this, 'PhysicsSystem', ['TransformComponent', 'RigidbodyComponent']);

		settings = settings || {};

		this.priority = 1; // make sure it processes after transformsystem
		this.setGravity(settings.gravity || new Vector3(0, -10, 0));
		this.stepFrequency = settings.stepFrequency || 60;
		this.maxSubSteps = settings.maxSubSteps || 10;
	}
	PhysicsSystem.prototype = Object.create(System.prototype);

	PhysicsSystem.prototype.inserted = function (entity) {
		this.addBody(entity);
	};

	PhysicsSystem.prototype.deleted = function (entity) {
		this.removeBody(entity);
	};

	var tmpQuat = new Quaternion();

	PhysicsSystem.prototype.process = function (entities, tpf) {

		// Initialize bodies
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var rb = entity.rigidbodyComponent;

			if (rb._dirty) {
				rb.rigidbody.initialize(entity, this);
				rb._dirty = false;
			}
		}

		// Initialize joints - must be done *after* all bodies were initialized
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];

			var joints = entity.rigidbodyComponent.joints;
			//var bodyA = entity.rigidbodyComponent.rigidbody.cannonBody;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				if (!joint._dirty) {
					continue;
				}
				entity.rigidbodyComponent.rigidbody.initializeJoint(joint, entity, this);
				joint._dirty = false;
			}
		}

		this.step(tpf);

		// Update positions of entities from the physics data
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var rb = entity.rigidbodyComponent.rigidbody;
			var tc = entity.transformComponent;
			rb.getPosition(tc.transform.translation);
			rb.getQuaternion(tmpQuat);
			tc.transform.rotation.copyQuaternion(tmpQuat);
			tc.transform.update();
			tc.setUpdated();
		}
	};

	return PhysicsSystem;
});
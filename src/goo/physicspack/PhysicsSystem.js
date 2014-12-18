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
		this.step(tpf);

		// Update positions of entities from the physics data
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var rb = entity.rigidbodyComponent.rigidbody;
			var tc = entity.transformComponent;
			if (rb._dirty) {
				rb.initialize(entity, this);
				rb._dirty = false;
			}

			rb.getPosition(tc.transform.translation);
			rb.getQuaternion(tmpQuat);
			tc.transform.rotation.copyQuaternion(tmpQuat);
			tc.setUpdated();
		}
	};

	return PhysicsSystem;
});
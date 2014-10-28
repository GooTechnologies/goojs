define([
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/AmmoRigidbody'
],
/** @lends */
function (
	PhysicsSystem,
	AmmoRigidbody
) {
	'use strict';

	/* global Ammo */

	/**
	 * @class
	 */
	function AmmoPhysicsSystem() {
		this.world = new CANNON.World();
		PhysicsSystem.call(this);
	}
	AmmoPhysicsSystem.prototype = Object.create(PhysicsSystem.prototype);

	AmmoPhysicsSystem.prototype.setGravity = function (gravityVector) {
		this.world.gravity.copy(gravityVector);
	};

	AmmoPhysicsSystem.prototype.addBody = function (entity) {
		entity.rigidbodyComponent.rigidbody = new AmmoRigidbody(this.world, entity.rigidbodyComponent);
	};

	AmmoPhysicsSystem.prototype.step = function (deltaTime) {
		var world = this.world;

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps) {
			world.step(fixedTimeStep, deltaTime, maxSubSteps);
		} else {
			world.step(fixedTimeStep);
		}
	};

	return AmmoPhysicsSystem;
});
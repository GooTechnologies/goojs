define([
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/CannonRigidbody'
],
/** @lends */
function (
	PhysicsSystem,
	CannonRigidbody
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class
	 * @extends PhysicsSystem
	 */
	function CannonPhysicsSystem(settings) {
		PhysicsSystem.call(this, settings);

		/**
		 * @type {CANNON.World}
		 */
		this.world = new CANNON.World();
	}
	CannonPhysicsSystem.prototype = Object.create(PhysicsSystem.prototype);

	CannonPhysicsSystem.prototype.setGravity = function (gravityVector) {
		this.world.gravity.copy(gravityVector);
	};

	CannonPhysicsSystem.prototype.addBody = function (entity) {
		entity.rigidbodyComponent.rigidbody = new CannonRigidbody(entity);
	};

	CannonPhysicsSystem.prototype.step = function (deltaTime) {
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

	return CannonPhysicsSystem;
});
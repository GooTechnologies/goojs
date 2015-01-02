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
	function AmmoPhysicsSystem(settings) {
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		PhysicsSystem.call(this, settings);
	}
	AmmoPhysicsSystem.prototype = Object.create(PhysicsSystem.prototype);

	AmmoPhysicsSystem.prototype.setGravity = function (gravityVector) {
		var g = new Ammo.btVector3(gravityVector.x, gravityVector.y, gravityVector.z);
		this.world.setGravity(g);
		Ammo.destroy(g);
	};

	AmmoPhysicsSystem.prototype.addBody = function (entity) {
		entity.rigidbodyComponent.rigidbody = new AmmoRigidbody(this.world, entity.rigidbodyComponent.settings);
	};

	AmmoPhysicsSystem.prototype.step = function (tpf) {
		var world = this.world;

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		world.stepSimulation(tpf, maxSubSteps, fixedTimeStep);

		// TODO: Update kinematic bodies etc
	};

	return AmmoPhysicsSystem;
});
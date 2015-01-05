define([
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/cannon/CannonRigidbody'
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
		/**
		 * @type {CANNON.World}
		 */
		this.world = new CANNON.World();

		var that = this;
		this.world.addEventListener('postStep', function () {
			that.emitContactEvents();
		});

		this._entities = {};

		PhysicsSystem.call(this, settings);
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

	CannonPhysicsSystem.prototype.emitContactEvents = function () {
		// Get overlapping entities
		var contacts = this.world.contacts,
			num = contacts.length,
			entities = this._entities;

		this._swapContactLists();

		for (var i = 0; i !== num; i++) {
			var contact = contacts[i];

			var bodyA = contact.bi;
			var bodyB = contact.bj;
			var entityA = entities[bodyA.id];
			var entityB = entities[bodyB.id];

			if (bodyA.id > bodyB.id) {
				var tmp = entityA;
				entityA = entityB;
				entityB = tmp;
			}

			if (this._inContactLastStepA.indexOf(entityA) !== -1) {
				this.emitBeginContact(entityA, entityB);
			} else {
				this.emitDuringContact(entityA, entityB);
			}

			this._inContactCurrentStepA.push(entityA);
			this._inContactCurrentStepB.push(entityB);
		}

		// Emit end contact events
		for (var i = 0; i !== this._inContactLastStepA.length; i++) {
			var entityA = this._inContactLastStepA;
			var entityB = this._inContactLastStepB;

			var found = false;
			for (var j = 0; j !== this._inContactCurrentStepA.length; j++) {
				if (entityA === this._inContactLastStepA[i] && entityB === this._inContactLastStepB[i]) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.emitEndContact(entityA, entityB);
			}
		}
	};

	return CannonPhysicsSystem;
});
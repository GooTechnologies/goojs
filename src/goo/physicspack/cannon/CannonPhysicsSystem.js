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

	var tmpVec1;
	var tmpVec2;
	var tmpCannonResult;

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

		if (!tmpVec1) {
			tmpVec1 = new CANNON.Vec3();
			tmpVec2 = new CANNON.Vec3();
			tmpCannonResult = new CANNON.RaycastResult();
		}

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

			if (this._inContactLastStepA.indexOf(entityA) === -1) {
				this.emitBeginContact(entityA, entityB);
			} else {
				this.emitDuringContact(entityA, entityB);
			}

			this._inContactCurrentStepA.push(entityA);
			this._inContactCurrentStepB.push(entityB);
		}

		// Emit end contact events
		for (var i = 0; i !== this._inContactLastStepA.length; i++) {
			var entityA = this._inContactLastStepA[i];
			var entityB = this._inContactLastStepB[i];

			var found = false;
			for (var j = 0; j !== this._inContactCurrentStepA.length; j++) {
				if (entityA === this._inContactCurrentStepA[i] && entityB === this._inContactCurrentStepB[i]) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.emitEndContact(entityA, entityB);
			}
		}
	};

	CannonPhysicsSystem.prototype.raycastClosest = function (start, end, mask, result) {
		if (typeof(mask) !== 'number') {
			result = mask;
			mask = null;
		}
		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		cannonStart.copy(start);
		cannonEnd.copy(end);

		this.world.rayTest(cannonStart, cannonEnd, tmpCannonResult);

		if (tmpCannonResult.hasHit) {
			result.entity = this._entities[tmpCannonResult.body.id];
			var p = tmpCannonResult.hitPointWorld;
			var n = tmpCannonResult.hitNormalWorld;
			result.point.setDirect(p.x, p.y, p.z);
			result.normal.setDirect(n.x, n.y, n.z);
		}

		return tmpCannonResult.hasHit;
	};

	return CannonPhysicsSystem;
});
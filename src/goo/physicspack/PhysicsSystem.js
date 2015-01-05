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

	var tmpQuat = new Quaternion();

	/**
	 * @class
	 * @extends {System}
	 */
	function PhysicsSystem(settings) {
		System.call(this, 'PhysicsSystem', ['TransformComponent', 'RigidbodyComponent']);

		settings = settings || {};

		this.priority = 1; // make sure it processes after transformsystem
		this.setGravity(settings.gravity || new Vector3(0, -10, 0));

		/**
		 * @type {number}
		 */
		this.stepFrequency = settings.stepFrequency || 60;

		/**
		 * @type {number}
		 */
		this.maxSubSteps = settings.maxSubSteps || 10;

		this._inContactCurrentStepA = [];
		this._inContactCurrentStepB = [];
		this._inContactLastStepA = [];
		this._inContactLastStepB = [];
	}
	PhysicsSystem.prototype = Object.create(System.prototype);

	/**
	 * @param {Vector3} gravityVector
	 */
	PhysicsSystem.prototype.setGravity = function (/*gravityVector*/) {};

	PhysicsSystem.prototype.inserted = function (entity) {
		this.addBody(entity);
	};

	PhysicsSystem.prototype.deleted = function (entity) {
		this.removeBody(entity);
	};

	PhysicsSystem.beginContactEvent = {
		entityA: null,
		entityB: null
	};

	PhysicsSystem.duringContactEvent = {
		entityA: null,
		entityB: null
	};

	PhysicsSystem.endContactEvent = {
		entityA: null,
		entityB: null
	};

	PhysicsSystem.prototype.emitBeginContact = function (entityA, entityB) {
		var evt = PhysicsSystem.beginContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.beginContact', evt);
	};

	PhysicsSystem.prototype.emitDuringContact = function (entityA, entityB) {
		var evt = PhysicsSystem.duringContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.duringContact', evt);
	};

	PhysicsSystem.prototype.emitEndContact = function (entityA, entityB) {
		var evt = PhysicsSystem.endContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.endContact', evt);
	};

	PhysicsSystem.prototype._swapContactLists = function () {
		var tmp = this._inContactCurrentStepA;
		this._inContactCurrentStepA = this._inContactLastStepA;
		this._inContactLastStepA = tmp;
		this._inContactCurrentStepA.length = 0;

		tmp = this._inContactCurrentStepB;
		this._inContactCurrentStepB = this._inContactLastStepB;
		this._inContactLastStepB = tmp;
		this._inContactCurrentStepB.length = 0;
	};

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
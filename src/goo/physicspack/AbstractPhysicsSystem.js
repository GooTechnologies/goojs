define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
/** @lends */
function (
	System,
	SystemBus
) {
	'use strict';

	/**
	 * @class
	 * @extends {System}
	 */
	function AbstractPhysicsSystem() {
		System.apply(this, arguments);

		this.priority = 2; // make sure it processes after transformsystem and collidersystem
	}
	AbstractPhysicsSystem.constructor = AbstractPhysicsSystem;
	AbstractPhysicsSystem.prototype = Object.create(System.prototype);

	/**
	 * @virtual
	 * @param {Vector3} gravityVector
	 */
	AbstractPhysicsSystem.prototype.setGravity = function (/*gravityVector*/) {};

	AbstractPhysicsSystem.beginContactEvent = {
		entityA: null,
		entityB: null
	};

	AbstractPhysicsSystem.duringContactEvent = {
		entityA: null,
		entityB: null
	};

	AbstractPhysicsSystem.endContactEvent = {
		entityA: null,
		entityB: null
	};

	AbstractPhysicsSystem.prototype.emitBeginContact = function (entityA, entityB) {
		var evt = AbstractPhysicsSystem.beginContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.beginContact', evt);
		evt.entityA = null;
		evt.entityB = null;
	};

	AbstractPhysicsSystem.prototype.emitDuringContact = function (entityA, entityB) {
		var evt = AbstractPhysicsSystem.duringContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.duringContact', evt);
		evt.entityA = null;
		evt.entityB = null;
	};

	AbstractPhysicsSystem.prototype.emitEndContact = function (entityA, entityB) {
		var evt = AbstractPhysicsSystem.endContactEvent;
		evt.entityA = entityA;
		evt.entityB = entityB;
		SystemBus.emit('goo.physics.endContact', evt);
		evt.entityA = null;
		evt.entityB = null;
	};

	return AbstractPhysicsSystem;
});
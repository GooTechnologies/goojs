define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
function (
	System,
	SystemBus
) {
	'use strict';

	/**
	 * Base class for physics systems.
	 * @extends System
	 */
	function AbstractPhysicsSystem() {
		System.apply(this, arguments);

		this.priority = -1; // make sure it processes after transformsystem and collidersystem
	}
	AbstractPhysicsSystem.prototype = Object.create(System.prototype);
	AbstractPhysicsSystem.prototype.constructor = AbstractPhysicsSystem;

	/**
	 * @virtual
	 * @param {Vector3} gravityVector
	 */
	AbstractPhysicsSystem.prototype.setGravity = function (/*gravityVector*/) {};

	var event = {
		entityA: null,
		entityB: null
	};

	/**
	 * @private
	 */
	AbstractPhysicsSystem.prototype.emitSubStepEvent = function () {
		SystemBus.emit('goo.physics.substep');
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitBeginContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.beginContact', entityA, entityB);
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitDuringContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.duringContact', entityA, entityB);
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitEndContact = function (entityA, entityB) {
		this._emitEvent('goo.physics.endContact', entityA, entityB);
	};

	AbstractPhysicsSystem.prototype._emitEvent = function (channel, entityA, entityB) {
		event.entityA = entityA;
		event.entityB = entityB;
		SystemBus.emit(channel, event);
		event.entityA = null;
		event.entityB = null;
	};

	return AbstractPhysicsSystem;
});
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

		this.priority = 2; // make sure it processes after transformsystem and collidersystem
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
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitBeginContact = function (entityA, entityB) {
		event.entityA = entityA;
		event.entityB = entityB;
		SystemBus.emit('goo.physics.beginContact', event);
		event.entityA = null;
		event.entityB = null;
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitDuringContact = function (entityA, entityB) {
		event.entityA = entityA;
		event.entityB = entityB;
		SystemBus.emit('goo.physics.duringContact', event);
		event.entityA = null;
		event.entityB = null;
	};

	/**
	 * @private
	 * @param  {Entity} entityA
	 * @param  {Entity} entityB
	 */
	AbstractPhysicsSystem.prototype.emitEndContact = function (entityA, entityB) {
		event.entityA = entityA;
		event.entityB = entityB;
		SystemBus.emit('goo.physics.endContact', event);
		event.entityA = null;
		event.entityB = null;
	};

	return AbstractPhysicsSystem;
});
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

		/**
		 * Entitites that holds ColliderComponents, but aren't instantiated since they have no RigidBodyComponent
		 */
		this._activeColliderEntities = [];

		this._colliderInsertedListener = function (event) {
			this._activeColliderEntities.push(event.entity);
			this._colliderInserted(event.entity);
		}.bind(this);

		this._colliderDeletedListener = function (event) {
			var entities = this._activeColliderEntities;
			var index = entities.indexOf(event.entity);
			if (index !== -1) {
				this._activeColliderEntities.splice(index, 1);
			}
			this._colliderDeleted(event.entity);
		}.bind(this);

		this._colliderDeletedComponentListener = function (event) {
			this._colliderDeletedComponent(event.entity, event.component);
		}.bind(this);

		SystemBus.addListener('goo.collider.inserted', this._colliderInsertedListener);
		SystemBus.addListener('goo.collider.deleted', this._colliderDeletedListener);
		SystemBus.addListener('goo.collider.deletedComponent', this._colliderDeletedComponentListener);
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

	AbstractPhysicsSystem.prototype._colliderInserted = function (/*entity*/) {};
	AbstractPhysicsSystem.prototype._colliderDeleted = function (/*entity*/) {};

	return AbstractPhysicsSystem;
});
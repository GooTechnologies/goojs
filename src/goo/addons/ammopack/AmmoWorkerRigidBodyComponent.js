define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class Adds Ammo physics to an entity. Should be combined with one of the AmmoCollider components, such as the @link{AmmoSphereColliderComponent}. Also see {@link AmmoSystem}.
	 * @extends Component
	 * @param {Object} [settings]
	 */
	function AmmoWorkerRigidbodyComponent(settings) {
		this.type = "AmmoWorkerRigidbodyComponent";

		settings = settings || {};

		/**
		 * @private
		 * @type {AmmoWorkerSystem}
		 */
		this._system = null;

		/**
		 * @private
		 * @type {Entity}
		 */
		this._entity = null;

		/**
		 * @private
		 * @type {number}
		 */
		this._mass = typeof(settings.mass) === 'number' ? settings.mass : 1;
	}
	AmmoWorkerRigidbodyComponent.prototype = Object.create(Component.prototype);
	AmmoWorkerRigidbodyComponent.constructor = AmmoWorkerRigidbodyComponent;

	AmmoWorkerRigidbodyComponent.prototype.setLinearFactor = function (linearFactor) {
		this._system.postMessage({
			command: 'setLinearFactor',
			linearFactor: v2a(linearFactor)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setAngularFactor = function (angularFactor) {
		this._system.postMessage({
			command: 'setAngularFactor',
			angularFactor: v2a(angularFactor)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setFriction = function (friction) {
		this._system.postMessage({
			command: 'setFriction',
			friction: friction
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setSleepingThresholds = function (linear, angular) {
		//this.body.setSleepingThresholds(linear, angular);
		this._system.postMessage({
			command: 'setSleepingThresholds',
			linear: linear,
			angular: angular,
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setCenterOfMassTransform = function (position, quaternion) {
		this._system.postMessage({
			command: 'setCenterOfMassTransform',
			position: v2a(position),
			quaternion: v2a(quaternion),
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setLinearVelocity = function (velocity) {
		this._system.postMessage({
			command: 'setLinearVelocity',
			velocity: v2a(velocity)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralImpulse = function (impulse) {
		// this.body.applyCentralImpulse(pvec);
		this._system.postMessage({
			command: 'applyCentralImpulse',
			impulse: v2a(impulse)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralForce = function (force) {
		// this.body.applyCentralForce(pvec);
		this._system.postMessage({
			command: 'applyCentralForce',
			impulse: v2a(force)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.postMessage = function (message) {
		message.id = this._entity.id;
		this._system.postMessage(message);
	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerRigidbodyComponent;
});

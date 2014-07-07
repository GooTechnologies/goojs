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
		 * @type {Entity}
		 */
		this.entity = null;

		/**
		 * @private
		 * @type {number}
		 */
		this._mass = typeof(settings.mass) === 'number' ? settings.mass : 1;

		/**
		 * Queue for accumulating commands that are given before the entity was added to the system.
		 * @private
		 * @type {Array}
		 */
		this._queue = [];
	}
	AmmoWorkerRigidbodyComponent.prototype = Object.create(Component.prototype);
	AmmoWorkerRigidbodyComponent.constructor = AmmoWorkerRigidbodyComponent;

	/**
	 * Handles attaching itself to an entity.
	 * @private
	 * @param entity
	 */
	AmmoWorkerRigidbodyComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	AmmoWorkerRigidbodyComponent.prototype.detached = function (/*entity*/) {
		this.entity = null;
	};

	AmmoWorkerRigidbodyComponent.prototype.api = {
		setLinearVelocity: function () {
			AmmoWorkerRigidbodyComponent.prototype.setLinearVelocity.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setAngularVelocity: function () {
			AmmoWorkerRigidbodyComponent.prototype.setAngularVelocity.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setCenterOfMassTransform: function () {
			AmmoWorkerRigidbodyComponent.prototype.setCenterOfMassTransform.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		}
	};

	AmmoWorkerRigidbodyComponent.prototype.setLinearFactor = function (linearFactor) {
		this._postMessage({
			command: 'setLinearFactor',
			linearFactor: v2a(linearFactor)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setAngularFactor = function (angularFactor) {
		this._postMessage({
			command: 'setAngularFactor',
			angularFactor: v2a(angularFactor)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setFriction = function (friction) {
		this._postMessage({
			command: 'setFriction',
			friction: friction
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setSleepingThresholds = function (linear, angular) {
		//this.body.setSleepingThresholds(linear, angular);
		this._postMessage({
			command: 'setSleepingThresholds',
			linear: linear,
			angular: angular
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setCenterOfMassTransform = function (position, quaternion) {
		this._postMessage({
			command: 'setCenterOfMassTransform',
			position: v2a(position),
			quaternion: v2a(quaternion)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setLinearVelocity = function (velocity) {
		this._postMessage({
			command: 'setLinearVelocity',
			velocity: v2a(velocity)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.setAngularVelocity = function (velocity) {
		this._postMessage({
			command: 'setAngularVelocity',
			velocity: v2a(velocity)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralImpulse = function (impulse) {
		// this.body.applyCentralImpulse(pvec);
		this._postMessage({
			command: 'applyCentralImpulse',
			impulse: v2a(impulse)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralForce = function (force) {
		// this.body.applyCentralForce(pvec);
		this._postMessage({
			command: 'applyCentralForce',
			impulse: v2a(force)
		});
	};
	AmmoWorkerRigidbodyComponent.prototype._postMessage = function (message) {
		message.id = this.entity.id;
		if (!this._system) {
			this._queue.push(message);
			return;
		}
		this._system.postMessage(message);
	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerRigidbodyComponent;
});

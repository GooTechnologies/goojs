define([
	'goo/entities/components/Component',
	'goo/math/Quaternion'
],
/** @lends */
function (
	Component,
	Quaternion
) {
	'use strict';

	var tmpQuat = new Quaternion();

	/**
	 * @class Adds threaded Ammo physics to an entity. Should be combined with one of the AmmoCollider components, such as the @link{AmmoSphereColliderComponent}. Also see {@link AmmoWorkerSystem}.
	 * @extends Component
	 * @param {object} [settings]
	 * @param {number} [settings.mass=1]
	 * @param {number} [settings.type] Must be set to AmmoWorkerRigidbodyComponent.DYNAMIC, KINEMATIC, or STATIC. Defaults to DYNAMIC.
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
		 * @private
		 * @type {number}
		 */
		this._bodyType = typeof(settings.type) === 'number' ? settings.type : AmmoWorkerRigidbodyComponent.DYNAMIC;

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
	 * Dynamic object. Has a nonzero finite mass and responds to forces.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.DYNAMIC = 1;

	/**
	 * Static object. Non-moving and infinite mass.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.STATIC = 2;

	/**
	 * Kinematic body. Infinite mass but can move.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.KINEMATIC = 4;

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

	/**
	 * Scans attached colliders and instructs the worker to create the body.
	 */
	AmmoWorkerRigidbodyComponent.prototype._add = function () {
		var entity = this.entity;

		// Check if there are colliders on the second level
		var colliders = [];
		entity.traverse(function (child, level) {
			if (level === 1 && child.ammoColliderComponent) {
				colliders.push(child);
			}
		});

		// Check if the root entity has a collider
		if (entity.ammoColliderComponent) {
			colliders.push(entity);
		}

		if (!colliders.length) {
			return;
		}

		var shapeConfigs = [];

		// Update transforms
		entity.transformComponent.updateTransform();
		entity.transformComponent.updateWorldTransform();
		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];
			colliderEntity.transformComponent.updateTransform();
			colliderEntity.transformComponent.updateWorldTransform();
		}

		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];

			var colliderComponent = colliderEntity.ammoColliderComponent;
			var shapeConfig = colliderComponent.serialize();

			if (shapeConfig) {
				if (colliderEntity !== entity) {

					// Add local transform
					var pos = colliderEntity.transformComponent.transform.translation;
					shapeConfig.localPosition = v2a(pos);

					var rot = colliderEntity.transformComponent.transform.rotation;
					tmpQuat.fromRotationMatrix(rot);

					shapeConfig.localRotation = v2a(tmpQuat);
				}
				shapeConfigs.push(shapeConfig);
			}
		}

		// Allow no shapes?
		if (!shapeConfigs.length) {
			return;
		}

		var gooPos = entity.transformComponent.worldTransform.translation;
		var gooRot = entity.transformComponent.worldTransform.rotation;

		tmpQuat.fromRotationMatrix(gooRot);

		this._postMessage({
			command: 'addBody',
			id: entity.id,
			mass: entity.ammoWorkerRigidbodyComponent._mass,
			position: v2a(gooPos),
			rotation: v2a(tmpQuat),
			shapes: shapeConfigs,
			type: entity.ammoWorkerRigidbodyComponent._bodyType,
		});

		// Send messages accumulated in the queue
		var queue = entity.ammoWorkerRigidbodyComponent._queue;
		for (var i = 0; i < queue.length; i++) {
			var message = queue[i];
			this._postMessage(message);
		}
		queue.length = 0;
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
		this._system._postMessage(message);
	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerRigidbodyComponent;
});

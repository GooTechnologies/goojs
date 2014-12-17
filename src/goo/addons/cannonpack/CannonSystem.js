define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/util/ObjectUtil'
], function (
	System,
	BoundingBox,
	BoundingSphere,
	Quaternion,
	Transform,
	Vector3,
	_
) {
	'use strict';

	/* global CANNON, performance */

	/**
	 * @class Cannon.js physics system. Depends on the global CANNON object, so load cannon.js using a script tag before using this system. See also {@link CannonRigidbodyComponent}.
	 * @extends System
	 * @param [Object] [settings]
	 * @param {number} [settings.stepFrequency=60]
	 * @param {Vector3} [settings.gravity] The gravity to use in the scene. Default is (0,-10,0)
	 * @param {string} [settings.broadphase='naive'] One of: 'naive' (NaiveBroadphase), 'sap' (SAPBroadphase)
	 * @example
	 * <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}</caption>
	 * var cannonSystem = new CannonSystem({
	 *     stepFrequency: 60,
	 *     gravity: new Vector3(0, -10, 0)
	 * });
	 * goo.world.setSystem(cannonSystem);
	 */
	function CannonSystem(settings) {
		System.call(this, 'CannonSystem', ['CannonRigidbodyComponent', 'TransformComponent']);

		settings = settings || {};

		_.defaults(settings, {
			gravity :		new Vector3(0, -10, 0),
			stepFrequency : 60,
			broadphase :	'naive'
		});

		this.priority = 1; // make sure it processes after transformsystem

		var world = this.world = new CANNON.World();
		world.gravity.x = settings.gravity.x;
		world.gravity.y = settings.gravity.y;
		world.gravity.z = settings.gravity.z;
		this.setBroadphaseAlgorithm(settings.broadphase);
		this.stepFrequency = settings.stepFrequency;
		this.maxSubSteps = settings.maxSubSteps || 0;
	}
	var tmpQuat = new Quaternion();

	CannonSystem.prototype = Object.create(System.prototype);
	CannonSystem.prototype.constructor = CannonSystem;

	CannonSystem.prototype.reset = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			// this.deleted(entity);
			// this.inserted(entity);

			if (entity.cannonRigidbodyComponent.added) {
				var body = entity.cannonRigidbodyComponent.body;
				var p = entity.transformComponent.worldTransform.translation;
				var q = new Quaternion();
				q.fromRotationMatrix(entity.transformComponent.worldTransform.rotation);
				body.position.set(p.x, p.y, p.z);
				body.quaternion.set(q.x, q.y, q.z, q.w);
				body.velocity.set(0, 0, 0);
				body.angularVelocity.set(0, 0, 0);
			}
		}
	};


	CannonSystem.prototype.inserted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;
		rbComponent.body = null;
	};

	CannonSystem.prototype.deleted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;

		if (rbComponent && rbComponent.body) {
			// TODO: remove joints?
			this.world.remove(rbComponent.body);
			rbComponent.body = null;
		}
	};

	var tmpVec = new Vector3();
	CannonSystem.prototype.process = function (entities) {
		var world = this.world;

		// Add unadded entities
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var rbComponent = entity.cannonRigidbodyComponent;
			if (rbComponent && rbComponent.added) {
				continue;
			}

			var transformComponent = entity.transformComponent;

			var body = new CANNON.Body({
				mass: rbComponent.mass
			});
			rbComponent.body = body;
			rbComponent.addShapesToBody(entity);
			if (!body.shapes.length) {
				entity.clearComponent('CannonRigidbodyComponent');
				continue;
			}

			// Get the world transform from the entity and set on the body
			// entity.transformComponent.updateWorldTransform();
			if (!rbComponent._initialPosition) {
				entity.setPosition(transformComponent.transform.translation);
			} else {
				entity.setPosition(rbComponent._initialPosition);
			}
			entity.setVelocity(rbComponent._initialVelocity);
			var q = tmpQuat;
			q.fromRotationMatrix(transformComponent.transform.rotation);
			body.quaternion.set(q.x, q.y, q.z, q.w);

			world.add(body);

			var c = entity.cannonDistanceJointComponent;
			if (c) {
				world.addConstraint(c.createConstraint(entity));
			}
			rbComponent.added = true;
		}

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps) {
			var now = performance.now() / 1000.0;
			if (!this._lastTime) {
				this._lastTime = now;
			}
			var dt = now - this._lastTime;
			this._lastTime = now;
			world.step(fixedTimeStep, dt, maxSubSteps);
		} else {
			world.step(fixedTimeStep);
		}

		// Update positions of entities from the physics data
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var cannonComponent = entity.cannonRigidbodyComponent;
			if (!cannonComponent) {
				continue;
			}

			cannonComponent.body.computeAABB(); // Quick fix
			var cannonQuat = cannonComponent.body.quaternion;
			var position = cannonComponent.body.position;

			// Add center of mass offset
			cannonQuat.vmult(cannonComponent.centerOfMassOffset, tmpVec);
			position.vadd(tmpVec, tmpVec);
			entity.transformComponent.setTranslation(tmpVec.x, tmpVec.y, tmpVec.z);

			tmpQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
			entity.transformComponent.setUpdated();
		}
	};

	/**
	 * Set the broadphase algorithm to use
	 * @param {string} algorithm One of: 'naive' (NaiveBroadphase), 'sap' (SAPBroadphase)
	 */
	CannonSystem.prototype.setBroadphaseAlgorithm = function (algorithm) {
		var world = this.world;
		switch (algorithm) {
		case 'naive':
			world.broadphase = new CANNON.NaiveBroadphase();
			break;
		case 'sap':
			world.broadphase = new CANNON.SAPBroadphase(world);
			break;
		default:
			throw new Error('Broadphase not supported: ' + algorithm);
		}
	};

	return CannonSystem;
});

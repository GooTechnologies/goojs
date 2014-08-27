define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/util/ObjectUtil'
],
/** @lends */
function (
	System,
	BoundingBox,
	BoundingSphere,
	Quaternion,
	Transform,
	Vector3,
	_
) {
	'use strict';

	/* global CANNON */

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

		var world = this.world = new CANNON.World();
		world.gravity.x = settings.gravity.x;
		world.gravity.y = settings.gravity.y;
		world.gravity.z = settings.gravity.z;
		this.setBroadphaseAlgorithm(settings.broadphase);

		this.stepFrequency = settings.stepFrequency;
	}
	var tmpQuat = new Quaternion();

	CannonSystem.prototype = Object.create(System.prototype);

	CannonSystem.prototype.inserted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;
		var transformComponent = entity.transformComponent;

		var shape = rbComponent.createShape(entity);
		if (!shape) {
			entity.clearComponent('CannonRigidbodyComponent');
			return;
		}

		var body = new CANNON.RigidBody(rbComponent.mass, shape);
		rbComponent.body = body;
		entity.setPosition(transformComponent.transform.translation);
		entity.setVelocity(rbComponent._initialVelocity);
		var q = tmpQuat;
		q.fromRotationMatrix(transformComponent.transform.rotation);
		body.quaternion.set(q.x, q.y, q.z, q.w);

		this.world.add(body);

		var c = entity.cannonDistanceJointComponent;
		if (c) {
			this.world.addConstraint(c.createConstraint(entity));
		}
	};

	CannonSystem.prototype.deleted = function (entity) {
		var rbComponent = entity.cannonRigidbodyComponent;

		if (rbComponent) {
			// TODO: remove joints?
			this.world.remove(rbComponent.body);
		}
	};

	CannonSystem.prototype.process = function (entities /*, tpf */) {

		// Step the world forward in time
		this.world.step(1 / this.stepFrequency);

		// Update positions of entities from the physics data
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var cannonComponent = entity.cannonRigidbodyComponent;

			var position = cannonComponent.body.position;
			entity.transformComponent.setTranslation(position.x, position.y, position.z);

			var cannonQuat = cannonComponent.body.quaternion;
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

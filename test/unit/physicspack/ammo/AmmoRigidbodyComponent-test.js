define([
	'goo/entities/World',
	'goo/physicspack/ammo/AmmoPhysicsSystem',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/physicspack/ammo/AmmoRigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint',
	'goo/entities/SystemBus'
], function (
	World,
	AmmoPhysicsSystem,
	Vector3,
	Quaternion,
	AmmoRigidbodyComponent,
	ColliderComponent,
	SphereCollider,
	BoxCollider,
	BallJoint,
	HingeJoint,
	SystemBus
) {
	'use strict';

	/* global Ammo */

	describe('AmmoRigidbodyComponent', function () {
		var world, system, rbc, cc, entity;

		beforeEach(function () {
			if (!world) {
				world = new World();
				system = new AmmoPhysicsSystem({
					maxSubSteps: 1
				});
				system.setGravity(new Vector3());
				world.setSystem(system);

				rbc = new AmmoRigidbodyComponent({ mass: 1 });
				cc = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 })
				});
				entity = world.createEntity(rbc, cc).addToWorld();
				world.process();
			}

		});

		afterEach(function () {
		});

		it('can set collision group', function (done) {
			rbc.collisionGroup = 2;
			expect(rbc.collisionGroup).toEqual(2);
			done();
		});

		it('can set collision mask', function (done) {
			rbc.collisionMask = 2;
			expect(rbc.collisionMask).toEqual(2);
			done();
		});

		it('can set friction', function (done) {
			rbc.friction = 0.5;
			expect(rbc.ammoBody.getFriction()).toEqual(0.5);
			done();
		});

		it('can set restitution', function (done) {
			rbc.restitution = 0.5;
			expect(rbc.ammoBody.getRestitution()).toEqual(0.5);
			done();
		});

		it('can set linearDamping', function (done) {
			rbc.linearDamping = 123;
			expect(rbc.linearDamping).toEqual(123);
			done();
		});

		it('can set angularDamping', function (done) {
			rbc.angularDamping = 123;
			expect(rbc.angularDamping).toEqual(123);
			done();
		});

		it('can set transform from entity', function (done) {
			entity.setTranslation(1, 2, 3);
			rbc.setTransformFromEntity(entity);
			var position = new Vector3();
			rbc.getPosition(position);
			expect(rbc.ammoBody.getCenterOfMassPosition().z()).toEqual(3);
			done();
		});

		it('can apply force', function (done) {
			rbc.applyForce(new Vector3(1, 2, 3));
			expect(rbc.ammoBody.getTotalForce().z()).toEqual(3);
			done();
		});

		it('can set velocity', function (done) {
			rbc.setVelocity(new Vector3(1, 2, 3));
			expect(rbc.ammoBody.getLinearVelocity().z()).toEqual(3);
			done();
		});

		it('can get velocity', function (done) {
			rbc.ammoBody.setLinearVelocity(new Ammo.btVector3(1, 2, 3));
			var velocity = new Vector3();
			rbc.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
			done();
		});

		it('can set position', function (done) {
			rbc.setPosition(new Vector3(1, 2, 3));
			expect(rbc.ammoBody.getCenterOfMassPosition().z()).toEqual(3);
			done();
		});

		it('can set quaternion', function (done) {
			rbc.setQuaternion(new Quaternion(0, 0, 0, 1));
			expect(rbc.ammoBody.getOrientation().w()).toEqual(1);
			done();
		});

		it('can get quaternion', function (done) {
			rbc.setQuaternion(new Quaternion(0, 0, 0, 1));
			var quat = new Quaternion();
			rbc.getQuaternion(quat);
			expect(quat).toEqual(new Quaternion(0, 0, 0, 1));
			done();
		});

		it('can set kinematic', function (done) {
			rbc.isKinematic = true;
			world.process();
			/* jslint bitwise: true */
			expect(rbc.ammoBody.getCollisionFlags() | AmmoRigidbodyComponent.AmmoFlags.CF_KINEMATIC_OBJECT).toBeTruthy();
			done();
		});

		it('can destroy itself', function (done) {
			rbc.destroy();
			expect(rbc.ammoBody).toBeFalsy();
			rbc.initialize();
			done();
		});

		it('can add and remove a BallJoint', function (done) {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.ammoJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.ammoJoint).toBeFalsy();

			done();
		});

		it('cleans up if its detached', function (done) {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();

			entity.clearComponent('AmmoRigidbodyComponent');

			world.process();

			expect(joint.ammoJoint).toBeFalsy();
			expect(rbc.ammoBody).toBeFalsy();

			entity.set(rbc);
			rbc.initialize();
			world.process();

			done();
		});

		it('can add and remove a HingeJoint', function (done) {
			var joint = new HingeJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.ammoJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.ammoJoint).toBeFalsy();

			done();
		});

		it('emits initialized', function (done) {

			var rbc1 = new AmmoRigidbodyComponent({ mass: 1 });
			var cc1 = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entity1 = world.createEntity(rbc1, cc1).addToWorld();

			var numEvents = 0;
			var listener = function (evt) {
				numEvents++;
				expect(evt.entity).toEqual(entity1);
			};
			SystemBus.addListener('goo.physics.initialized', listener);

			world.process();

			SystemBus.removeListener('goo.physics.initialized', listener);

			expect(numEvents).toBe(1);

			done();
		});

		it('can be initialized manually', function (done) {
			rbc = new AmmoRigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rbc, cc).addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			rbc.initialize();
			SystemBus.removeListener('goo.physics.initialized', listener);

			expect(numEvents).toBe(1);
			expect(rbc.ammoBody).toBeTruthy();

			done();
		});

		it('can clone', function (done) {
			var a = rbc;
			a.collisionMask = 4;
			a.collisionGroup = 4;
			var b = rbc.clone();

			expect(a.collisionMask).toEqual(b.collisionMask);
			expect(a.collisionGroup).toEqual(b.collisionGroup);

			done();
		});
	});
});
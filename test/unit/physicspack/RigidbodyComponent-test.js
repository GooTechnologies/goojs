define([
	'goo/entities/World',
	'goo/physicspack/PhysicsSystem',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint',
	'goo/entities/SystemBus'
], function (
	World,
	PhysicsSystem,
	Vector3,
	Quaternion,
	RigidbodyComponent,
	ColliderComponent,
	SphereCollider,
	BoxCollider,
	BallJoint,
	HingeJoint,
	SystemBus
) {
	'use strict';

	/* global CANNON */

	describe('RigidbodyComponent', function () {
		var world, system, rbc, cc, entity;

		beforeEach(function () {
			world = new World();
			system = new PhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);

			rbc = new RigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rbc, cc).addToWorld();
			world.process();
		});

		it('can set collision group', function (done) {
			rbc.collisionGroup = 2;
			expect(rbc.cannonBody.collisionFilterGroup).toEqual(2);
			done();
		});

		it('can set collision mask', function (done) {
			rbc.collisionMask = 2;
			expect(rbc.cannonBody.collisionFilterMask).toEqual(2);
			done();
		});

		it('can set friction', function (done) {
			rbc.friction = 123;
			expect(rbc.cannonBody.material.friction).toEqual(123);
			done();
		});

		it('can set restitution', function (done) {
			rbc.restitution = 123;
			expect(rbc.cannonBody.material.restitution).toEqual(123);
			done();
		});

		it('can set linearDamping', function (done) {
			rbc.linearDamping = 123;
			expect(rbc.cannonBody.linearDamping).toEqual(123);
			done();
		});

		it('can set angularDamping', function (done) {
			rbc.angularDamping = 123;
			expect(rbc.cannonBody.angularDamping).toEqual(123);
			done();
		});

		it('can set transform from entity', function (done) {
			entity.setTranslation(1, 2, 3);
			entity.transformComponent.updateWorldTransform();
			rbc.setTransformFromEntity(entity);
			var position = new Vector3();
			rbc.getPosition(position);
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
			done();
		});

		it('can apply force', function (done) {
			rbc.applyForce(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));
			done();
		});

		it('can set velocity', function (done) {
			rbc.setVelocity(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.velocity).toEqual(new CANNON.Vec3(1, 2, 3));
			done();
		});

		it('can get velocity', function (done) {
			rbc.cannonBody.velocity.set(1, 2, 3);
			var velocity = new Vector3();
			rbc.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
			done();
		});

		it('can set position', function (done) {
			rbc.setPosition(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
			done();
		});

		it('can set position', function (done) {
			rbc.setPosition(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
			done();
		});

		it('can set quaternion', function (done) {
			rbc.setQuaternion(new Quaternion(1, 2, 3, 4));
			expect(rbc.cannonBody.quaternion).toEqual(new CANNON.Quaternion(1, 2, 3, 4));
			done();
		});

		it('can get quaternion', function (done) {
			rbc.cannonBody.quaternion.set(1, 2, 3, 4);
			var quat = new Quaternion();
			rbc.getQuaternion(quat);
			expect(quat).toEqual(new Quaternion(1, 2, 3, 4));
			done();
		});

		it('can set kinematic', function (done) {
			rbc.isKinematic = true;
			world.process();
			expect(rbc.cannonBody.type).toEqual(CANNON.Body.KINEMATIC);
			done();
		});

		it('can get cannon shape from box collider', function (done) {
			var c = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var cannonShape = rbc.getCannonShape(c);
			expect(cannonShape).toEqual(new CANNON.Box(new CANNON.Vec3(1, 2, 3)));
			done();
		});

		it('can destroy itself and rebuild', function (done) {
			rbc.destroy();
			expect(rbc.cannonBody).toBeFalsy();
			world.process();
			expect(rbc.cannonBody).toBeTruthy();
			done();
		});

		it('can add and remove a BallJoint', function (done) {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();

			done();
		});

		it('cleans up if its detached', function (done) {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();

			entity.clearComponent('RigidbodyComponent');

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rbc.cannonBody).toBeFalsy();

			done();
		});

		it('can add and remove a HingeJoint', function (done) {
			var joint = new HingeJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();

			done();
		});

		it('emits initialized', function (done) {

			rbc = new RigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rbc, cc).addToWorld();

			var numEvents = 0;
			var listener = function (evt) {
				numEvents++;
				expect(evt.entity).toEqual(entity);
			};
			SystemBus.addListener('goo.physics.initialized', listener);

			world.process();

			SystemBus.removeListener('goo.physics.initialized', listener);

			expect(numEvents).toBe(1);

			done();
		});

		it('can be initialized manually', function (done) {
			rbc = new RigidbodyComponent({ mass: 1 });
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
			expect(rbc.cannonBody).toBeTruthy();

			done();
		});

		it('is initialized properly on world.processEntityChanges', function (done) {
			rbc = new RigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity()
				.set(rbc)
				.set(cc)
				.addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			world.processEntityChanges();

			expect(numEvents).toBe(1);
			expect(rbc.cannonBody).toBeTruthy();
			expect(rbc.cannonBody.shapes.length).toBe(1);

			SystemBus.removeListener('goo.physics.initialized', listener);

			done();
		});

		it('can clone', function (done) {
			var a = rbc;

			a.angularDamping = 0.5;
			a.collisionGroup = 4;
			a.collisionMask = 4;
			a.friction = 0.5;
			a.isKinematic = true;
			a.linearDamping = 0.5;
			a.mass = 2;
			a.restitution = 0.5;
			a.setAngularVelocity(new Vector3(4, 5, 6));
			a.setVelocity(new Vector3(1, 2, 3));
			a.sleepingThreshold = 0.5;
			a.sleepTimeLimit = 3;

			var b = rbc.clone();

			expect(a.angularDamping).toEqual(0.5);
			expect(a.collisionGroup).toEqual(b.collisionGroup);
			expect(a.collisionMask).toEqual(b.collisionMask);
			expect(a.friction).toEqual(0.5);
			expect(a.isKinematic).toEqual(true);
			expect(a.linearDamping).toEqual(0.5);
			expect(a.mass).toEqual(2);
			expect(a.restitution).toEqual(0.5);
			expect(a.sleepingThreshold).toEqual(0.5);
			expect(a.sleepTimeLimit).toEqual(3);

			var angularVelocity = new Vector3();
			a.getAngularVelocity(angularVelocity);
			expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

			var velocity = new Vector3();
			a.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));

			done();
		});

		it('can set sleeping parameters', function (done) {
			rbc.sleepingThreshold = 4;
			rbc.sleepingTimeLimit = 6;
			expect(rbc.cannonBody.sleepSpeedLimit).toEqual(4);
			expect(rbc.cannonBody.sleepTimeLimit).toEqual(6);
			done();
		});
	});
});
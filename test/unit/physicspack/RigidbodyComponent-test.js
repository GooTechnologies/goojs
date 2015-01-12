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
			done();
		});

		it('can add and remove a HingeJoint', function (done) {
			var joint = new HingeJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.joint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.joint).toBeFalsy();

			done();
		});

		it('emits initialized', function (done) {

			rbc = new RigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rbc, cc).addToWorld();

			var numEvents = 0;
			SystemBus.addListener('goo.physics.initialized', function (evt) {
				numEvents++;
				expect(evt.entity).toEqual(entity);
			});

			world.process();

			expect(numEvents).toBe(1);

			done();
		});
	});
});
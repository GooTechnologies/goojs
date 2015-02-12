define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/joints/BallJoint',
	'goo/addons/physicspack/joints/HingeJoint',
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

		it('can set collision group', function () {
			rbc.collisionGroup = 2;
			expect(rbc.cannonBody.collisionFilterGroup).toEqual(2);

		});

		it('can set collision mask', function () {
			rbc.collisionMask = 2;
			expect(rbc.cannonBody.collisionFilterMask).toEqual(2);

		});

		it('can set friction', function () {
			rbc.friction = 123;
			expect(rbc.cannonBody.material.friction).toEqual(123);

		});

		it('can set restitution', function () {
			rbc.restitution = 123;
			expect(rbc.cannonBody.material.restitution).toEqual(123);

		});

		it('can set linearDamping', function () {
			rbc.linearDamping = 123;
			expect(rbc.cannonBody.linearDamping).toEqual(123);

		});

		it('can set angularDamping', function () {
			rbc.angularDamping = 123;
			expect(rbc.cannonBody.angularDamping).toEqual(123);

		});

		it('can set transform from entity', function () {
			entity.setTranslation(1, 2, 3);
			entity.transformComponent.updateWorldTransform();
			rbc.setTransformFromEntity(entity);
			var position = new Vector3();
			rbc.getPosition(position);
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));

		});

		it('can apply force', function () {
			rbc.applyForce(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));

		});

		it('can set velocity', function () {
			rbc.setVelocity(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.velocity).toEqual(new CANNON.Vec3(1, 2, 3));

		});

		it('can get velocity', function () {
			rbc.cannonBody.velocity.set(1, 2, 3);
			var velocity = new Vector3();
			rbc.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));

		});

		it('can set position', function () {
			rbc.setPosition(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));

		});

		it('can set position', function () {
			rbc.setPosition(new Vector3(1, 2, 3));
			expect(rbc.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));

		});

		it('can set quaternion', function () {
			rbc.setQuaternion(new Quaternion(1, 2, 3, 4));
			expect(rbc.cannonBody.quaternion).toEqual(new CANNON.Quaternion(1, 2, 3, 4));

		});

		it('can get quaternion', function () {
			rbc.cannonBody.quaternion.set(1, 2, 3, 4);
			var quat = new Quaternion();
			rbc.getQuaternion(quat);
			expect(quat).toEqual(new Quaternion(1, 2, 3, 4));

		});

		it('can set kinematic', function () {
			rbc.isKinematic = true;
			world.process();
			expect(rbc.cannonBody.type).toEqual(CANNON.Body.KINEMATIC);

		});

		it('can get cannon shape from box collider', function () {
			var c = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var cannonShape = rbc.getCannonShape(c);
			expect(cannonShape).toEqual(new CANNON.Box(new CANNON.Vec3(1, 2, 3)));

		});

		it('can destroy itself and rebuild', function () {
			rbc.destroy();
			expect(rbc.cannonBody).toBeFalsy();
			world.process();
			expect(rbc.cannonBody).toBeTruthy();

		});

		it('can add and remove a BallJoint', function () {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();


		});

		it('cleans up if its detached', function () {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();

			entity.clearComponent('RigidbodyComponent');

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rbc.cannonBody).toBeFalsy();


		});

		it('can add and remove a HingeJoint', function () {
			var joint = new HingeJoint({
				connectedEntity: entity
			});

			rbc.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rbc.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();


		});

		it('emits initialized', function () {

			rbc = new RigidbodyComponent({ mass: 1 });
			cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rbc, cc).addToWorld();

			var numEvents = 0;
			var listener = function (evt) {
				numEvents++;
				expect(evt.entity).toBe(entity);
			};
			SystemBus.addListener('goo.physics.initialized', listener);

			world.process();

			SystemBus.removeListener('goo.physics.initialized', listener);

			expect(numEvents).toBe(1);
		});

		it('can be initialized manually', function () {
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


		});

		it('is initialized properly on world.processEntityChanges', function () {
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


		});

		it('can clone', function () {
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


		});

		it('can set sleeping parameters', function () {
			rbc.sleepingThreshold = 4;
			rbc.sleepingTimeLimit = 6;
			expect(rbc.cannonBody.sleepSpeedLimit).toEqual(4);
			expect(rbc.cannonBody.sleepTimeLimit).toEqual(6);

		});

		it('updates dirty colliders', function () {
			cc.collider.radius = 5;
			cc._dirty = true;

			world.process();

			expect(rbc.cannonBody.shapes[0].radius).toEqual(5);

		});
	});
});
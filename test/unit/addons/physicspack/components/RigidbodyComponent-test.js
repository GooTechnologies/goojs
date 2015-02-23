define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/PhysicsMaterial',
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
	PhysicsMaterial,
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
		var world, system, rigidbodyComponent, colliderComponent, entity;

		beforeEach(function () {
			world = new World();
			system = new PhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);

			rigidbodyComponent = new RigidbodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidbodyComponent, colliderComponent).addToWorld();
			world.process();
		});

		it('can set linearDamping', function () {
			rigidbodyComponent.linearDamping = 123;
			expect(rigidbodyComponent.cannonBody.linearDamping).toEqual(123);
		});

		it('can set angularDamping', function () {
			rigidbodyComponent.angularDamping = 123;
			expect(rigidbodyComponent.cannonBody.angularDamping).toEqual(123);
		});

		it('can set transform from entity', function () {
			entity.setTranslation(1, 2, 3);
			entity.transformComponent.updateWorldTransform();
			rigidbodyComponent.setTransformFromEntity(entity);
			var position = new Vector3();
			rigidbodyComponent.getPosition(position);
			expect(rigidbodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can apply force', function () {
			rigidbodyComponent.applyForce(new Vector3(1, 2, 3));
			expect(rigidbodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can set velocity', function () {
			rigidbodyComponent.setVelocity(new Vector3(1, 2, 3));
			expect(rigidbodyComponent.cannonBody.velocity).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can get velocity', function () {
			rigidbodyComponent.cannonBody.velocity.set(1, 2, 3);
			var velocity = new Vector3();
			rigidbodyComponent.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
		});

		it('can set position', function () {
			rigidbodyComponent.setPosition(new Vector3(1, 2, 3));
			expect(rigidbodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can set position', function () {
			rigidbodyComponent.setPosition(new Vector3(1, 2, 3));
			expect(rigidbodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can set quaternion', function () {
			rigidbodyComponent.setQuaternion(new Quaternion(1, 2, 3, 4));
			expect(rigidbodyComponent.cannonBody.quaternion).toEqual(new CANNON.Quaternion(1, 2, 3, 4));
		});

		it('can get quaternion', function () {
			rigidbodyComponent.cannonBody.quaternion.set(1, 2, 3, 4);
			var quat = new Quaternion();
			rigidbodyComponent.getQuaternion(quat);
			expect(quat).toEqual(new Quaternion(1, 2, 3, 4));
		});

		it('can set kinematic', function () {
			rigidbodyComponent.isKinematic = true;
			world.process();
			expect(rigidbodyComponent.cannonBody.type).toEqual(CANNON.Body.KINEMATIC);
		});

		it('can get cannon shape from box collider', function () {
			var c = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var cannonShape = RigidbodyComponent.getCannonShape(c);
			expect(cannonShape).toEqual(new CANNON.Box(new CANNON.Vec3(1, 2, 3)));
		});

		it('can destroy itself and rebuild', function () {
			rigidbodyComponent.destroy();
			expect(rigidbodyComponent.cannonBody).toBeFalsy();
			world.process();
			expect(rigidbodyComponent.cannonBody).toBeTruthy();
		});

		it('can add and remove a BallJoint', function () {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rigidbodyComponent.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rigidbodyComponent.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();
		});

		it('cleans up if its detached', function () {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rigidbodyComponent.addJoint(joint);
			world.process();

			entity.clearComponent('RigidbodyComponent');

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rigidbodyComponent.cannonBody).toBeFalsy();
		});

		it('cleans up if its removed from its world', function () {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rigidbodyComponent.addJoint(joint);

			world.process();

			entity.removeFromWorld();

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rigidbodyComponent.cannonBody).toBeFalsy();
		});

		it('can add and remove a HingeJoint', function () {
			var joint = new HingeJoint({
				connectedEntity: entity
			});

			rigidbodyComponent.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rigidbodyComponent.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();
		});

		it('emits initialized', function () {

			rigidbodyComponent = new RigidbodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidbodyComponent, colliderComponent).addToWorld();

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
			rigidbodyComponent = new RigidbodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidbodyComponent, colliderComponent).addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			rigidbodyComponent.initialize();

			SystemBus.removeListener('goo.physics.initialized', listener);
			expect(numEvents).toBe(1);
			expect(rigidbodyComponent.cannonBody).toBeTruthy();
		});

		it('is initialized properly on world.processEntityChanges', function () {
			rigidbodyComponent = new RigidbodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity()
				.set(rigidbodyComponent)
				.set(colliderComponent)
				.addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			world.processEntityChanges();

			expect(numEvents).toBe(1);
			expect(rigidbodyComponent.cannonBody).toBeTruthy();
			expect(rigidbodyComponent.cannonBody.shapes.length).toBe(1);

			SystemBus.removeListener('goo.physics.initialized', listener);
		});

		it('can clone', function () {
			rigidbodyComponent.angularDamping = 0.5;
			rigidbodyComponent.isKinematic = false;
			rigidbodyComponent.linearDamping = 0.5;
			rigidbodyComponent.mass = 2;
			rigidbodyComponent.restitution = 0.5;
			rigidbodyComponent.setAngularVelocity(new Vector3(4, 5, 6));
			rigidbodyComponent.setVelocity(new Vector3(1, 2, 3));
			rigidbodyComponent.sleepingThreshold = 0.5;
			rigidbodyComponent.sleepingTimeLimit = 3;

			var rigidbodyComponent2 = rigidbodyComponent.clone();

			expect(rigidbodyComponent2.angularDamping).toEqual(0.5);
			expect(rigidbodyComponent2.isKinematic).toEqual(false);
			expect(rigidbodyComponent2.linearDamping).toEqual(0.5);
			expect(rigidbodyComponent2.mass).toEqual(2);
			expect(rigidbodyComponent2.sleepingThreshold).toEqual(0.5);
			expect(rigidbodyComponent2.sleepingTimeLimit).toEqual(3);

			var angularVelocity = new Vector3();
			rigidbodyComponent2.getAngularVelocity(angularVelocity);
			expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

			var velocity = new Vector3();
			rigidbodyComponent2.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
		});

		it('can set sleeping parameters', function () {
			rigidbodyComponent.sleepingThreshold = 4;
			rigidbodyComponent.sleepingTimeLimit = 6;
			expect(rigidbodyComponent.cannonBody.sleepSpeedLimit).toEqual(4);
			expect(rigidbodyComponent.cannonBody.sleepTimeLimit).toEqual(6);
		});

		it('updates dirty colliders', function () {
			colliderComponent.collider.radius = 5;
			colliderComponent._dirty = true;

			world.process();

			expect(rigidbodyComponent.cannonBody.shapes[0].radius).toEqual(5);
		});

		it('can set materials per collider', function () {
			var rigidbodyComponent = new RigidbodyComponent({ mass: 1 });
			var colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				material: new PhysicsMaterial({ friction: 0.7, restitution: 0.8 })
			});
			var entity = world.createEntity(rigidbodyComponent, colliderComponent).addToWorld();

			var colliderComponent2 = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				material: new PhysicsMaterial({ friction: 0.9, restitution: 1.0 })
			});
			var subEntity = world.createEntity(colliderComponent2).addToWorld();

			entity.attachChild(subEntity);

			world.process();

			expect(entity.rigidbodyComponent.cannonBody.shapes[0].material.friction).toBe(0.7);
			expect(entity.rigidbodyComponent.cannonBody.shapes[1].material.friction).toBe(0.9);

			entity.removeFromWorld();
			subEntity.removeFromWorld();
		});
	});
});
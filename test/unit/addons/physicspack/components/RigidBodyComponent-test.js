define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/PhysicsMaterial',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/addons/physicspack/components/RigidBodyComponent',
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
	RigidBodyComponent,
	ColliderComponent,
	SphereCollider,
	BoxCollider,
	BallJoint,
	HingeJoint,
	SystemBus
) {
	'use strict';

	/* global CANNON */

	describe('RigidBodyComponent', function () {
		var world, system, rigidBodyComponent, colliderComponent, entity;

		beforeEach(function () {
			world = new World();
			system = new PhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);

			rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();
			world.process();
		});

		it('can set linearDamping', function () {
			rigidBodyComponent.linearDamping = 123;
			expect(rigidBodyComponent.cannonBody.linearDamping).toEqual(123);
		});

		it('can set angularDamping', function () {
			rigidBodyComponent.angularDamping = 123;
			expect(rigidBodyComponent.cannonBody.angularDamping).toEqual(123);
		});

		it('can set transform from entity', function () {
			entity.setTranslation(1, 2, 3);
			entity.transformComponent.updateWorldTransform();
			rigidBodyComponent.setTransformFromEntity(entity);
			var position = new Vector3();
			rigidBodyComponent.getPosition(position);
			expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can apply force', function () {
			rigidBodyComponent.cannonBody.position.set(1, 2, 3);
			rigidBodyComponent.applyForce(new Vector3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 0));
		});

		it('can set velocity', function () {
			rigidBodyComponent.setVelocity(new Vector3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.velocity).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can get velocity', function () {
			rigidBodyComponent.cannonBody.velocity.set(1, 2, 3);
			var velocity = new Vector3();
			rigidBodyComponent.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
		});

		it('can set position', function () {
			rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can set position', function () {
			rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can set quaternion', function () {
			rigidBodyComponent.setQuaternion(new Quaternion(1, 2, 3, 4));
			expect(rigidBodyComponent.cannonBody.quaternion).toEqual(new CANNON.Quaternion(1, 2, 3, 4));
		});

		it('can get quaternion', function () {
			rigidBodyComponent.cannonBody.quaternion.set(1, 2, 3, 4);
			var quat = new Quaternion();
			rigidBodyComponent.getQuaternion(quat);
			expect(quat).toEqual(new Quaternion(1, 2, 3, 4));
		});

		it('can set kinematic', function () {
			rigidBodyComponent.isKinematic = true;
			world.process();
			expect(rigidBodyComponent.cannonBody.type).toEqual(CANNON.Body.KINEMATIC);
		});

		it('can get cannon shape from box collider', function () {
			var c = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var cannonShape = RigidBodyComponent.getCannonShape(c);
			expect(cannonShape).toEqual(new CANNON.Box(new CANNON.Vec3(1, 2, 3)));
		});

		it('can destroy itself and rebuild', function () {
			rigidBodyComponent.destroy();
			expect(rigidBodyComponent.cannonBody).toBeFalsy();
			world.process();
			expect(rigidBodyComponent.cannonBody).toBeTruthy();
		});

		it('can add and remove a BallJoint', function () {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rigidBodyComponent.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rigidBodyComponent.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();
		});

		it('cleans up if its detached', function () {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rigidBodyComponent.addJoint(joint);
			world.process();

			entity.clearComponent('RigidBodyComponent');

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rigidBodyComponent.cannonBody).toBeFalsy();
		});

		it('cleans up if its removed from its world', function () {
			var joint = new BallJoint({
				connectedEntity: entity
			});

			rigidBodyComponent.addJoint(joint);

			world.process();

			entity.removeFromWorld();

			world.process();

			expect(joint.cannonJoint).toBeFalsy();
			expect(rigidBodyComponent.cannonBody).toBeFalsy();
		});

		it('can add and remove a HingeJoint', function () {
			var joint = new HingeJoint({
				connectedEntity: entity
			});

			rigidBodyComponent.addJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeTruthy();

			rigidBodyComponent.removeJoint(joint);
			world.process();
			expect(joint.cannonJoint).toBeFalsy();
		});

		it('emits initialized', function () {

			rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();

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
			rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			rigidBodyComponent.initialize();

			SystemBus.removeListener('goo.physics.initialized', listener);
			expect(numEvents).toBe(1);
			expect(rigidBodyComponent.cannonBody).toBeTruthy();
		});

		it('is initialized properly on world.processEntityChanges', function () {
			rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
			colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			entity = world.createEntity()
				.set(rigidBodyComponent)
				.set(colliderComponent)
				.addToWorld();

			var numEvents = 0;
			var listener = function () {
				numEvents++;
			};
			SystemBus.addListener('goo.physics.initialized', listener);
			world.processEntityChanges();

			expect(numEvents).toBe(1);
			expect(rigidBodyComponent.cannonBody).toBeTruthy();
			expect(rigidBodyComponent.cannonBody.shapes.length).toBe(1);

			SystemBus.removeListener('goo.physics.initialized', listener);
		});

		it('can clone', function () {
			rigidBodyComponent.angularDamping = 0.5;
			rigidBodyComponent.isKinematic = false;
			rigidBodyComponent.linearDamping = 0.5;
			rigidBodyComponent.mass = 2;
			rigidBodyComponent.restitution = 0.5;
			rigidBodyComponent.setAngularVelocity(new Vector3(4, 5, 6));
			rigidBodyComponent.setVelocity(new Vector3(1, 2, 3));
			rigidBodyComponent.sleepingThreshold = 0.5;
			rigidBodyComponent.sleepingTimeLimit = 3;

			var rigidBodyComponent2 = rigidBodyComponent.clone();

			expect(rigidBodyComponent2.angularDamping).toEqual(0.5);
			expect(rigidBodyComponent2.isKinematic).toEqual(false);
			expect(rigidBodyComponent2.linearDamping).toEqual(0.5);
			expect(rigidBodyComponent2.mass).toEqual(2);
			expect(rigidBodyComponent2.sleepingThreshold).toEqual(0.5);
			expect(rigidBodyComponent2.sleepingTimeLimit).toEqual(3);

			var angularVelocity = new Vector3();
			rigidBodyComponent2.getAngularVelocity(angularVelocity);
			expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

			var velocity = new Vector3();
			rigidBodyComponent2.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));
		});

		it('can set sleeping parameters', function () {
			rigidBodyComponent.sleepingThreshold = 4;
			rigidBodyComponent.sleepingTimeLimit = 6;
			expect(rigidBodyComponent.cannonBody.sleepSpeedLimit).toEqual(4);
			expect(rigidBodyComponent.cannonBody.sleepTimeLimit).toEqual(6);
		});

		it('updates dirty colliders', function () {
			colliderComponent.collider.radius = 5;
			colliderComponent._dirty = true;

			world.process();

			expect(rigidBodyComponent.cannonBody.shapes[0].radius).toEqual(5);
		});

		it('can set materials per collider', function () {
			var rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
			var colliderComponent = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				material: new PhysicsMaterial({ friction: 0.7, restitution: 0.8 })
			});
			var entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();

			var colliderComponent2 = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				material: new PhysicsMaterial({ friction: 0.9, restitution: 1.0 })
			});
			var subEntity = world.createEntity(colliderComponent2).addToWorld();

			entity.attachChild(subEntity);

			world.process();

			expect(entity.rigidBodyComponent.cannonBody.shapes[0].material.friction).toBe(0.7);
			expect(entity.rigidBodyComponent.cannonBody.shapes[1].material.friction).toBe(0.9);

			entity.removeFromWorld();
			subEntity.removeFromWorld();
		});
	});
});
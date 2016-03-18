	/* global CANNON */

		import SphereCollider from 'src/goo/addons/physicspack/colliders/SphereCollider';
		import Vector3 from 'src/goo/math/Vector3';
		import Quaternion from 'src/goo/math/Quaternion';
		import World from 'src/goo/entities/World';
		import SystemBus from 'src/goo/entities/SystemBus';
		import PhysicsMaterial from 'src/goo/addons/physicspack/PhysicsMaterial';
		import PhysicsSystem from 'src/goo/addons/physicspack/systems/PhysicsSystem';
		import ColliderComponent from 'src/goo/addons/physicspack/components/ColliderComponent';
		import RigidBodyComponent from 'src/goo/addons/physicspack/components/RigidBodyComponent';
		import BallJoint from 'src/goo/addons/physicspack/joints/BallJoint';

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
			rigidBodyComponent.initialize();
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

		it('can set constraints', function () {
			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_NONE;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 1, 1));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_X;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 1, 1));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_Y;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 0, 1));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_Z;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 1, 0));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_X;
			expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 1, 1));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_Y;
			expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(1, 0, 1));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_Z;
			expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(1, 1, 0));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 0, 0));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION;
			expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 0, 0));

			rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ALL;
			expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 0, 0));
			expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 0, 0));

		});

		it('can set transform from entity', function () {
			entity.setTranslation(1, 2, 3);
			entity.transformComponent.updateWorldTransform();
			rigidBodyComponent.setTransformFromEntity(entity);
			var position = new Vector3();
			rigidBodyComponent.getPosition(position);
			expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
		});

		it('can applyForce', function () {
			rigidBodyComponent.cannonBody.position.set(1, 2, 3);
			rigidBodyComponent.applyForce(new Vector3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));
			expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 0));
		});

		it('can applyForceWorld', function () {
			rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
			rigidBodyComponent.setQuaternion(new Quaternion().fromAngleAxis(Math.PI / 4, new Vector3(1,0,0))); // Should not affect at all
			var worldForce = new Vector3(0, 1, 0);
			var worldPosition = new Vector3(2, 2, 3); // (1,0,0) relative to the body
			rigidBodyComponent.applyForceWorld(worldForce, worldPosition);
			expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(0, 1, 0));
			expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 1)); // (1,0,0) x (0,1,0) is (0,0,1)
		});

		it('can applyForceLocal', function () {
			rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
			var localForce = new Vector3(0, 1, 0);
			var localPosition = new Vector3(1, 0, 0);
			rigidBodyComponent.applyForceLocal(localForce, localPosition);
			expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(0, 1, 0));
			expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 1)); // (1,0,0) x (0,1,0) is (0,0,1)
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

		it('can destroy itself and rebuild', function () {
			rigidBodyComponent.destroy();
			expect(rigidBodyComponent.cannonBody).toBeFalsy();
			rigidBodyComponent.initialize();
			expect(rigidBodyComponent.cannonBody).toBeTruthy();
		});

		it('can add and remove a BallJoint', function () {
			var joint = new BallJoint({
				connectedEntity: entity // Self, just for testing!
			});

			rigidBodyComponent.addJoint(joint);
			rigidBodyComponent.initializeJoint(joint);
			expect(joint.cannonJoint).toBeTruthy();

			rigidBodyComponent.removeJoint(joint);
			rigidBodyComponent.destroyJoint(joint);

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

			rigidBodyComponent.initialize();

			SystemBus.removeListener('goo.physics.initialized', listener);

			expect(numEvents).toBe(1);
			expect(rigidBodyComponent.cannonBody).toBeTruthy();
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

			rigidBodyComponent.initialize();

			expect(entity.rigidBodyComponent.cannonBody.shapes[0].material.friction).toBe(0.7);
			expect(entity.rigidBodyComponent.cannonBody.shapes[1].material.friction).toBe(0.9);

			entity.removeFromWorld();
			subEntity.removeFromWorld();
		});
	});

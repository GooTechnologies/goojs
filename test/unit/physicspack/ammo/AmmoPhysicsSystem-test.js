define([
	'goo/entities/World',
	'goo/physicspack/ammo/AmmoPhysicsSystem',
	'goo/entities/systems/TransformSystem',
	'goo/math/Vector3',
	'goo/physicspack/ammo/AmmoRigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/RaycastResult',
	'goo/physicspack/colliders/SphereCollider',
	'goo/entities/SystemBus'
], function (
	World,
	AmmoPhysicsSystem,
	TransformSystem,
	Vector3,
	AmmoRigidbodyComponent,
	ColliderComponent,
	RaycastResult,
	SphereCollider,
	SystemBus
) {
	'use strict';

	describe('AmmoPhysicsSystem', function () {
		var world, system;

		beforeEach(function () {
			world = new World();
			system = new AmmoPhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);
			world.setSystem(new TransformSystem());
		});

		it('can raycast closest', function (done) {
			var start = new Vector3(0, 0, -10);
			var end = new Vector3(0, 0, 10);
			var rbcA = new AmmoRigidbodyComponent();
			var rbcB = new AmmoRigidbodyComponent();
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, cc).addToWorld();
			var entityB = world.createEntity(rbcB, cc).addToWorld();
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);
			world.process(); // Needed to initialize bodies

			var result = new RaycastResult();
			system.raycastClosest(start, end, result);
			expect(result.entity).toEqual(entityB);

			// Now swap so that entityA is closer
			rbcA.setPosition(new Vector3(0, 0, -3));
			rbcB.setPosition(new Vector3(0, 0, 3));
			world.process();

			system.raycastClosest(start, end, result);
			expect(result.entity).toEqual(entityA);

			done();
		});

		it('emits contact events', function (done) {
			var rbcA = new AmmoRigidbodyComponent({ mass: 1 });
			var rbcB = new AmmoRigidbodyComponent({ mass: 1 });
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, cc).addToWorld();
			var entityB = world.createEntity(rbcB, cc).addToWorld();
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);

			var numBeginContact = 0;
			var numDuringContact = 0;
			var numEndContact = 0;

			var listeners = {
				'goo.physics.beginContact': function (evt) {
					expect(evt.entityA.id).toEqual(entityA.id);
					expect(evt.entityB.id).toEqual(entityB.id);
					numBeginContact++;
				},
				'goo.physics.duringContact': function (evt) {
					expect(evt.entityA.id).toEqual(entityA.id);
					expect(evt.entityB.id).toEqual(entityB.id);
					numDuringContact++;
				},
				'goo.physics.endContact': function (evt) {
					expect(evt.entityA.id).toEqual(entityA.id);
					expect(evt.entityB.id).toEqual(entityB.id);
					numEndContact++;
				}
			};
			for (var key in listeners) {
				SystemBus.addListener(key, listeners[key]);
			}

			world.process(); // Needed to initialize bodies

			expect(numBeginContact).toEqual(0);
			expect(numDuringContact).toEqual(0);
			expect(numEndContact).toEqual(0);

			rbcA.setPosition(new Vector3(0, 0, 0.1));
			rbcB.setPosition(new Vector3(0, 0, -0.1));

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(0);
			expect(numEndContact).toEqual(0);

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(1);
			expect(numEndContact).toEqual(0);

			rbcA.setPosition(new Vector3(0, 0, 3));
			rbcB.setPosition(new Vector3(0, 0, -3));

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(1);
			expect(numEndContact).toEqual(1);

			for (var key in listeners) {
				SystemBus.removeListener(key, listeners[key]);
			}

			done();
		});

		// it('filters collisions', function (done) {

		// 	var numBeginContact = 0;
		// 	var listeners = {
		// 		'goo.physics.beginContact': function () {
		// 			numBeginContact++;
		// 		}
		// 	};
		// 	for (var key in listeners) {
		// 		SystemBus.addListener(key, listeners[key]);
		// 	}

		// 	var rbcA = new AmmoRigidbodyComponent({ mass: 1 });
		// 	var rbcB = new AmmoRigidbodyComponent({ mass: 1 });
		// 	var ccA = new ColliderComponent({
		// 		collider: new SphereCollider({ radius: 1 })
		// 	});
		// 	var ccB = new ColliderComponent({
		// 		collider: new SphereCollider({ radius: 1 })
		// 	});
		// 	var entityA = world.createEntity(rbcA, ccA).addToWorld();
		// 	var entityB = world.createEntity(rbcB, ccB).addToWorld();
		// 	entityA.setTranslation(0, 0, 0.1);
		// 	entityB.setTranslation(0, 0, -0.1);

		// 	world.process(); // Needed to initialize bodies

		// 	expect(numBeginContact).toEqual(1);

		// 	rbcA.collisionGroup = PhysicsSystem.collisionGroups[0];
		// 	rbcA.collisionMask = PhysicsSystem.collisionGroups[0] | PhysicsSystem.collisionGroups[1];

		// 	rbcB.collisionGroup = PhysicsSystem.collisionGroups[1];
		// 	rbcB.collisionMask = PhysicsSystem.collisionGroups[0] | PhysicsSystem.collisionGroups[1];

		// 	world.process(); // Needed to initialize bodies

		// 	expect(numBeginContact).toEqual(2);

		// 	for (var key in listeners) {
		// 		SystemBus.removeListener(key, listeners[key]);
		// 	}

		// 	done();
		// });
	});
});
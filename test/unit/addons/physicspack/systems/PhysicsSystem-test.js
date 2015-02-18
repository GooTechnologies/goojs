define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/entities/SystemBus'
], function (
	World,
	PhysicsSystem,
	Vector3,
	RigidbodyComponent,
	ColliderComponent,
	RaycastResult,
	SphereCollider,
	SystemBus
) {
	'use strict';

	describe('PhysicsSystem', function () {
		var world, system;

		beforeEach(function () {
			world = new World();
			system = new PhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);
		});

		afterEach(function () {
			world.clearSystem('PhysicsSystem');
		});

		it('can raycast closest', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbcA = new RigidbodyComponent({ mass: 1 });
			var rbcB = new RigidbodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var ccB = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, ccA).addToWorld();
			var entityB = world.createEntity(rbcB, ccB).addToWorld();
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);
			world.process(); // Needed to initialize bodies

			var result = new RaycastResult();
			system.raycastClosest(start, direction, distance, {}, result);
			expect(result.normal).toEqual(new Vector3(0, 0, -1));
			expect(result.entity.name).toBe(entityB.name);

			// Now swap so that entityA is closer
			start.setDirect(0, 0, 10);
			direction.setDirect(0, 0, -1);

			result = new RaycastResult();
			system.raycastClosest(start, direction, distance, {}, result);
			expect(result.entity.name).toBe(entityA.name);
			expect(result.normal).toEqual(new Vector3(0, 0, 1));
		});

		it('can raycast any', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbcA = new RigidbodyComponent({ mass: 1 });
			var rbcB = new RigidbodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var ccB = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, ccA).addToWorld();
			var entityB = world.createEntity(rbcB, ccB).addToWorld();
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);
			world.process(); // Needed to initialize bodies

			var result = new RaycastResult();
			system.raycastAny(start, direction, distance, {}, result);
			expect(result.entity).toBeTruthy();
			expect(result.normal).toEqual(new Vector3(0, 0, -1));
		});

		it('can raycast all', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbcA = new RigidbodyComponent({ mass: 1 });
			var rbcB = new RigidbodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var ccB = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, ccA).addToWorld();
			var entityB = world.createEntity(rbcB, ccB).addToWorld();
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);
			world.process(); // Needed to initialize bodies

			var numHits = 0;
			system.raycastAll(start, direction, distance, {}, function (/*result*/) {
				numHits++;
			});
			expect(numHits).toBe(4);

			numHits = 0;
			system.raycastAll(start, direction, distance, {}, function (/*result*/) {
				numHits++;
				return false; // Abort traversal
			});
			expect(numHits).toBe(1);
		});

		it('can use collision groups', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbc = new RigidbodyComponent({ mass: 1 });
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entity = world.createEntity(rbc, cc).addToWorld();
			entity.setTranslation(0, 0, 3);
			world.process(); // Needed to initialize bodies

			var result = new RaycastResult();
			system.raycastAny(start, direction, distance, { collisionGroup: -1 }, result);
			expect(result.entity).toBeTruthy();

			result = new RaycastResult();
			system.raycastAny(start, direction, distance, { collisionGroup: 2 }, result);
			expect(result.entity).toBeFalsy();
		});

		it('can filter away backfaces', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbc = new RigidbodyComponent({ mass: 1 });
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbc, cc).addToWorld();
			world.process(); // Needed to initialize bodies

			var numHits = 0;
			system.raycastAll(start, direction, distance, { skipBackfaces: true }, function (result) {
				expect(result.normal).toEqual(new Vector3(0, 0, -1));
				numHits++;
			});
			expect(numHits).toBe(1);

			numHits = 0;
			system.raycastAll(start, direction, distance, { skipBackfaces: false }, function () {
				numHits++;
			});
			expect(numHits).toBe(2);
		});

		it('emits contact events', function () {
			var rbcA = new RigidbodyComponent({ mass: 1 });
			var rbcB = new RigidbodyComponent({ mass: 1 });
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
					expect(evt.entityA).toBe(entityA);
					expect(evt.entityB).toBe(entityB);
					numBeginContact++;
				},
				'goo.physics.duringContact': function (evt) {
					expect(evt.entityA).toBe(entityA);
					expect(evt.entityB).toBe(entityB);
					numDuringContact++;
				},
				'goo.physics.endContact': function (evt) {
					expect(evt.entityA).toBe(entityA);
					expect(evt.entityB).toBe(entityB);
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
		});

		it('emits substep events', function () {
			var substeps = 0;

			var listeners = {
				'goo.physics.substep': function () {
					substeps++;
				}
			};
			for (var key in listeners) {
				SystemBus.addListener(key, listeners[key]);
			}

			world.process();

			expect(substeps).toEqual(1);

			for (var key in listeners) {
				SystemBus.removeListener(key, listeners[key]);
			}
		});

		it('filters collisions', function () {

			var numBeginContact = 0;
			var listeners = {
				'goo.physics.beginContact': function () {
					numBeginContact++;
				}
			};
			for (var key in listeners) {
				SystemBus.addListener(key, listeners[key]);
			}

			var rbcA = new RigidbodyComponent({ mass: 1 });
			var rbcB = new RigidbodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var ccB = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, ccA).addToWorld();
			var entityB = world.createEntity(rbcB, ccB).addToWorld();
			entityA.setTranslation(0, 0, 0.1);
			entityB.setTranslation(0, 0, -0.1);

			world.process(); // Needed to initialize bodies

			expect(numBeginContact).toEqual(1);

			rbcA.collisionMask = 0; // none
			rbcB.collisionMask = 0;

			world.process(); // Needed to initialize bodies

			expect(numBeginContact).toEqual(1);

			for (var key in listeners) {
				SystemBus.removeListener(key, listeners[key]);
			}
		});

		it('can pause and play', function () {
			system.pause();
			expect(system.passive).toBeTruthy();
			system.play();
			expect(system.passive).toBeFalsy();
		});

		it('can stop and play', function () {

			var rbcA = new RigidbodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbcA, ccA).addToWorld();

			world.process();
			expect(rbcA._dirty).toBeFalsy();

			system.stop();
			expect(rbcA._dirty).toBeTruthy();

			world.process();
			expect(rbcA._dirty).toBeTruthy();

			system.play();
			world.process();
			expect(rbcA._dirty).toBeFalsy();
		});
	});
});
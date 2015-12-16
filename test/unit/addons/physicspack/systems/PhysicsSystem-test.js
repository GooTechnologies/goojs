define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/entities/SystemBus',
	'test/CustomMatchers'
], function (
	World,
	PhysicsSystem,
	Vector3,
	RigidBodyComponent,
	ColliderComponent,
	RaycastResult,
	SphereCollider,
	SystemBus,
	CustomMatchers
) {
	'use strict';

	describe('PhysicsSystem', function () {
		var world, system;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
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

			var rbcA = new RigidBodyComponent({ mass: 1 });
			var rbcB = new RigidBodyComponent({ mass: 1 });
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

			rbcA.initialize(); // Needed to initialize bodies
			rbcB.initialize();

			var result = new RaycastResult();
			system.raycastClosest(start, direction, distance, {}, result);
			expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
			expect(result.entity).toBe(entityB);
			expect(result.distance).toBeCloseTo(6);

			// Now swap so that entityA is closer
			start.setDirect(0, 0, 10);
			direction.setDirect(0, 0, -1);

			result = new RaycastResult();
			system.raycastClosest(start, direction, distance, {}, result);
			expect(result.entity).toBe(entityA);
			expect(result.normal).toBeCloseToVector(new Vector3(0, 0, 1));
			expect(result.distance).toBeCloseTo(6);
		});

		it('can raycast any', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbcA = new RigidBodyComponent({ mass: 1 });
			var rbcB = new RigidBodyComponent({ mass: 1 });
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

			rbcA.initialize(); // Needed to initialize bodies
			rbcB.initialize();

			var result = new RaycastResult();
			system.raycastAny(start, direction, distance, {}, result);
			expect(result.entity).toBeTruthy();
			expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
		});

		it('can raycast all', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;

			var rbcA = new RigidBodyComponent({ mass: 1 });
			var rbcB = new RigidBodyComponent({ mass: 1 });
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

			rbcA.initialize(); // Needed to initialize bodies
			rbcB.initialize();

			var numHits = 0;
			system.raycastAll(start, direction, distance, { skipBackfaces: false }, function (/*result*/) {
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

			var rbc = new RigidBodyComponent({ mass: 1 });
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entity = world.createEntity(rbc, cc).addToWorld();
			entity.setTranslation(0, 0, 3);

			rbc.initialize(); // Needed to initialize body

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

			var rbc = new RigidBodyComponent({ mass: 1 });
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbc, cc).addToWorld();

			rbc.initialize(); // Needed to initialize body

			var numHits = 0;
			system.raycastAll(start, direction, distance, { skipBackfaces: true }, function (result) {
				expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
				numHits++;
			});
			expect(numHits).toBe(1);

			numHits = 0;
			system.raycastAll(start, direction, distance, { skipBackfaces: false }, function () {
				numHits++;
			});
			expect(numHits).toBe(2);
		});

		it('can raycast with optional parameters', function () {
			var start = new Vector3(0, 0, -10);
			var direction = new Vector3(0, 0, 1);
			var distance = 20;
			var options = {};
			var result = new RaycastResult();

			expect(system.raycastAll(start, direction, distance, options, function () {})).toBe(false);
			expect(system.raycastAll(start, direction, distance, function () {})).toBe(false);

			expect(system.raycastAny(start, direction, distance, options, result)).toBe(false);
			expect(system.raycastAny(start, direction, distance, result)).toBe(false);
			expect(system.raycastAny(start, direction, distance)).toBe(false);

			expect(system.raycastClosest(start, direction, distance, options, result)).toBe(false);
			expect(system.raycastClosest(start, direction, distance, result)).toBe(false);
			expect(system.raycastClosest(start, direction, distance)).toBe(false);
		});

		it('emits contact events', function () {
			function sortEntitiesByName(a, b) {
				if (a.name === b.name) {
					return 0;
				}
				return a.name > b.name ? 1 : -1;
			}

			var rbcA = new RigidBodyComponent({ mass: 1 });
			var rbcB = new RigidBodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var ccB = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entityA = world.createEntity(rbcA, ccA).addToWorld();
			var entityB = world.createEntity(rbcB, ccB).addToWorld();
			var entities = [entityA, entityB].sort(sortEntitiesByName);
			entityA.setTranslation(0, 0, 3);
			entityB.setTranslation(0, 0, -3);

			var numBeginContact = 0;
			var numDuringContact = 0;
			var numEndContact = 0;

			var listeners = {
				'goo.physics.beginContact': function (evt) {
					expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
					numBeginContact++;
				},
				'goo.physics.duringContact': function (evt) {
					expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
					numDuringContact++;
				},
				'goo.physics.endContact': function (evt) {
					expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
					numEndContact++;
				}
			};
			for (var key in listeners) {
				SystemBus.addListener(key, listeners[key]);
			}

			rbcA.initialize(); // Needed to initialize bodies
			rbcB.initialize();

			world.process();

			expect(numBeginContact).toEqual(0);
			expect(numDuringContact).toEqual(0);
			expect(numEndContact).toEqual(0);

			rbcA.setPosition(new Vector3(0, 0, 0.1));
			rbcB.setPosition(new Vector3(0, 0, -0.1));

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(1);
			expect(numEndContact).toEqual(0);

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(2);
			expect(numEndContact).toEqual(0);

			rbcA.setPosition(new Vector3(0, 0, 3));
			rbcB.setPosition(new Vector3(0, 0, -3));

			world.process();

			expect(numBeginContact).toEqual(1);
			expect(numDuringContact).toEqual(2);
			expect(numEndContact).toEqual(1);

			for (var key in listeners) {
				SystemBus.removeListener(key, listeners[key]);
			}
		});

		describe('trigger and contact events', function () {
			var numTriggerEnter = 0;
			var numTriggerStay = 0;
			var numTriggerExit = 0;
			var numBeginContact = 0;
			var numDuringContact = 0;
			var numEndContact = 0;

			var listeners = {
				'goo.physics.triggerEnter': function () {
					numTriggerEnter++;
				},
				'goo.physics.triggerStay': function () {
					numTriggerStay++;
				},
				'goo.physics.triggerExit': function () {
					numTriggerExit++;
				},
				'goo.physics.beginContact': function () {
					numBeginContact++;
				},
				'goo.physics.duringContact': function () {
					numDuringContact++;
				},
				'goo.physics.endContact': function () {
					numEndContact++;
				}
			};

			beforeEach(function () {
				numTriggerEnter = 0;
				numTriggerStay = 0;
				numTriggerExit = 0;
				numBeginContact = 0;
				numDuringContact = 0;
				numEndContact = 0;

				for (var key in listeners) {
					SystemBus.addListener(key, listeners[key]);
				}
			});

			afterEach(function () {
				for (var key in listeners) {
					SystemBus.removeListener(key, listeners[key]);
				}
			});

			function createStaticCollider(x) {
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 })
				});
				world.createEntity(ccA, [x || 0, 0, 0]).addToWorld();
				ccA.initialize();
			}

			function createStaticTriggerCollider(x) {
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 }),
					isTrigger: true
				});
				world.createEntity(ccA, [x || 0, 0, 0]).addToWorld();
				ccA.initialize();
			}

			function createRigidBodyTriggerCollider() {
				var rbcA = new RigidBodyComponent({ mass: 1 });
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 }),
					isTrigger: true
				});
				world.createEntity(rbcA, ccA).addToWorld();
				rbcA.initialize();
			}

			function createRigidBodyCollider(x) {
				var rbcA = new RigidBodyComponent({ mass: 1 });
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 })
				});
				world.createEntity(rbcA, ccA, [x || 0, 0, 0]).addToWorld();
				rbcA.initialize();
			}

			function createKinematicRigidBodyCollider() {
				var rbcA = new RigidBodyComponent({ mass: 1, isKinematic: true });
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 })
				});
				world.createEntity(rbcA, ccA).addToWorld();
				rbcA.initialize();
			}

			function createKinematicRigidBodyTriggerCollider() {
				var rbcA = new RigidBodyComponent({ mass: 1, isKinematic: true });
				var ccA = new ColliderComponent({
					collider: new SphereCollider({ radius: 1 }),
					isTrigger: true
				});
				world.createEntity(rbcA, ccA).addToWorld();
				rbcA.initialize();
			}

			describe('Static Collider vs...', function () {
				it('Static Collider', function () {
					createStaticCollider();
					createStaticCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigid Body Collider', function () {
					createStaticCollider(0);
					createRigidBodyCollider(0.1);

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(1);
					expect(numDuringContact).toEqual(1);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Collider', function () {
					createStaticCollider();
					createKinematicRigidBodyCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Static Trigger Collider', function () {
					createStaticCollider();
					createStaticTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigidbody Trigger Collider', function () {
					createStaticCollider();
					createRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigidbody Trigger Collider', function () {
					createStaticCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});

			describe('Rigid Body Collider vs...', function () {
				it('Rigid Body Collider', function () {
					createRigidBodyCollider();
					createRigidBodyCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(1);
					expect(numDuringContact).toEqual(1);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Collider', function () {
					createRigidBodyCollider();
					createKinematicRigidBodyCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(1);
					expect(numDuringContact).toEqual(1);
					expect(numEndContact).toEqual(0);
				});

				it('Static Trigger Collider', function () {
					createRigidBodyCollider();
					createStaticTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigid Body Trigger Collider', function () {
					createRigidBodyCollider();
					createRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Trigger Collider', function () {
					createRigidBodyCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});


			describe('Kinematic Rigid Body Collider vs...', function () {

				it('Kinematic Rigid Body Collider', function () {
					createKinematicRigidBodyCollider();
					createKinematicRigidBodyCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Static Trigger Collider', function () {
					createKinematicRigidBodyCollider();
					createStaticTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigid Body Trigger Collider', function () {
					createKinematicRigidBodyCollider();
					createRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Trigger Collider', function () {
					createKinematicRigidBodyCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});

			describe('Static Trigger Collider vs...', function () {

				it('Static Trigger Collider', function () {
					createStaticTriggerCollider();
					createStaticTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(0);
					expect(numTriggerStay).toEqual(0);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Rigid Body Trigger Collider', function () {
					createStaticTriggerCollider();
					createRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Trigger Collider', function () {
					createStaticTriggerCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});

			describe('Rigid Body Trigger Collider vs...', function () {

				it('Rigid Body Trigger Collider', function () {
					createRigidBodyTriggerCollider();
					createRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});

				it('Kinematic Rigid Body Trigger Collider', function () {
					createRigidBodyTriggerCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});

			describe('Kinematic Rigid Body Trigger Collider vs...', function () {

				it('Kinematic Rigid Body Trigger Collider', function () {
					createKinematicRigidBodyTriggerCollider();
					createKinematicRigidBodyTriggerCollider();

					world.process();

					expect(numTriggerEnter).toEqual(1);
					expect(numTriggerStay).toEqual(1);
					expect(numTriggerExit).toEqual(0);
					expect(numBeginContact).toEqual(0);
					expect(numDuringContact).toEqual(0);
					expect(numEndContact).toEqual(0);
				});
			});
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

			var rbcA = new RigidBodyComponent({ mass: 1 });
			var rbcB = new RigidBodyComponent({ mass: 1 });
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

			rbcA.initialize();
			rbcB.initialize();
			world.process();

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

		it('can set and get gravity', function () {
			system.setGravity(new Vector3(1, 2, 3));
			var gravity = new Vector3();
			system.getGravity(gravity);
			expect(gravity).toEqual(new Vector3(1, 2, 3));
		});

		//! AT: what is this supposed to test?
		it('can stop and play', function () {
			//! AT: bad variable names
			var rbcA = new RigidBodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbcA, ccA).addToWorld();

			world.process();

			system.stop();

			world.process();

			system.play();
			world.process();
		});
	});
});
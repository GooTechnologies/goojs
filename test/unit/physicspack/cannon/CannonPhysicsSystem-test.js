define([
	'goo/entities/World',
	'goo/physicspack/cannon/CannonPhysicsSystem',
	'goo/math/Vector3',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/RaycastResult',
	'goo/physicspack/colliders/SphereCollider'
], function (
	World,
	CannonPhysicsSystem,
	Vector3,
	RigidbodyComponent,
	ColliderComponent,
	RaycastResult,
	SphereCollider
) {
	'use strict';

	describe('CannonPhysicsSystem', function () {
		var world, system;

		beforeEach(function () {
			world = new World();
			system = new CannonPhysicsSystem();
			system.setGravity(new Vector3());
			world.setSystem(system);
		});

		it('can raycast closest', function (done) {
			var start = new Vector3(0, 0, -10);
			var end = new Vector3(0, 0, 10);
			var rbcA = new RigidbodyComponent();
			var rbcB = new RigidbodyComponent();
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
			rbcA.rigidbody.setPosition(new Vector3(0, 0, -3));
			rbcB.rigidbody.setPosition(new Vector3(0, 0, 3));
			world.process();

			system.raycastClosest(start, end, result);
			expect(result.entity).toEqual(entityA);

			done();
		});
	});
});
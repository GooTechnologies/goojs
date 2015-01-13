define([
	'goo/entities/World',
	'goo/physicspack/PhysicsSystem',
	'goo/entities/systems/TransformSystem',
	'goo/math/Vector3',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/RaycastResult',
	'goo/physicspack/colliders/SphereCollider'
], function (
	World,
	PhysicsSystem,
	TransformSystem,
	Vector3,
	RigidbodyComponent,
	ColliderComponent,
	RaycastResult,
	SphereCollider
) {
	'use strict';

	describe('ColliderComponent', function () {
		var world, system;

		beforeEach(function () {
			world = new World();
			system = new PhysicsSystem({
				maxSubSteps: 1
			});
			system.setGravity(new Vector3());
			world.setSystem(system);
			world.setSystem(new TransformSystem());
		});

		it('can update its world collider', function (done) {
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entity = world.createEntity(cc).addToWorld();

			entity.setTranslation(1, 2, 3);
			entity.setScale(1, 2, 3);

			world.process();

			cc.updateWorldCollider();

			expect(cc.worldCollider.radius).toBe(3);

			done();
		});
	});
});
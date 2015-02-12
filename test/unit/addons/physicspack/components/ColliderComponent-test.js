define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/entities/systems/TransformSystem',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/colliders/SphereCollider'
], function (
	World,
	PhysicsSystem,
	ColliderSystem,
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
			world.setSystem(new ColliderSystem());
		});

		it('can update its world collider', function () {
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			var entity = world.createEntity(cc).addToWorld();

			entity.setTranslation(1, 2, 3);
			entity.setScale(1, 2, 3);

			cc.updateWorldCollider(true);

			expect(cc.worldCollider.radius).toBe(3);
		});
	});
});
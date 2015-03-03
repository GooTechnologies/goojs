define([
	'goo/entities/World',
	'goo/addons/physicspack/PhysicsMaterial',
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
	PhysicsMaterial,
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

	/* global CANNON */

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

		it('instantiates as a static body without a rigid body component', function () {
			var material = new PhysicsMaterial({
				friction: 0.6,
				restitution: 0.7
			});
			var cc = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				material: material
			});
			var entity = world.createEntity(cc).addToWorld();

			// Initialize
			world.process();

			expect(cc.bodyEntity).toBeFalsy();
			expect(cc.cannonBody).toBeTruthy();
			expect(cc.cannonBody.shapes[0] instanceof CANNON.Sphere).toBeTruthy();
			expect(cc.cannonBody.shapes[0].material.friction).toBe(material.friction);
			expect(cc.cannonBody.shapes[0].material.restitution).toBe(material.restitution);
			expect(cc.cannonBody.type).toBe(CANNON.Body.STATIC);

			entity.removeFromWorld();

			// Cleanup
			world.process();

			expect(cc.bodyEntity).toBeFalsy();
			expect(cc.cannonBody).toBeFalsy();
		});
	});
});
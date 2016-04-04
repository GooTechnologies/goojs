var SphereCollider = require('../../../../../src/goo/addons/physicspack/colliders/SphereCollider');
var Vector3 = require('../../../../../src/goo/math/Vector3');
var World = require('../../../../../src/goo/entities/World');
var TransformSystem = require('../../../../../src/goo/entities/systems/TransformSystem');
var PhysicsMaterial = require('../../../../../src/goo/addons/physicspack/PhysicsMaterial');
var PhysicsSystem = require('../../../../../src/goo/addons/physicspack/systems/PhysicsSystem');
var ColliderSystem = require('../../../../../src/goo/addons/physicspack/systems/ColliderSystem');
var ColliderComponent = require('../../../../../src/goo/addons/physicspack/components/ColliderComponent');

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
		var colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entity = world.createEntity(colliderComponent).addToWorld();

		entity.setTranslation(1, 2, 3);
		entity.setScale(1, 2, 3);

		colliderComponent.updateWorldCollider(true);

		expect(colliderComponent.worldCollider.radius).toBe(3);
	});

	it('instantiates as a static body without a rigid body component', function () {
		var material = new PhysicsMaterial({
			friction: 0.6,
			restitution: 0.7
		});
		var colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 }),
			material: material
		});
		var entity = world.createEntity(colliderComponent).addToWorld();

		// Initialize
		colliderComponent.initialize();

		expect(colliderComponent.bodyEntity).toBeFalsy();
		expect(colliderComponent.cannonBody).toBeTruthy();
		expect(colliderComponent.cannonBody.shapes[0] instanceof CANNON.Sphere).toBeTruthy();
		expect(colliderComponent.cannonBody.shapes[0].material.friction).toBe(material.friction);
		expect(colliderComponent.cannonBody.shapes[0].material.restitution).toBe(material.restitution);
		expect(colliderComponent.cannonBody.type).toBe(CANNON.Body.STATIC);

		entity.removeFromWorld();

		// Cleanup
		colliderComponent.destroy();

		expect(colliderComponent.bodyEntity).toBeFalsy();
		expect(colliderComponent.cannonBody).toBeFalsy();
	});
});

require([
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/math/Vector3',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/ColliderSystem',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'lib/V'
], function (
	SystemBus,
	Sphere,
	Quad,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidbodyComponent,
	SphereCollider,
	PlaneCollider,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a rigidbody component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	// physicsSystem.setGravity(Vector3.ZERO);
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	var material = V.getColoredMaterial();
	var radius = 5;
	var sphereMesh = new Sphere(20, 20, radius);


	var entityA = world.createEntity(sphereMesh, material)
		.set(new ColliderComponent({
			collider: new SphereCollider({ radius: radius }),
			isTrigger: true
		}))
		.set(new RigidbodyComponent({
			mass: 0
		}))
		.addToWorld();

	var entityB = world.createEntity(sphereMesh, material, [0, radius * 2 + 1, 0])
		.set(new ColliderComponent({
			collider: new SphereCollider({ radius: radius })
		}))
		.set(new RigidbodyComponent({
			mass: 1
		}))
		.addToWorld();

	SystemBus.addListener('goo.physics.beginContact', function (evt) {
		material.uniforms.materialDiffuse = [1, 0, 0, 1];

		console.log('goo.physics.beginContact', evt);
	});

	SystemBus.addListener('goo.physics.endContact', function (evt) {
		material.uniforms.materialDiffuse = [0, 1, 0, 1];

		console.log('goo.physics.endContact', evt);
	});

	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});

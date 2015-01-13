require([
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/ColliderSystem',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/colliders/SphereCollider',
	'lib/V'
], function (
	SystemBus,
	Sphere,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidbodyComponent,
	SphereCollider,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a rigidbody component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());
	world.registerComponent(ColliderComponent);
	world.registerComponent(RigidbodyComponent);

	var material = V.getColoredMaterial();
	var radius = 5;
	var sphereMesh = new Sphere(20, 20, radius);

	// Adding the components, style 1
	var collider = new SphereCollider({ radius: radius });
	var position = [0, radius * 2 + 1, 0];
	var body = new RigidbodyComponent({ mass: 1 });
	world.createEntity(sphereMesh, material, position, collider, body).addToWorld();

	// Adding the components, style 2
	world.createEntity(sphereMesh, material)
		.set(new ColliderComponent({
			collider: new SphereCollider({ radius: radius }),
			isTrigger: true
		}))
		.set(new RigidbodyComponent({
			mass: 0
		}))
		.addToWorld();

	SystemBus.addListener('goo.physics.beginContact', function (evt) {
		material.uniforms.materialDiffuse = [1, 0, 0, 1];
		console.log('Contact begins between', evt.entityA, 'and', evt.entityB);
	});

	SystemBus.addListener('goo.physics.duringContact', function (/*evt*/) {
		console.log('During contact event is emitted!');
		// evt.entityA
		// evt.entityB
	});

	SystemBus.addListener('goo.physics.endContact', function (evt) {
		material.uniforms.materialDiffuse = [0, 1, 0, 1];
		console.log('Contact ends between', evt.entityA, 'and', evt.entityB);
	});

	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});

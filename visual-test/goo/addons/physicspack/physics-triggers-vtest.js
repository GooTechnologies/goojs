require([
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/addons/physicspack/colliders/SphereCollider',
	'lib/V'
], function (
	SystemBus,
	Sphere,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidBodyComponent,
	SphereCollider,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a rigidBody component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	physicsSystem.setGravity(Vector3.ZERO);
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());
	world.registerComponent(ColliderComponent);
	world.registerComponent(RigidBodyComponent);

	var material = V.getColoredMaterial();
	var radius = 5;
	var sphereMesh = new Sphere(20, 20, radius);

	// Adding the components, style 1
	var collider = new SphereCollider({ radius: radius });
	var body = new RigidBodyComponent({ mass: 1, isKinematic: true, velocity: new Vector3(0, 0, 10) });
	world.createEntity(sphereMesh, material, collider, body).addToWorld();

	// Adding the components, style 2
	world.createEntity(sphereMesh, material)
		.set(new ColliderComponent({
			collider: new SphereCollider({ radius: radius }),
			isTrigger: true
		}))
		.set(new RigidBodyComponent({
			mass: 1
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

	var position = new Vector3();
	var velocity = new Vector3();
	goo.callbacks.push(function () {
		body.getPosition(position);
		if (Math.abs(position.z) > radius * 3) {
			body.getVelocity(velocity);
			velocity.z = -Math.sign(position.z) * 10;
			body.setVelocity(velocity);
		}
	});

	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});

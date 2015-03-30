require([
	'goo/entities/SystemBus',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/systems/PhysicsDebugRenderSystem',
	'lib/V'
], function (
	SystemBus,
	Box,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidBodyComponent,
	BoxCollider,
	PhysicsDebugRenderSystem,
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
	goo.setRenderSystem(new PhysicsDebugRenderSystem());

	var material = V.getColoredMaterial();
	var radius = 5;
	var sphereMesh = new Box(radius, radius, radius);

	// Adding the components, style 1
	var collider = new BoxCollider({ halfExtents: new Vector3(radius / 2, radius / 2, radius / 2) });
	var body = new RigidBodyComponent({ mass: 1, isKinematic: true, velocity: new Vector3(0, 0, 10) });
	world.createEntity(sphereMesh, material, collider, body).addToWorld();

	// Adding the components, style 2
	world.createEntity(sphereMesh, material)
		.set(new ColliderComponent({
			collider: new BoxCollider({ halfExtents: new Vector3(radius / 2, radius / 2, radius / 2) }),
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

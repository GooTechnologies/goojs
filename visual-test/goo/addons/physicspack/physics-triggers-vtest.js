goo.V.attachToGlobal();

	V.describe('The entities in the scene hold a rigidBody component which updates their transform.');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var physicsSystem = new PhysicsSystem();
	physicsSystem.setGravity(Vector3.ZERO);
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());
	world.registerComponent(ColliderComponent);
	world.registerComponent(RigidBodyComponent);
	gooRunner.setRenderSystem(new PhysicsDebugRenderSystem());

	var material = V.getColoredMaterial();
	var radius = 5;
	var sphereMesh = new Box(radius, radius, radius);

	// Adding the components, style 1
	var collider = new BoxCollider({ halfExtents: new Vector3(radius / 2, radius / 2, radius / 2) });
	var body = new RigidBodyComponent({ mass: 1, isKinematic: true, velocity: new Vector3(0, 0, 10) });
	world.createEntity(sphereMesh, material, collider, body).addToWorld();
	body.initialize();

	// Adding the components, style 2
	var entity = world.createEntity(sphereMesh, material)
		.set(new ColliderComponent({
			collider: new BoxCollider({ halfExtents: new Vector3(radius / 2, radius / 2, radius / 2) }),
			isTrigger: true
		}))
		.set(new RigidBodyComponent({
			mass: 1
		}))
		.addToWorld();

	entity.rigidBodyComponent.initialize();

	SystemBus.addListener('gooRunner.physics.triggerEnter', function (evt) {
		material.uniforms.materialDiffuse = [1, 0, 0, 1];
		console.log('Trigger is entered!', evt.entityA, evt.entityB);
	});

	SystemBus.addListener('gooRunner.physics.triggerStay', function (/*evt*/) {
		console.log('Object is staying inside the trigger!');
	});

	SystemBus.addListener('gooRunner.physics.triggerExit', function (evt) {
		material.uniforms.materialDiffuse = [0, 1, 0, 1];
		console.log('Trigger exited!', evt.entityA, evt.entityB);
	});

	var position = new Vector3();
	var velocity = new Vector3();
	gooRunner.callbacks.push(function () {
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
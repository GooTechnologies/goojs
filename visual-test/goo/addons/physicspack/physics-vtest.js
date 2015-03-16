require([
	'goo/renderer/Material',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/joints/BallJoint',
	'goo/addons/physicspack/joints/HingeJoint',
	'lib/V'
], function (
	Material,
	Sphere,
	Box,
	Cylinder,
	Quad,
	TextureCreator,
	ShaderLib,
	OrbitCamControlScript,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidBodyComponent,
	BoxCollider,
	CylinderCollider,
	SphereCollider,
	PlaneCollider,
	BallJoint,
	HingeJoint,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a rigidBody component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var position = [
				V.rng.nextFloat() * 16 - 8,
				V.rng.nextFloat() * 16 + 8,
				V.rng.nextFloat() * 16 - 8
			];

			var rigidBodyComponent = new RigidBodyComponent();
			var entity;
			var colliderComponent;
			var mat = V.getColoredMaterial();

			if (V.rng.nextFloat() < 0.2) {
				var radius = 1 + V.rng.nextFloat();
				entity = world.createEntity(new Box(radius * 2, radius * 2, radius * 2), mat, position);
				colliderComponent = new ColliderComponent({
					collider: new BoxCollider({
						halfExtents: new Vector3(radius, radius, radius)
					})
				});
				entity.set(rigidBodyComponent).set(colliderComponent);

			} else if (V.rng.nextFloat() < 0.5) {

				var radius = 1 + V.rng.nextFloat();
				entity = world.createEntity(position);
				colliderComponent = new ColliderComponent({
					collider: new CylinderCollider({
						height: radius * 2,
						radius: radius
					})
				});
				var colliderEntity = world.createEntity(new Cylinder(10, radius, radius, radius * 2), mat);
				colliderEntity.set(colliderComponent);
				entity.set(rigidBodyComponent);
				entity.attachChild(colliderEntity);

			} else {

				var radius = 1 + V.rng.nextFloat();
				entity = world.createEntity(new Sphere(10, 10, radius), mat, position);
				colliderComponent = new ColliderComponent({
					collider: new SphereCollider({ radius: radius })
				});
				entity.set(rigidBodyComponent).set(colliderComponent);
			}
			entity.addToWorld();
		}
	}

	function createGround() {
		var entity = world.createEntity(new Quad(1000, 1000, 100, 100), V.getColoredMaterial(0.7, 0.7, 0.7))
			.set([0, -10, 0])
			.setRotation(-Math.PI / 2, 0, 0);
		var rigidBodyComponent = new RigidBodyComponent({ isKinematic: true });
		var planeColliderComponent = new ColliderComponent({ collider: new PlaneCollider() });
		entity.set(rigidBodyComponent)
			.set(planeColliderComponent)
			.addToWorld();
	}

	function createStaticBox(x, y, z, w, d, h) {
		return world.createEntity(new Box(w, d, h), V.getColoredMaterial(), [x, y, z])
			.set(new RigidBodyComponent({ isKinematic: true }))
			.set(
				new ColliderComponent({
					collider: new BoxCollider({
						halfExtents: new Vector3(w / 2, d / 2, h / 2)
					})
				})
			).addToWorld();
	}

	// Create a 'G' compound box body
	function createCompound(x, y, z) {

		// Create 'root' entity
		var compoundEntity = world.createEntity(new Vector3(x, y, z));

		// Add a rigid body component to it
		compoundEntity.set(new RigidBodyComponent({ mass : 5 }));

		// Define half extents for all boxes
		var h1 = new Vector3(4, 1, 1),
			h2 = new Vector3(1, 3, 1),
			h3 = new Vector3(2, 1, 1),
			h4 = new Vector3(1, 1, 1),
			h5 = new Vector3(4, 1, 1);

		// Create 'sub entities' that, each holding a collider. Position is relative to the root entity.
		var subEntity1 = world.createEntity(
			new Box(h1.x * 2, h1.y * 2, h1.z * 2),
			V.getColoredMaterial(),
			new Vector3(0, 2, 0).scale(2),
			new ColliderComponent({ collider: new BoxCollider({ halfExtents: h1 }) })
		);
		var subEntity2 = world.createEntity(
			new Box(h2.x * 2, h2.y * 2, h2.z * 2),
			V.getColoredMaterial(),
			new Vector3(-1.5, 0, 0).scale(2),
			new ColliderComponent({ collider: new BoxCollider({ halfExtents: h2 }) })
		);
		var subEntity3 = world.createEntity(
			new Box(h3.x * 2, h3.y * 2, h3.z * 2),
			V.getColoredMaterial(),
			new Vector3(1, 0, 0).scale(2),
			new ColliderComponent({ collider: new BoxCollider({ halfExtents: h3 }) })
		);
		var subEntity4 = world.createEntity(
			new Box(h4.x * 2, h4.y * 2, h4.z * 2),
			V.getColoredMaterial(),
			new Vector3(1.5, -1, 0).scale(2),
			new ColliderComponent({ collider: new BoxCollider({ halfExtents: h4 }) })
		);
		var subEntity5 = world.createEntity(
			new Box(h5.x * 2, h5.y * 2, h5.z * 2),
			V.getColoredMaterial(),
			new Vector3(0, -2, 0).scale(2),
			new ColliderComponent({ collider: new BoxCollider({ halfExtents: h5 }) })
		);

		// Attach the children to the root
		compoundEntity
			.attachChild(subEntity1)
			.attachChild(subEntity2)
			.attachChild(subEntity3)
			.attachChild(subEntity4)
			.attachChild(subEntity5);

		// Add them to the world
		subEntity1.addToWorld();
		subEntity2.addToWorld();
		subEntity3.addToWorld();
		subEntity4.addToWorld();
		subEntity5.addToWorld();

		// Add the root
		compoundEntity.addToWorld();

		return compoundEntity;
	}

	function createChain(x, y, z, numLinks, size) {
		var lastEntity;
		for (var i = 0; i < numLinks; i++) {
			var rbComponent = new RigidBodyComponent({
				mass: i ? 1 : 0,
				velocity: new Vector3(0, 0, 3 * i)
			});
			var e = world.createEntity(new Sphere(), V.getColoredMaterial(), [x, y - i * size, z])
				.set(rbComponent)
				.set(new ColliderComponent({ collider: new SphereCollider() }))
				.setScale(size, size, size)
				.addToWorld();

			if (lastEntity) {
				e.rigidBodyComponent.addJoint(new BallJoint({
					connectedEntity: lastEntity,
					localPivot: new Vector3(0, 1, 0)
				}));
			}

			lastEntity = e;
		}
	}

	function createHinge(x, y, z) {
		var lastEntity;
		var scale = 2;
		var a = 0.9;
		var b = 0.1;
		for (var i = 0; i < 5; i++) {
			var rbComponent = new RigidBodyComponent({
				mass: i ? 1 : 0,
				velocity: new Vector3(0, 0, 3 * i)
			});
			var e = world.createEntity(new Box(a, a, b), V.getColoredMaterial(), [x, y - i * scale, z])
				.set(rbComponent)
				.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: new Vector3(a * 0.5, a * 0.5, b * 0.5) }) }))
				.addToWorld().setScale(scale, scale, scale);

			if (lastEntity) {
				e.rigidBodyComponent.addJoint(new HingeJoint({
					connectedEntity: lastEntity,
					localPivot: new Vector3(0, 0.5, 0),
					localAxis: new Vector3(1, 0, 0)
				}));
			}

			lastEntity = e;
		}
	}

	function createKinematic() {
		var rbComponent = new RigidBodyComponent({
			mass: 0,
			velocity: new Vector3(0, 0, 3),
			angularVelocity: new Vector3(0, 0, 3),
			isKinematic: true
		});

		var halfExtents = new Vector3(1, 1, 1);
		world.createEntity(new Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), V.getColoredMaterial(), [0, 0, 5])
			.set(rbComponent)
			.set(
				new ColliderComponent({
					collider: new BoxCollider({
						halfExtents: halfExtents
					})
				})
			).addToWorld();
	}

	createKinematic();
	addPrimitives();
	var N = 5;
	createChain(0, 4, 10, N, 2);
	createGround();
	createCompound(0, 5, 0);
	createHinge(5, 5, 0);

	var forcefieldEnabled = false;
	var paused = false;
	document.addEventListener('keydown', function (evt) {
		switch (evt.keyCode) {
		case 69:
			explode();
			break;
		case 32:
			// Add force field
			forcefieldEnabled = true;
			break;
		case 80: // p
			// toggle pause
			if (!paused) {
				physicsSystem.pause();
			} else {
				physicsSystem.play();
			}
			paused = !paused;
			break;
		default:
			addPrimitives();
			break;
		}
	}, false);

	document.addEventListener('keyup', function (evt) {
		switch (evt.keyCode) {
		case 32:
			// Add force field
			forcefieldEnabled = false;
			break;
		}
	}, false);

	V.button('Enable force field', function () {
		forcefieldEnabled = true;
	});

	V.button('Disable force field', function () {
		forcefieldEnabled = false;
	});

	V.button('Explode', function () {
		explode();
	});

	console.log('SPACE: force field\nE: Explode!\nP: Toggle pause\nANY OTHER KEY: add bodies');

	var w = 1;
	createStaticBox(0, -7.5,  10 + w / 2, 20 + w, 5,  w);
	createStaticBox(0, -7.5, -10 - w / 2, 20 + w, 5,  w);
	createStaticBox(10, -7.5, 0, w, 5, 20);
	createStaticBox(-10, -7.5, 0, w, 5, 20);

	var force = new Vector3();
	goo.callbacks.push(function () {
		if (forcefieldEnabled) {
			// Add some force to all bodies
			world.by.system(physicsSystem.type).each(function (entity) {
				// Force is directed to the origin
				force.copy(entity.getTranslation(force)).mul(-1);

				// Set a proper length of it
				force.normalize();
				force.mul(700);

				// Apply it to the entity
				entity.rigidBodyComponent.applyForce(force);
			});
		}
	});

	function explode() {
		// Add some force to all bodies
		world.by.system(physicsSystem.type).each(function (entity) {
			// Force is directed to the origin
			force.copy(entity.getTranslation(force));

			// Set a proper length of it
			force.normalize();
			force.mul(5000);

			// Apply it to the entity
			entity.rigidBodyComponent.applyForce(force);
		});
	}

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

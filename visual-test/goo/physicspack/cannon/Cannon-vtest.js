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
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/CannonPhysicsSystem',
	'goo/physicspack/AmmoPhysicsSystem',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/joints/BallJoint',
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
	CannonPhysicsSystem,
	AmmoPhysicsSystem,
	RigidbodyComponent,
	BoxCollider,
	CylinderCollider,
	SphereCollider,
	PlaneCollider,
	BallJoint,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a cannon component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	//world.setSystem(new CannonPhysicsSystem());
	world.setSystem(new AmmoPhysicsSystem());

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var position = [
				V.rng.nextFloat() * 16 - 8,
				V.rng.nextFloat() * 16 + 8,
				V.rng.nextFloat() * 16 - 8
			];

			var rigidBodyComponent = new RigidbodyComponent();
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
						radiusTop: radius,
						radiusBottom: radius,
						numSegments: 10
					})
				});
				var colliderEntity = world.createEntity(new Cylinder(10, radius, radius, radius * 2), mat);
				colliderEntity.set(colliderComponent);
				colliderEntity.setRotation(-Math.PI / 2, 0, 0);
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
		var rigidBodyComponent = new RigidbodyComponent({ isKinematic: true });
		var planeColliderComponent = new ColliderComponent({ collider: new PlaneCollider() });
		entity.set(rigidBodyComponent)
			.set(planeColliderComponent)
			.addToWorld();
	}

	function createStaticBox(x, y, z, w, d, h) {
		return world.createEntity(new Box(w, d, h), V.getColoredMaterial(), [x, y, z])
			.set(new RigidbodyComponent({ isKinematic: true }))
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
		compoundEntity.set(new RigidbodyComponent({ mass : 5 }));

		// Define half extents for all boxes
		var h1 = new Vector3(4, 1, 1),
			h2 = new Vector3(1, 3, 1),
			h3 = new Vector3(2, 1, 1),
			h4 = new Vector3(1, 1, 1),
			h5 = new Vector3(4, 1, 1);

		// Create 'sub entities' that, each holding a collider. Position is relative to the root entity.
		var subEntity1 = world.createEntity(new Box(h1.x * 2, h1.y * 2, h1.z * 2), V.getColoredMaterial(), new Vector3(0, 2, 0).mul(2));
		var subEntity2 = world.createEntity(new Box(h2.x * 2, h2.y * 2, h2.z * 2), V.getColoredMaterial(), new Vector3(-1.5, 0, 0).mul(2));
		var subEntity3 = world.createEntity(new Box(h3.x * 2, h3.y * 2, h3.z * 2), V.getColoredMaterial(), new Vector3(1, 0, 0).mul(2));
		var subEntity4 = world.createEntity(new Box(h4.x * 2, h4.y * 2, h4.z * 2), V.getColoredMaterial(), new Vector3(1.5, -1, 0).mul(2));
		var subEntity5 = world.createEntity(new Box(h5.x * 2, h5.y * 2, h5.z * 2), V.getColoredMaterial(), new Vector3(0, -2, 0).mul(2));
		subEntity1.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: h1 }) }));
		subEntity2.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: h2 }) }));
		subEntity3.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: h3 }) }));
		subEntity4.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: h4 }) }));
		subEntity5.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: h5 }) }));

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

	function createChain(x, y, z, numLinks, linkDistance, radius) {
		var lastEntity;
		for (var i = 0; i < numLinks; i++) {
			var rbComponent = new RigidbodyComponent({
				mass: i ? 1 : 0,
				initialVelocity: new Vector3(0, 0, 3 * i)
			});
			var e = world.createEntity(new Sphere(10, 10, radius), V.getColoredMaterial(), [x, y - i * linkDistance, z])
				.set(rbComponent)
				.set(
					new ColliderComponent({
						collider: new SphereCollider({
							radius: radius
						})
					})
				).addToWorld();

			if (lastEntity) {
				e.rigidbodyComponent.addJoint(new BallJoint({
					connectedEntity: lastEntity,
					localPivot: new Vector3(0, linkDistance / 2, 0)
				}));
			}

			lastEntity = e;
		}
	}

	addPrimitives();
	var radius = 0.9;
	var dist = 2;
	var N = 5;
	createChain(0, 4, 10, N, dist, radius);
	createGround();
	createCompound(0, 5, 0);

	var forcefieldEnabled = false;

	document.addEventListener('keydown', function (evt) {
		switch (evt.keyCode) {
		case 69:
			explode();
			break;
		case 32:
			// Add force field
			forcefieldEnabled = true;
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

	console.log('SPACE: force field\nE: Explode!\nANY OTHER KEY: add bodies');

	var w = 1;
	createStaticBox(0, -7.5,  10 + w / 2, 20 + w, 5,  w);
	createStaticBox(0, -7.5, -10 - w / 2, 20 + w, 5,  w);
	createStaticBox(10, -7.5, 0, w, 5, 20);
	createStaticBox(-10, -7.5, 0, w, 5, 20);

	var force = new Vector3();
	goo.callbacks.push(function () {
		if (forcefieldEnabled) {
			// Add some force to all bodies
			world.by.system('CannonSystem').each(function (entity) {
				// Force is directed to the origin
				force.copy(entity.getTranslation(force)).mul(-1);

				// Set a proper length of it
				force.normalize();
				force.mul(700);

				// Apply it to the entity
				entity.setForce(force);
			});
		}
	});

	function explode() {
		// Add some force to all bodies
		world.by.system('CannonSystem').each(function (entity) {
			// Force is directed to the origin
			force.copy(entity.getTranslation(force));

			// Set a proper length of it
			force.normalize();
			force.mul(5000);

			// Apply it to the entity
			entity.setForce(force);
		});
	}

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

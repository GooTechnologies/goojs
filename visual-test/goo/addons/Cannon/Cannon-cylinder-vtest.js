goo.V.attachToGlobal();

	V.describe('The entities in the scene hold a cannon component which updates their transform.');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;
	var groundLevel = 20;

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(1, -10, 0)
	});
	world.setSystem(cannonSystem);

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var position = [
				V.rng.nextFloat() * 16 - 8,
				V.rng.nextFloat() * 16 + 8 + groundLevel,
				V.rng.nextFloat() * 16 - 8
			];

			var rigidBodyComponent = new CannonRigidbodyComponent();
			var entity;
			var colliderComponent;
			var mat = V.getColoredMaterial();

			var radius = (1 + V.rng.nextFloat()) * 0.5;
			entity = world.createEntity(new Sphere(10, 10, radius), mat, position);
			colliderComponent = new CannonSphereColliderComponent({ radius: radius });
			entity.set(rigidBodyComponent).set(colliderComponent);

			entity.addToWorld();
		}
	}

	function createGround() {
		var groundEntity = world.createEntity(new Quad(1000, 1000, 100, 100), [0, groundLevel, 0], V.getColoredMaterial(0.7, 0.7, 0.7))
			.setRotation(-Math.PI / 2, 0, 0);
		var rigidBodyComponent = new CannonRigidbodyComponent({
			mass : 0
		});
		var planeColliderComponent = new CannonPlaneColliderComponent();
		groundEntity.set(rigidBodyComponent)
			.set(planeColliderComponent)
			.addToWorld();
	}

	function updateTransformSystem(){
		// Let the transformSystem do its job to update before we add stuff
		gooRunner.world.processEntityChanges();
		var ts = gooRunner.world.getSystem('TransformSystem');
		ts.process(ts._activeEntities);
	}

	function addCollidersFromPrimitives(entity) {

		var mass = 1;
		if (entity.hasTag('static')) {
			mass = 0;
		}

		entity.setComponent(new CannonRigidbodyComponent({
			mass: mass
		}));

		entity.traverse(function (descendant) {
			if (entity === descendant) {
				return true;
			}

			if (descendant.hasTag('collider') && descendant.hasComponent('MeshDataComponent')) {
				var md = descendant.meshDataComponent.meshData;
				var scale = descendant.transformComponent.worldTransform.scale;
				var collider;

				if (md instanceof Sphere) {
					collider = new CannonSphereColliderComponent({ radius: md.radius * scale.x });
				} else if (md instanceof Box) {
					collider = new CannonBoxColliderComponent({
						halfExtents: new Vector3(
							md.xExtent * scale.x,
							md.yExtent * scale.y,
							md.zExtent * scale.z
						)
					});
				} else if (md instanceof Cylinder) {
					// The goo & cannon cylinders are both along Z. Nice!
					collider = new CannonCylinderColliderComponent({
						radiusTop: md.radiusTop * scale.x,
						radiusBottom: md.radiusBottom * scale.x,
						height: md.height * scale.z,
						numSegments: 10
					});
				} else {
					console.error('Unknown collider shape:');
					console.log(md);
					return;
				}

				descendant.setComponent(collider);
			}
		});
	}

	function addPrimitivePhysics(radius, height, position, rotation, scale) {
		var mat = V.getColoredMaterial();
		var entity = world.createEntity(position).addToWorld();
		var r = radius;
		var localOffset = [0, 3, 0]; // Just for testing
		var meshEntity = world.createEntity("Cylinder", new Cylinder(16, r, r, height), mat, localOffset).addToWorld();
		entity.attachChild(meshEntity);
		meshEntity.setScale(scale[0], scale[1], scale[2]);
		meshEntity.setRotation(rotation);
		entity.transformComponent.setUpdated();
		meshEntity.transformComponent.setUpdated();
		meshEntity.setTag('collider');
		entity.setTag('static');

		updateTransformSystem();

		addCollidersFromPrimitives(entity);
	}

	document.addEventListener('keydown', function (evt) {
		switch (evt.keyCode) {
			default:
				addPrimitives();
				break;
		}
	}, false);

	V.addLights();
	V.addOrbitCamera(new Vector3(70, 0, Math.PI / 7.5), new Vector3(0, groundLevel, 0));
	V.process();

	createGround();
	addPrimitivePhysics(1, 1, [0, groundLevel + 3, 0], [Math.PI / 2, 0, 0], [3, 3, 6]);

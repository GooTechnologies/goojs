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
	'goo/addons/cannonpack/CannonSystem',
	'goo/addons/cannonpack/CannonRigidbodyComponent',
	'goo/addons/cannonpack/CannonBoxColliderComponent',
	'goo/addons/cannonpack/CannonCylinderColliderComponent',
	'goo/addons/cannonpack/CannonSphereColliderComponent',
	'goo/addons/cannonpack/CannonPlaneColliderComponent',
	'goo/addons/cannonpack/CannonDistanceJointComponent',
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
	CannonSystem,
	CannonRigidbodyComponent,
	CannonBoxColliderComponent,
	CannonCylinderColliderComponent,
	CannonSphereColliderComponent,
	CannonPlaneColliderComponent,
	CannonDistanceJointComponent,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a cannon component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;
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

	/*
	 var r = 3;
	 function createStaticCylinder(x, y, z, level) {
	 level = level || 0;

	 var colliderComponent = new CannonCylinderColliderComponent({
	 radiusTop: r,
	 radiusBottom: r,
	 height: r * 2,
	 numSegments: 10
	 });

	 var mat = V.getColoredMaterial();
	 var meshEntity = world.createEntity(new Cylinder(10, r, r, r * 2), mat).addToWorld();

	 var entity = world.createEntity([x, y, z]).set(new CannonRigidbodyComponent({ mass: 0 })).addToWorld();
	 entity.attachChild(meshEntity);

	 switch (level) {
	 case 0:
	 // Add components on base level. Rotate the container entity
	 entity.setRotation(Math.PI / 2, 0, 0);
	 entity.set(colliderComponent);
	 break;

	 case 1:
	 // Add as children on first level
	 var colliderEntity = world.createEntity(colliderComponent);
	 colliderEntity.setRotation(Math.PI / 2, 0, 0);
	 entity.attachChild(colliderEntity);
	 meshEntity.setRotation(Math.PI / 2, 0, 0);
	 break;

	 case 2:
	 // Add as children on second level, just to test
	 var colliderEntity = world.createEntity(colliderComponent).addToWorld();
	 var transformEntity = world.createEntity([0, 0, 0]).addToWorld();
	 transformEntity.setRotation(Math.PI / 4, 0, 0);
	 colliderEntity.setRotation(Math.PI / 4, 0, 0);
	 entity.attachChild(transformEntity);
	 transformEntity.attachChild(colliderEntity);
	 meshEntity.setRotation(Math.PI / 2, 0, 0);
	 break;
	 }

	 return entity;
	 }
	 */

	function updateTransformSystem(){
		// Let the transformSystem do its job to update before we add stuff
		goo.world.processEntityChanges();
		var ts = goo.world.getSystem('TransformSystem');
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

				// Offset local
				// var colliderEntity = goo.world.createEntity(collider);
				// colliderEntity.transformComponent.transform.copy(descendant.transformComponent.transform);
				// colliderEntity.transformComponent.setUpdated();
				// updateTransformSystem();
				// descendant.attachChild(colliderEntity);

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


	//addPrimitives();
	createGround();
	addPrimitivePhysics(1, 1, [0, groundLevel + 3, 0], [Math.PI / 2, 0, 0], [3, 3, 6]);
	// createStaticCylinder(0, 0, 0, 0);
	// createStaticCylinder(0, 0, 2 * r, 1);
	// createStaticCylinder(0, 0, - 2 * r, 2);

});

require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/cannon/CannonSystem',
	'goo/addons/cannon/CannonRigidbodyComponent',
	'goo/addons/cannon/CannonBoxColliderComponent',
	'goo/addons/cannon/CannonSphereColliderComponent',
	'goo/addons/cannon/CannonPlaneColliderComponent',
	'goo/addons/cannon/CannonDistanceJointComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'lib/V'
], function (
	GooRunner,
	Material,
	Camera,
	CameraComponent,
	Sphere,
	Box,
	Quad,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	CannonSystem,
	CannonRigidbodyComponent,
	CannonBoxColliderComponent,
	CannonSphereColliderComponent,
	CannonPlaneColliderComponent,
	CannonDistanceJointComponent,
	PointLight,
	LightComponent,
	V
) {
	'use strict';

	function createEntity(meshData,material) {
		if(!material){
			material = V.getColoredMaterial();
		}
		return world.createEntity(meshData, material);
	}

	var goo = V.initGoo();
	var world = goo.world;

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(0,-30,0),
		broadphase: 'sap'
	});
	world.setSystem(cannonSystem);

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;

			var rigidBodyComponent = new CannonRigidbodyComponent();
			var entity;
			if(V.rng.nextFloat() > 0.7){
				var radius = 1 + V.rng.nextFloat();
				entity = createEntity(new Box(radius*2,radius*2,radius*2)).set([x, y, z]);
				var boxColliderComponent = new CannonBoxColliderComponent({
					halfExtents:new Vector3(radius,radius,radius)
				});
				entity.setComponent(rigidBodyComponent);
				entity.setComponent(boxColliderComponent);
			} else {
				var radius = 1 + V.rng.nextFloat();
				entity = createEntity(new Sphere(10, 10, radius)).set([x, y, z]);
				var sphereColliderComponent = new CannonSphereColliderComponent({radius:radius});
				entity.setComponent(rigidBodyComponent);
				entity.setComponent(sphereColliderComponent);
			}
			entity.addToWorld();
		}
	}

	function createGround(){
		var groundEntity = createEntity(new Quad(1000, 1000, 100, 100), V.getColoredMaterial(0.7,0.7,0.7))
			.set([0, -10, 0])
			.setRotation(-Math.PI / 2, 0, 0);
		var rigidBodyComponent = new CannonRigidbodyComponent({
			mass : 0
		});
		var planeColliderComponent = new CannonPlaneColliderComponent();
		groundEntity.setComponent(rigidBodyComponent);
		groundEntity.setComponent(planeColliderComponent);
		groundEntity.addToWorld();
	}

	function createStaticBox(x,y,z,w,d,h){
		return createEntity(new Box(w, d, h))
			.set([x, y, z])
			.setComponent(new CannonRigidbodyComponent({ mass: 0 }))
			.setComponent(new CannonBoxColliderComponent({
				halfExtents: new Vector3(w/2,d/2,h/2)
			}))
			.addToWorld();
	}

	// Create a 'G' compound box body
	function createCompound (x, y, z) {

		// Create 'root' entity
		var compoundEntity = world.createEntity(new Vector3(x,y,z));

		// Add a rigid body component to it
		compoundEntity.setComponent(new CannonRigidbodyComponent({ mass : 5 }));

		// Define half extents for all boxes
		var h1 = new Vector3(4,1,1),
			h2 = new Vector3(1,3,1),
			h3 = new Vector3(2,1,1),
			h4 = new Vector3(1,1,1),
			h5 = new Vector3(4,1,1);

		// Create 'sub entities' that, each holding a collider. Position is relative to the root entity.
		var subEntity1 = world.createEntity(new Box(h1.x*2,h1.y*2,h1.z*2), V.getColoredMaterial(), new Vector3(    0, 2,   0).mul(2));
		var subEntity2 = world.createEntity(new Box(h2.x*2,h2.y*2,h2.z*2), V.getColoredMaterial(), new Vector3( -1.5, 0,   0).mul(2));
		var subEntity3 = world.createEntity(new Box(h3.x*2,h3.y*2,h3.z*2), V.getColoredMaterial(), new Vector3(    1, 0,   0).mul(2));
		var subEntity4 = world.createEntity(new Box(h4.x*2,h4.y*2,h4.z*2), V.getColoredMaterial(), new Vector3(  1.5,-1,   0).mul(2));
		var subEntity5 = world.createEntity(new Box(h5.x*2,h5.y*2,h5.z*2), V.getColoredMaterial(), new Vector3(    0,-2,   0).mul(2));
		subEntity1.setComponent(new CannonBoxColliderComponent({ halfExtents:h1 }));
		subEntity2.setComponent(new CannonBoxColliderComponent({ halfExtents:h2 }));
		subEntity3.setComponent(new CannonBoxColliderComponent({ halfExtents:h3 }));
		subEntity4.setComponent(new CannonBoxColliderComponent({ halfExtents:h4 }));
		subEntity5.setComponent(new CannonBoxColliderComponent({ halfExtents:h5 }));

		// Attach the children to the root
		compoundEntity.attachChild(subEntity1);
		compoundEntity.attachChild(subEntity2);
		compoundEntity.attachChild(subEntity3);
		compoundEntity.attachChild(subEntity4);
		compoundEntity.attachChild(subEntity5);

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

	function createChain(x, y, z, numLinks, linkDistance, radius){
		x = x || 0;
		y = y || 0;
		z = z || 0;
		numLinks = numLinks || 5;
		linkDistance = linkDistance || 1;
		radius = radius || 1;

		var lastBody;
		for(var i=0; i<numLinks; i++){
			var body = new CannonRigidbodyComponent({
				mass: i ? 1 : 0,
				velocity: new Vector3(0,0,i*3)
			});
			var e = createEntity(new Sphere(10, 10, radius))
				.set([x, y-i*radius*2, z])
				.setComponent(body)
				.setComponent(new CannonSphereColliderComponent({
					radius : radius
				}))
				.addToWorld();
			if(lastBody){
				e.setComponent(new CannonDistanceJointComponent({
					distance: linkDistance,
					connectedBody: lastBody
				}));
			}
			lastBody = body;
		}
	}

	addPrimitives();
	var radius = 0.9;
	var dist = 2;
	var N = 5;
	createChain(0, 4, 10, N, dist, radius);
	createGround();
	createCompound(0,5,0);

	var forcefieldEnabled = false;

	document.addEventListener('keydown', function(evt){
		switch(evt.keyCode){
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

	document.addEventListener('keyup', function(evt){
		switch(evt.keyCode){
		case 32:
			// Add force field
			forcefieldEnabled = false;
			break;
		}
	}, false);

	console.log('SPACE: force field\nE: Explode!\nANY OTHER KEY: add bodies');

	var w = 1;
	createStaticBox(  0, -7.5,  10+w/2, 20+w, 5,  w);
	createStaticBox(  0, -7.5, -10-w/2, 20+w, 5,  w);
	createStaticBox( 10, -7.5,       0,  w, 5, 20);
	createStaticBox(-10, -7.5,       0,  w, 5, 20);

	var force = new Vector3();
	goo.callbacks.push(function(){
		if(forcefieldEnabled){
			// Add some force to all bodies
			var physicsEntities = world.by.system("CannonSystem").toArray();

			for(var i=0; i<physicsEntities.length; i++){
				var entity = physicsEntities[i];

				// Force is directed to the origin
	            force.copy(entity.getTranslation(force)).mul(-1);

	            // Set a proper length of it
	            force.normalize();
	            force.mul(700);

	            // Apply it to the entity
	            entity.setForce(force);
			}
		}
	});

	function explode(){

		// Add some force to all bodies
		var physicsEntities = world.by.system("CannonSystem").toArray();

		for(var i=0; i<physicsEntities.length; i++){
			var entity = physicsEntities[i];

			// Force is directed to the origin
            force.copy(entity.getTranslation(force));

            // Set a proper length of it
            force.normalize();
            force.mul(5000);

            // Apply it to the entity
            entity.setForce(force);
		}
	}

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

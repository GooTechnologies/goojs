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
	PointLight,
	LightComponent,
	V
) {
	'use strict';

	var resourcePath = '../../../resources';

	function createEntity(meshData,material) {
		if(!material) material = V.getColoredMaterial();
		return world.createEntity(meshData, material);
	}

	var goo = V.initGoo();
	var world = goo.world;

	var cannonSystem = new CannonSystem();
	world.setSystem(cannonSystem);

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			var radius = 1 + V.rng.nextFloat();
			var sphereEntity = createEntity(new Sphere(10, 10, radius));
			sphereEntity.set([x, y, z]);
			var rigidBodyComponent = new CannonRigidbodyComponent();
			var sphereColliderComponent = new CannonSphereColliderComponent({radius:radius});
			sphereEntity.setComponent(rigidBodyComponent);
			sphereEntity.setComponent(sphereColliderComponent);
			sphereEntity.addToWorld();
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

	function createCompound (x, y, z) {
		// Create compound
		var compoundEntity = world.createEntity(new Vector3(x,y,z));
		compoundEntity.setComponent(new CannonRigidbodyComponent({ mass : 1 }));
		var material = V.getColoredMaterial(0,0,1);
		var h1 = new Vector3(4,1,1),
			h2 = new Vector3(1,3,1),
			h3 = new Vector3(2,1,1),
			h4 = new Vector3(1,1,1),
			h5 = new Vector3(4,1,1);
		var subEntity1 = world.createEntity(new Box(h1.x*2,h1.y*2,h1.z*2), material, new Vector3(    0, 2,   0).mul(2));
		var subEntity2 = world.createEntity(new Box(h2.x*2,h2.y*2,h2.z*2), material, new Vector3( -1.5, 0,   0).mul(2));
		var subEntity3 = world.createEntity(new Box(h3.x*2,h3.y*2,h3.z*2), material, new Vector3(    1, 0,   0).mul(2));
		var subEntity4 = world.createEntity(new Box(h4.x*2,h4.y*2,h4.z*2), material, new Vector3(  1.5,-1,   0).mul(2));
		var subEntity5 = world.createEntity(new Box(h5.x*2,h5.y*2,h5.z*2), material, new Vector3(    0,-2,   0).mul(2));
		subEntity1.setComponent(new CannonBoxColliderComponent({ halfExtents:h1 }));
		subEntity2.setComponent(new CannonBoxColliderComponent({ halfExtents:h2 }));
		subEntity3.setComponent(new CannonBoxColliderComponent({ halfExtents:h3 }));
		subEntity4.setComponent(new CannonBoxColliderComponent({ halfExtents:h4 }));
		subEntity5.setComponent(new CannonBoxColliderComponent({ halfExtents:h5 }));
		compoundEntity.attachChild(subEntity1);
		compoundEntity.attachChild(subEntity2);
		compoundEntity.attachChild(subEntity3);
		compoundEntity.attachChild(subEntity4);
		compoundEntity.attachChild(subEntity5);
		subEntity1.addToWorld();
		subEntity2.addToWorld();
		subEntity3.addToWorld();
		subEntity4.addToWorld();
		subEntity5.addToWorld();
		compoundEntity.addToWorld();
		return compoundEntity;
	}

	addPrimitives();
	createGround();
	createCompound(0,5,0);

	document.addEventListener('keypress', addPrimitives, false);
	createStaticBox(  0, -7.5,  10, 20, 5,  1);
	createStaticBox(  0, -7.5, -10, 20, 5,  1);
	createStaticBox( 10, -7.5,   0,  1, 5, 20);
	createStaticBox(-10, -7.5,   0,  1, 5, 20);

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

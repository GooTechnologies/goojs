require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/entities/components/CameraComponent',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/entities/components/TransformComponent',
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoRigidbodyComponent',
	'goo/addons/ammo/AmmoSphereColliderComponent',
	'goo/addons/ammo/AmmoBoxColliderComponent',
	'goo/addons/ammo/AmmoCapsuleColliderComponent',
	'goo/addons/ammo/AmmoPlaneColliderComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'lib/V'
], function (
	GooRunner,
	Material,
	Camera,
	Box,
	Sphere,
	Quad,
	CameraComponent,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	TransformComponent,
	AmmoSystem,
	AmmoRigidbodyComponent,
	AmmoSphereColliderComponent,
	AmmoBoxColliderComponent,
	AmmoCapsuleColliderComponent,
	AmmoPlaneColliderComponent,
	PointLight,
	LightComponent,
	V
) {
	"use strict";

	var resourcePath = "../../../resources";

	var goo = V.initGoo();
	var world = goo.world;

	var ammoSystem = new AmmoSystem();

	goo.world.setSystem(ammoSystem);

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			if (V.rng.nextFloat() < 0.5) {
				var h = new Vector3(0.5+V.rng.nextFloat(), 0.5+V.rng.nextFloat(), 0.5+V.rng.nextFloat());
				createEntity(goo, new Box(2*h.x,2*h.y,2*h.z),
					{mass:1},
					[x,y,z],
					new AmmoBoxColliderComponent({
						halfExtents : h,
					})
				);
			} else {
				var radius = 1+V.rng.nextFloat();
				createEntity(goo, new Sphere(10, 10, radius),
					{mass:1},
					[x,y,z],
					new AmmoSphereColliderComponent({
						radius : radius,
					})
				);
			}
		}
	}

	addPrimitives();
	document.addEventListener('keypress', addPrimitives, false);

	var h = new Vector3(2.5,2.5,2.5);
	createEntity(goo, new Box(2*h.x,2*h.y,2*h.z),   {mass: 0}, [0,-7.5,0], new AmmoBoxColliderComponent({ halfExtents:h }));
	h = new Vector3(10,5,0.5);
	createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-5,10],  new AmmoBoxColliderComponent({ halfExtents:h }));
	createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-5,-10], new AmmoBoxColliderComponent({ halfExtents:h }));
	h = new Vector3(0.5,5,10);
	createEntity(goo, new Box(1, 10, 20), {mass: 0}, [10,-5,0],  new AmmoBoxColliderComponent({ halfExtents:h }));
	createEntity(goo, new Box(1, 10, 20), {mass: 0}, [-10,-5,0], new AmmoBoxColliderComponent({ halfExtents:h }));
	var planeEntity = createEntity(goo, new Quad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0],
		new AmmoPlaneColliderComponent({
			normal: new Vector3(0,0,1) // Goo quad faces in the z direction
		}),
		V.getColoredMaterial(0.7,0.7,0.7)
	);
	planeEntity.setRotation([-Math.PI/2,0,0]);

	// Create compound
	var compoundEntity = window.compoundEntity = goo.world.createEntity(new Vector3(0,3,0));
	compoundEntity.addToWorld();
	compoundEntity.setComponent(new AmmoRigidbodyComponent({ mass : 1 /*, isTrigger:true*/ }));
	var material = V.getColoredMaterial();
	var h1 = new Vector3(1,2,1),
		h2 = new Vector3(1,1,1),
		h3 = new Vector3(1,1,1),
		radius=1;
	var subEntity1 = goo.world.createEntity(new Sphere(10,10,radius), material, new Vector3( 0,0, 2));
	var subEntity2 = goo.world.createEntity(new Box(h2.x*2,h2.y*2,h2.z*2), material, new Vector3( 0,0,-2));
	var subEntity3 = goo.world.createEntity(new Box(h3.x*2,h3.y*2,h3.z*2), material, new Vector3( 0,-2,-2));
	subEntity1.addToWorld();
	subEntity2.addToWorld();
	subEntity3.addToWorld();
	subEntity1.setComponent(new AmmoSphereColliderComponent({ radius:radius }));
	subEntity2.setComponent(new AmmoBoxColliderComponent({ halfExtents:h2 }));
	subEntity3.setComponent(new AmmoBoxColliderComponent({ halfExtents:h3 }));
	compoundEntity.attachChild(subEntity1);
	compoundEntity.attachChild(subEntity2);
	compoundEntity.attachChild(subEntity3);
	subEntity1.transformComponent.transform.rotation.fromAngles(Math.PI/6,0,0);
	subEntity1.transformComponent.setUpdated();

	V.addLights();

	V.addOrbitCamera([50,0,0]);

	function createEntity(goo, meshData, ammoSettings, pos, colliderComponent, material) {
		material = material || V.getColoredMaterial();
		var entity = goo.world.createEntity(meshData, material, pos);
		entity.addToWorld();
		entity.setComponent(colliderComponent);
		entity.setComponent(new AmmoRigidbodyComponent(ammoSettings));
		return entity;
	}

});

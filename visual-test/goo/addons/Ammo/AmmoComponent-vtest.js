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
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoComponent',
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
	AmmoSystem,
	AmmoComponent,
	PointLight,
	LightComponent,
	V
) {
	"use strict";

	var resourcePath = "../../../resources";

	function init() {
		var ammoSystem = new AmmoSystem();
		goo.world.setSystem(ammoSystem);

		function addPrimitives() {
			for (var i=0;i<20;i++) {
				var x = V.rng.nextFloat() * 16 - 8;
				var y = V.rng.nextFloat() * 16 + 8;
				var z = V.rng.nextFloat() * 16 - 8;
				if (V.rng.nextFloat() < 0.5) {
					createEntity(goo, new Box(1+V.rng.nextFloat()*2, 1+V.rng.nextFloat()*2, 1+V.rng.nextFloat()*2), {mass:1}, [x,y,z]);
				} else {
					createEntity(goo, new Sphere(10, 10, 1+V.rng.nextFloat()), {mass:1}, [x,y,z]);
				}
			}
		}

		addPrimitives();
		document.addEventListener('keypress', addPrimitives, false);

		createEntity(goo, new Box(5, 5, 5), {mass: 0}, [0,-7.5,0]);
		createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-5,10]);
		createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-5,-10]);
		createEntity(goo, new Box(1, 10, 20), {mass: 0}, [10,-5,0]);
		createEntity(goo, new Box(1, 10, 20), {mass: 0}, [-10,-5,0]);

		var planeEntity = createEntity(goo, new Quad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0]);
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.setTranslation(0, 100, -10);
		lightEntity.addToWorld();

		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, 0, Math.PI/4)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();
	}

	function createEntity(goo, meshData, ammoSettings, pos) {
		var material = new Material(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		var entity = goo.world.createEntity(meshData, material, pos);
		entity.setComponent(new AmmoComponent(ammoSettings));
		entity.addToWorld();
		return entity;
	}

	var goo = V.initGoo();
	var world = goo.world;
	init();
});
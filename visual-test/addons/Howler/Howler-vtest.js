require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/Camera',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/math/Vector3',
	'goo/entities/components/PointLight',
	'goo/entities/components/DirectionalLight',
	'goo/entities/components/SpotLight',
	'goo/addons/howler/components/HowlerComponent',
	'goo/addons/howler/systems/HowlerSystem',
	'goo/renderer/TextureCreator'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	ShapeCreator,
	Camera,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRenderer,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	HowlerComponent,
	HowlerSystem,
	TextureCreator
	) {
	'use strict';

	function howlerComponentDemo(goo) {
		var sound1 = new window.Howl({
			urls: ['../../resources/sfx1.wav']
		});

		var sound2 = new window.Howl({
			urls: ['../../resources/sfx2.wav']
		});

		goo.world.setSystem(new HowlerSystem(goo.renderer));

		// create panning cube
		var meshData = ShapeCreator.createBox();
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D('../../resources/check.png');
		material.setTexture('DIFFUSE_MAP', texture);

		var cubeEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
		cubeEntity.addToWorld();

		cubeEntity.setComponent(new ScriptComponent({
			run: function (entity) {
				entity.transform.setRotationXYZ(
					World.time * 1.2,
					World.time * 2.0,
					0);
				entity.transform.translation.setd(
					Math.cos(World.time) * 10,
					0,
					0
				);
				entity.setUpdated();
			}
		}));

		// add howler component to the cube
		var howlerComponent = new HowlerComponent();
		howlerComponent.addSound('s1', sound1);
		cubeEntity.setComponent(howlerComponent);

		// create fixed sphere
		meshData = ShapeCreator.createSphere(32, 32);
		var sphereEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
		sphereEntity.transform.translation.setd(0, 0, 5);
		sphereEntity.addToWorld();

		howlerComponent = new HowlerComponent();
		howlerComponent.addSound('s2', sound2);
		sphereEntity.setComponent(howlerComponent);

		// add light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(light);
		lightEntity.transform.translation.set(100, 100, 100);
		lightEntity.addToWorld();

		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transform.translation.set(0, 0, 3);
		cameraEntity.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(camera);
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(10, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);

		// bind keys
		document.body.addEventListener('keypress', function(e) {
			switch(e.keyCode) {
				case 49:
					cubeEntity.howlerComponent.playSound('s1');
					console.log('boing');
					break;
				case 50:
					sphereEntity.howlerComponent.playSound('s2');
					console.log('squigly');
					break;
				default:
					console.log('1: sound!');
			}
		});
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		howlerComponentDemo(goo);
	}

	init();
});

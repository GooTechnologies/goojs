require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/soundmanager2/systems/SoundManager2System',
	'goo/addons/soundmanager2/components/SoundManager2Component'
], function (
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	SoundManager2System,
	SoundManager2Component
) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var soundManager2System = new SoundManager2System();
		goo.world.setSystem(soundManager2System);

		var soundEntity1 = createEntity(goo, ShapeCreator.createBox(1, 1, 1));
		soundEntity1.transformComponent.transform.translation.y = -7.5;
		var soundManager2Component = new SoundManager2Component({});
		soundManager2Component.addSound({
				id: 'music',
				url: 'resources/sound/PearlBoy_UnderwaterAmbience.ogg',
				volume: 100
		});
		soundEntity1.setComponent(soundManager2Component);

		var testEntity = goo.world.createEntity('Sound');
		soundManager2Component = new SoundManager2Component({});
		testEntity.setComponent(soundManager2Component);

		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {
			mass: 0
		});
		planeEntity.transformComponent.transform.translation.y = -10;
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

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

	function createEntity(goo, meshData) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.textures.push(texture);
		entity.meshRendererComponent.materials.push(material);

		entity.addToWorld();

		return entity;
	}

	init();
});

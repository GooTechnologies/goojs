require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/renderer/shaders/ShaderLib'
], function (
	Material,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	LightComponent,
	PointLight,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	Vector3,
	ShaderLib
) {
	"use strict";

	var resourcePath = "../../resources";

	function createBox(size, x, y, textureUrl, goo) {
		var meshData = ShapeCreator.createBox(size, size, size, 1, 1);
		var box = EntityUtils.createTypicalEntity(goo.world, meshData);
		var texture = new TextureCreator({
			verticalFlip : true
		}).loadTexture2D(resourcePath + textureUrl);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
		material.setTexture('DIFFUSE_MAP', texture);

		box.meshRendererComponent.materials.push(material);
		box.addToWorld();

		box.transformComponent.transform.translation.set(x, y, 0);
	}

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 5, 60);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(60, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();

		// Setup light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light1');
		entity.setComponent(new LightComponent(light));
		var transformComponent = entity.transformComponent;
		transformComponent.transform.translation.x = 80;
		transformComponent.transform.translation.y = 50;
		transformComponent.transform.translation.z = 80;
		entity.addToWorld();

		createBox(10, -10, 10, '/Pot_Diffuse.dds', goo);
		createBox(10, 10, 10, '/Pot_Diffuse.crn', goo);
		createBox(10, -10, -10, '/collectedBottles_diffuse_1024.dds', goo);
		createBox(10, 10, -10, '/collectedBottles_diffuse_1024.crn', goo);

		// createBox(10, -20, 0, '/lena/lena_dxt1.dds', goo);
		// createBox(10, 0, 0, '/lena/lena_dxt3.dds', goo);
		// createBox(10, 20, 0, '/lena/lena_dxt5_BC3.dds', goo);
		// createBox(10, -10, -15, '/lena/lena_dxt5_RXGB.dds', goo);
		// createBox(10, 10, -15, '/lena/lena_dxt5_YCoCg.dds', goo);

		// NB: YCoCg -> RGB
		// ' gl_FragColor.r = (texCol.r * 1.0) + (texCol.g * -1.0) + (texCol.b * (0.0 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //
		// ' gl_FragColor.g = (texCol.r * 0.0) + (texCol.g * 1.0) + (texCol.b * (-0.5 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //
		// ' gl_FragColor.b = (texCol.r * -1.0) + (texCol.g * -1.0) + (texCol.b * (1.0 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //

	}

	init();
});

require([
	'lib/V',

	'goo/math/Vector3'
],
function(
	V,

	Vector3
	) {
	"use strict";

	var gui;

	var goo;

	function init() {
		V.describe('Its getting hairy!');

		goo = V.initGoo();

		gui = new window.dat.GUI();

		// createFurRenderingRoutine();

		V.addOrbitCamera(new Vector3(90, Math.PI / 2, 0));
		V.addLights();

		V.process();
	}

	function addAssets() {
		createPrimitive(4);
	}

	function createPrimitive(size) {
		var meshData = ShapeCreator.createSphere(40, 40, size);
		//var meshData = ShapeCreator.createBox(size, size, size);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		material.setTexture('DIFFUSE_MAP', texture);
		entity.meshRendererComponent.materials.push(material);
		entity.addToWorld();
		return entity;
	}

	function setupCamera() {
		// Add camera
		var camera = new Camera(90, 1, 0.1, 1000);

		var cameraEntity = goo.world.createEntity('CameraEntity');

		cameraEntity.setComponent(new CameraComponent(camera));
		var cameraScript = new ScriptComponent();
		cameraScript.scripts.push(new OrbitNPanControlScript());
		cameraEntity.setComponent(cameraScript);
		cameraEntity.addToWorld();
	}

	function loadModels() {
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: "../../resources/models/LowPolyFighter/"
		});

		loader.load("project.project").then(function(configs) {
			console.log(configs);

			// NOTE: The dynamic loader sets up some other rendering routine after finishing the load.
			// Setting up the rendering routine afterwards to override it.
			createFurRenderingRoutine();
		});

	}

	function createFurRenderingRoutine() {

		var renderList = goo.world.getSystem('RenderSystem').renderList;
		var composer = new Composer();

		var regularPass = new RenderPass(renderList);
		regularPass.renderToScreen = true;

		// TODO: Add filter , to only render entities with FurComponents in the FurPass.
		var furPass = new FurPass(renderList);
		furPass.clear = false;

		var furFolder = gui.addFolder("Fur settings");
		furFolder.add(furPass.furUniforms, 'furRepeat', 1, 20);
		furFolder.add(furPass.furUniforms, 'hairLength', 0.05, 3);
		furFolder.add(furPass.furUniforms, 'curlFrequency', 0, 20);
		furFolder.add(furPass.furUniforms, 'curlRadius', -0.02, 0.02);
		furFolder.add(furPass.furUniforms, 'gravity', 0, 20.0);
		furFolder.add(furPass.furUniforms, 'sinusAmount', 0, 20.0);
		furFolder.open();

		composer.addPass(regularPass);
		composer.addPass(furPass);

		console.log(goo.world.getSystem('RenderSystem').composers);

		goo.world.getSystem('RenderSystem').composers.push(composer);
	}

	init();
});
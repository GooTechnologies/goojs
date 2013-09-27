require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/loaders/DynamicLoader',
	'goo/entities/GooRunner',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/MouseLookControlScript',
	'goo/scripts/WASDControlScript',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FurPass'
],
function(
	DynamicLoader,
	GooRunner,
	Camera,
	CameraComponent,
	ScriptComponent,
	MouseLookControlScript,
	WASDControlScript,
	Composer,
	RenderPass,
	FurPass
	) {
	"use strict";


	function init() {
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		addFPSCamera(goo);

		loadModels(goo);

		createFurRenderingRoutine(goo);
	}

	function addFPSCamera(goo) {
		// Add camera
		var camera = new Camera(90, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity('CameraEntity');

		cameraEntity.setComponent(new CameraComponent(camera));
		var cameraScript = new ScriptComponent();
		cameraScript.scripts.push(new WASDControlScript({
			domElement: document.body
		}));
		cameraScript.scripts.push(new MouseLookControlScript({
			domElement: document.body
		}));
		cameraEntity.setComponent(cameraScript);
		cameraEntity.addToWorld();
	}

	function loadModels(goo) {
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: "../../resources/models/LowPolyFighter/"
		});

		loader.load("project.project").then(function(){
			console.log("This is where the FurComponent is supposed to be added to the correct entity.");
		});

	}

	function createFurRenderingRoutine(goo) {

		var renderList = goo.world.getSystem('RenderSystem').renderList;
		var composer = new Composer();

		var regularPass = new RenderPass(renderList);
		// TODO: Add filter , to only render entities with FurComponents in the FurPass.
		var furPass = new FurPass(renderList);

		regularPass.renderToScreen = true;

		composer.addPass(regularPass);
		composer.addPass(furPass);

		goo.world.getSystem('RenderSystem').composers.push(composer);
	}

	init();
});
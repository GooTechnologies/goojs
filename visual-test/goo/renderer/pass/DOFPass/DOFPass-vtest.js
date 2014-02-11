require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',
	'goo/math/Vector3',

	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',

	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',

	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',

	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/DOFPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/Composer'
], function (
	GooRunner,
	DynamicLoader,
	Vector3,

	Camera,
	CameraComponent,

	ScriptComponent,
	OrbitCamControlScript,

	DirectionalLight,
	PointLight,
	LightComponent,

	RenderPass,
	DOFPass,
	FullscreenPass,
	Composer
) {
	'use strict';

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			antialias: true,
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		createDOF(goo);

		// The Loader takes care of loading data from a URL...
		var loader = new DynamicLoader({world: goo.world, rootPath: './scene/'});


		loader.load('test.scene')
		.then(function(/*configs*/) {
			// This function is called when all the entities
			// and their dependencies have been loaded.

			var lightEntity;
			var dirLight;

			// Let there be light
			lightEntity = goo.world.createEntity('Light1');
			dirLight = new DirectionalLight();
			dirLight.color.setd(1.0, 1.0, 0.95);
			lightEntity.setComponent(new LightComponent(dirLight));
			lightEntity.transformComponent.transform.translation.setd(-20, 30, 25);
			lightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
			lightEntity.addToWorld();

			// Let there be a second light
			lightEntity = goo.world.createEntity('Light2');
			dirLight = new DirectionalLight();
			dirLight.color.setd(0.23, 0.26, 0.29);
			dirLight.specularIntensity = 0;
			lightEntity.setComponent(new LightComponent(dirLight));
			lightEntity.transformComponent.transform.translation.setd(5, 30, -10);
			lightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
			lightEntity.addToWorld();

			// Let there be a third light
			lightEntity = goo.world.createEntity('Light3');
			dirLight = new PointLight();
			dirLight.range = 30;
			dirLight.color.setd(1.84, 1.85, 1.15);
			dirLight.specularIntensity = 0;
			lightEntity.setComponent(new LightComponent(dirLight));
			lightEntity.transformComponent.transform.translation.setd(0, -1, 0);
			lightEntity.addToWorld();

			// Add an orbit cam (so that you can control the camera with the mouse)
			// The parameters here are fetched from the Tool. Feel free to play around.
			var camera = new Camera(45, 1.13174273859, 1.3745135498, 10000);
			var cameraEntity = goo.world.createEntity('ViewCameraEntity');
			var cameraComponent = new CameraComponent(camera);
			cameraEntity.setComponent(cameraComponent);
			var camScript = new OrbitCamControlScript({
				domElement: goo.renderer.domElement,
				spherical: new Vector3([960.5064086914062, 5.987901210784912, 0.32671093940734863]),
				lookAtPoint: new Vector3([29.84771728515625, 122.67232513427734, -11.64794921875]),
				worldUpVector: new Vector3([0, 1, 0]),
				zoomSpeed: 5.49805419922,
				maxZoomDistance: 2749.02709961,
				baseDistance: 3
			});
			cameraEntity.setComponent(new ScriptComponent(camScript));
			cameraEntity.addToWorld();
		})
		.then(null, function(e) {
			// The second parameter of `then` is an error handling function.
			// We just pop up an error message in case the scene fails to load.
			alert('Failed to load scene: ' + e);
		});
	}

	function createDOF(goo) {
		// Depth of field
		var depthPass = new DOFPass(goo.world.getSystem('RenderSystem').renderList);

		// Create composer with same size as screen
		var composer = new Composer();
		composer.addPass(depthPass);

		goo.world.getSystem('RenderSystem').composers.push(composer);
	}
	init();
});

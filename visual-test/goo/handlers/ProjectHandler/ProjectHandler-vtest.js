require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',
	'goo/statemachine/FSMSystem',
	'goo/util/Skybox',
	'goo/renderer/Camera',
	'goo/math/Vector3',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',

	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/pass/BloomPass',
	'goo/math/Vector4',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils'
], function (
	GooRunner,
	DynamicLoader,
	FSMSystem,
	Skybox,
	Camera,
	Vector3,
	CameraComponent,
	ScriptComponent,
	OrbitCamControlScript,

	Composer,
	RenderPass,
	FullscreenPass,
	RenderTarget,
	BloomPass,
	Vector4,
	Util,
	ShaderLib,
	Material,
	Texture,
	ShapeCreator,
	EntityUtils
	) {
	'use strict';

	function createMesh(goo, meshData, material, x, y, z) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
		entity.transformComponent.transform.translation.set(x, y, z);
		entity.addToWorld();
	}

	function addShapes(goo) {
		var material = Material.createMaterial(ShaderLib.textured);
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		material.setTexture('DIFFUSE_MAP', texture);

		createMesh(goo, ShapeCreator.createSphere(16, 16, 2), material, -10, 0, -30);
		createMesh(goo, ShapeCreator.createBox(3, 3, 3), material, -10, 10, -30);
		createMesh(goo, ShapeCreator.createQuad(3, 3), material, 0, -7, -20);
		createMesh(goo, ShapeCreator.createTorus(16, 16, 1, 3), material, 0, 0, -30);
	}

	function addCamera(goo) {
		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity("UserCameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);

		var cameraComponent = new CameraComponent(camera);
		cameraComponent.isMain = true;
		cameraEntity.setComponent(cameraComponent);

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(25, Math.PI / 4, 0)
		}));
		cameraEntity.setComponent(scripts);

		cameraEntity.addToWorld();

		return camera;
	}
	/*
	function addPostEffects(goo) {
		// Create composer with same size as screen
		var composer = new Composer();
		var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);        // this does not contains the skybox
		renderPass.clearColor = new Vector4(0, 0, 0, 0);

		// Bloom
		var bloomPass = new BloomPass({
			sizeX: 512,
			sizeY: 512,
			strength: 1
		});

		// var rgbshiftPass = new FullscreenPass(Util.clone(ShaderLib.rgbshift));
		var vignettePass = new FullscreenPass(Util.clone(ShaderLib.sepia));
		// var horizontalTiltShiftPass = new FullscreenPass(Util.clone(ShaderLib.horizontalTiltShift));
		// horizontalTiltShiftPass.material.shader.uniforms.h = 1 / 300;
		var filmPass = new FullscreenPass(Util.clone(ShaderLib.film));

		// Regular copy
		var outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
		outPass.renderToScreen = true;

		composer.addPass(renderPass);

		// composer.addPass(rgbshiftPass);
		composer.addPass(bloomPass);
		// composer.addPass(horizontalTiltShiftPass);
		composer.addPass(vignettePass);
		// composer.addPass(filmPass);

		composer.addPass(outPass);


		goo.renderSystem.composers.push(composer);
	}
    */
	function sceneHandlerDemo(goo) {
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: './project/'
		});

		loader.load('test.project').then(function(v) {
			console.log('Success!');
			console.log(v);
			window.goo = goo;
		}).then(null, function(e) {
			console.error('Failed to load scene: ' + e);
		});

		addCamera(goo);

		addShapes(goo);

		//addPostEffects(goo);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		sceneHandlerDemo(goo);
	}

	init();
});

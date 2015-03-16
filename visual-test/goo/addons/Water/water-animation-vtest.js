require([
	'goo/renderer/Material',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Renderer',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/addons/waterpack/FlatWaterRenderer',
	'lib/V',

	'goo/animationpack/systems/AnimationSystem',
	'goo/fsmpack/statemachine/StateMachineSystem',
	'goo/entities/systems/HtmlSystem',
	'goo/timelinepack/TimelineSystem',
	'goo/loaders/DynamicLoader',

	'goo/animationpack/handlers/AnimationHandlers',

	'goo/fsmpack/StateMachineHandlers',
	'goo/timelinepack/TimelineComponentHandler',
	'goo/passpack/PosteffectsHandler',
	'goo/quadpack/QuadComponentHandler',
	'goo/scriptpack/ScriptHandlers',
	'goo/scriptpack/ScriptRegister',
	'goo/scripts/GooClassRegister'
], function (
	Material,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	Renderer,
	Vector3,
	MeshData,
	Shader,
	Texture,
	FlatWaterRenderer,
	V,
	AnimationSystem,
	StateMachineSystem,
	HtmlSystem,
	TimelineSystem,
	DynamicLoader
) {
	'use strict';

	V.describe('The large quad should look like water, with ripples and a reflection of the skybox and the boxes above the quad\'s surface.');

	var skybox = null;
	var cameraEntity;

	function loadSkybox () {
		var environmentPath = 'resources/skybox/';
		// left, right, bottom, top, back, front
		var textureCube = new TextureCreator().loadTextureCube([
			environmentPath + '1.jpg',
			environmentPath + '3.jpg',
			environmentPath + '5.jpg',
			environmentPath + '6.jpg',
			environmentPath + '4.jpg',
			environmentPath + '2.jpg'
		]);
		skybox = createBox(skyboxShader, 10, 10, 10);
		skybox.meshRendererComponent.materials[0].setTexture(Shader.DIFFUSE_MAP, textureCube);
		skybox.meshRendererComponent.materials[0].cullState.cullFace = 'Front';
		skybox.meshRendererComponent.materials[0].depthState.enabled = false;
		skybox.meshRendererComponent.materials[0].renderQueue = 0;
		skybox.meshRendererComponent.cullMode = 'Never';
		skybox.addToWorld();

		goo.callbacksPreRender.push(function () {
			var source = cameraEntity.transformComponent.worldTransform;
			var target = skybox.transformComponent.worldTransform;
			target.translation.set(source.translation);
			target.update();
		});
	}

	function createBox (shader, w, h, d) {
		var meshData = new Box(w, h, d);
		var material = new Material(shader);
		return world.createEntity(meshData, material);
	}

	var skyboxShader = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 eyeVec;',

			'void main(void) {',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'	eyeVec = cameraPosition - worldPos.xyz;',
			'}'//
		].join('\n'),
		fshader: [//
			'precision mediump float;',

			'uniform samplerCube diffuseMap;',

			'varying vec3 eyeVec;',

			'void main(void)',
			'{',
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',
			'	gl_FragColor = cube;',
			'}'//
		].join('\n')
	};

	function loadProject(gooRunner) {

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle', {
			preloadBinaries: true,
			//progressCallback: progressCallback
		}).then(function(result) {
			var project = null;

			// Try to get the first project in the bundle.
			for (var key in result) {
				if (/\.project$/.test(key)) {
					project = result[key];
					break;
				}
			}

			if (!project || !project.id) {
				alert('Error: No project in bundle'); // Should never happen.
				return null;
			}

			return loader.load(project.id);
		});
	}

	var goo = V.initGoo();
	var world = goo.world;
	goo.world.add(new AnimationSystem());
	goo.world.add(new StateMachineSystem(goo));
	goo.world.add(new HtmlSystem(goo.renderer));
	goo.world.add(new TimelineSystem());

	var transformSystem = world.getSystem('TransformSystem');
	var cameraSystem = world.getSystem('CameraSystem');
	var lightingSystem = world.getSystem('LightingSystem');
	var boundingSystem = world.getSystem('BoundingUpdateSystem');
	var renderSystem = world.getSystem('RenderSystem');
	var renderer = goo.renderer;

	// Load the project
	loadProject(goo).then(function () {
		world.processEntityChanges();
		transformSystem._process();
		lightingSystem._process();
		cameraSystem._process();
		boundingSystem._process();
		if (Renderer.mainCamera) { goo.renderer.checkResize(Renderer.mainCamera); }
	}).then(function () {
		var meshData = new Box(7, 7, 7);
		var material = new Material(ShaderLib.simpleLit);

		var count = 2;
		for (var x = 0; x < count; x++) {
			for (var y = -count * 2; y < count * 3; y++) {
				for (var z = 0; z < count; z++) {
					world.createEntity(meshData, material, [
							(x - count / 2) * 15 + (y - count * 0.5) * 8,
							(y - count / 2) * 10,
							(z - count / 2) * 15
					]).addToWorld();
				}
			}
		}

		cameraEntity = V.addOrbitCamera(new Vector3(100, Math.PI / 3, Math.PI / 4));
		cameraEntity.setAsMainCamera();

		V.addLights();

		loadSkybox();

		meshData = new Quad(200, 200, 10, 10);
		material = new Material(ShaderLib.simple);
		var waterEntity = world.createEntity('Water', meshData, material, function (entity) {
			entity.setTranslation(0, Math.sin(world.time * 1) * 5, 0);
		}).setRotation([-Math.PI / 2, 0, 0]).addToWorld();

		var waterRenderer = new FlatWaterRenderer({
			normalsUrl: 'resources/water/waternormals3.png',
			useRefraction: true
		});
		goo.renderSystem.preRenderers.push(waterRenderer);

		waterRenderer.setWaterEntity(waterEntity);
		waterRenderer.setSkyBox(skybox);

		waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 1;
		waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
		waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;

		world.processEntityChanges();
		transformSystem._process();
		lightingSystem._process();
		cameraSystem._process();
		boundingSystem._process();
		renderSystem._process();

		var goon = world.by.name('goon_mesh').first();
		goon.meshRendererComponent.isReflectable = true;
		goon.setTranslation(0, -1000, 3000);
		goon.setScale(20, 20, 20);

		return renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights);
	}).then(function () {
		return renderer.preloadMaterials(renderSystem._activeEntities);
	}).then(function () {
		// Start the rendering loop!
		V.process();
	}).then(null, function (e) {
		// If something goes wrong, 'e' is the error message from the engine.
		alert('Failed to load project: ' + e);
	});
});

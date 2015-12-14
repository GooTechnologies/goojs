require([
	'goo/renderer/Material',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/addons/waterpack/ProjectedGrid',
	'goo/addons/waterpack/ProjectedGridWaterRenderer',
	'lib/V'
], function (
	Material,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	Vector3,
	Camera,
	MeshData,
	Shader,
	Texture,
	ProjectedGrid,
	ProjectedGridWaterRenderer,
	V
	) {
	'use strict';

	V.describe('Projected Grid water example with waves and a reflection of the skybox and the boxes above its surface.');

	function loadSkybox() {
		var environmentPath = 'resources/skybox/';
		// left, right, bottom, top, back, front
		skybox = createBox(skyboxShader, 10, 10, 10);
		new TextureCreator().loadTextureCube([
			environmentPath + '1.jpg',
			environmentPath + '3.jpg',
			environmentPath + '5.jpg',
			environmentPath + '6.jpg',
			environmentPath + '4.jpg',
			environmentPath + '2.jpg'
		]).then(function (textureCube) {
			skybox.meshRendererComponent.materials[0].setTexture(Shader.DIFFUSE_MAP, textureCube);
		});
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

	function createBox(shader, w, h, d) {
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
			'uniform samplerCube diffuseMap;',

			'varying vec3 eyeVec;',

			'void main(void)',
			'{',
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',
			'	gl_FragColor = cube;',
			'}'//
		].join('\n')
	};

	var goo = V.initGoo();
	var world = goo.world;

	var skybox = null;


	var meshData = new Box(7, 7, 7);
	var material = new Material(ShaderLib.simpleLit);

	//! AT: should live in V instead
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

	var cameraEntity = V.addOrbitCamera(new Vector3(150, Math.PI / 3, 0.2));

	V.addLights();

	loadSkybox();

	meshData = new ProjectedGrid(100, 100);
	material = new Material(ShaderLib.simple);
	var waterEntity = world.createEntity('Water', meshData, material).addToWorld();

	world.processEntityChanges();

	var waterRenderer = new ProjectedGridWaterRenderer({
		normalsUrl: 'resources/water/waternormals3.png',
		useRefraction: true
	});
	goo.renderSystem.preRenderers.push(waterRenderer);

	waterRenderer.setWaterEntity(waterEntity);
	waterRenderer.setSkyBox(skybox);

	waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 1;
	waterRenderer.waterMaterial.shader.uniforms.fogColor = [0.95, 0.95, 1.0, 1.0];
	waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;

	V.process();
});

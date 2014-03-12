require([
	'goo/renderer/Material',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/addons/water/FlatWaterRenderer',
	'../../lib/V'
], function (
	Material,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	Vector3,
	MeshData,
	Shader,
	Texture,
	FlatWaterRenderer,
	V
	) {
	'use strict';

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
			target.translation.setv(source.translation);
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
		vshader: [ //
			'attribute vec3 vertexPosition;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //

			'varying vec3 eyeVec;',//

			'void main(void) {', //
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //
			'}'//
		].join('\n'),
		fshader: [//
			'precision mediump float;',//

			'uniform samplerCube diffuseMap;',//

			'varying vec3 eyeVec;',//

			'void main(void)',//
			'{',//
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',//
			'	gl_FragColor = cube;',//
			// ' gl_FragColor = vec4(1.0,0.0,0.0,1.0);',//
			'}'//
		].join('\n')
	};

	var goo = V.initGoo();
	var world = goo.world;

	var skybox = null;


	var meshData = new Box(7, 7, 7);
	var material = new Material(ShaderLib.simpleLit);

	//! AT: should live in V instead
	var count = 3;
	for (var x = 0; x < count; x++) {
		for (var y = 0; y < count * 2; y++) {
			for (var z = 0; z < count; z++) {
				world.createEntity(meshData, material, [
						(x - count / 2) * 15,
						(y - count / 2) * 15 - 10,
						(z - count / 2) * 15
				]).addToWorld();
			}
		}
	}

	var cameraEntity = V.addOrbitCamera(new Vector3(100, Math.PI / 3, Math.PI / 4));

	V.addLights();

	loadSkybox();

	meshData = new Quad(200, 200, 10, 10);
	material = new Material(ShaderLib.simple);
	var waterEntity = world.createEntity(meshData, material)
		.setRotation([-Math.PI / 2, 0, 0])
		.addToWorld();

	//! AT: this does nothing!
	waterEntity.set(function (entity) {
			var transformComponent = entity.transformComponent;
			// transformComponent.transform.translation.x = Math.sin(World.time * 1.0) * 30;
			transformComponent.transform.translation.y = 0;
			// transformComponent.transform.translation.z = Math.cos(World.time * 1.0) * 30;
			transformComponent.setUpdated();
		});

	var waterRenderer = new FlatWaterRenderer({
		normalsUrl: 'resources/water/waternormals3.png'
	});
	goo.renderSystem.preRenderers.push(waterRenderer);

	waterRenderer.setWaterEntity(waterEntity);
	waterRenderer.setSkyBox(skybox);

	waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
	waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;
});

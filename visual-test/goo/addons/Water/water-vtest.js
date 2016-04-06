goo.V.attachToGlobal();

	V.describe('The large quad should look like water, with ripples and a reflection of the skybox and the boxes above the quad\'s surface.');

	function loadSkybox () {
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

		gooRunner.callbacksPreRender.push(function () {
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

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

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

	var cameraEntity = V.addOrbitCamera(new Vector3(100, Math.PI / 3, Math.PI / 4));

	V.addLights();

	loadSkybox();

	meshData = new Quad(200, 200, 10, 10);
	material = new Material(ShaderLib.simple);
	var waterEntity = world.createEntity('Water', meshData, material, function (entity, tpf) {
		entity.setTranslation(0, Math.sin(world.time * 1) * 5, 0);
	}).setRotation([-Math.PI / 2, 0, 0]).addToWorld();

	var waterRenderer = new FlatWaterRenderer({
		normalsUrl: 'resources/water/waternormals3.png',
		useRefraction: true
	});
	gooRunner.renderSystem.preRenderers.push(waterRenderer);

	waterRenderer.setWaterEntity(waterEntity);
	waterRenderer.setSkyBox(skybox);

	waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 1;
	waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
	waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;

	V.process();
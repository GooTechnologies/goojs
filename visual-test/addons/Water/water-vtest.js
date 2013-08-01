require.config({
	paths: {
		"goo": "../../../src/goo"
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
	'goo/renderer/Shader',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/renderer/Texture',
	'goo/addons/water/FlatWaterRenderer',
	'goo/renderer/MeshData'
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
	Shader,
	PointLight,
	LightComponent,
	Texture,
	FlatWaterRenderer,
	MeshData
	) {
	'use strict';

	var cameraEntity = null;
	var skybox = null;

	function waterDemo(goo) {
		// Add entity to world
		var meshData = ShapeCreator.createBox(7, 7, 7);
		var material = Material.createMaterial(ShaderLib.simpleLit, 'BoxMaterial');
		// var texture1 = new TextureCreator().loadTexture2D(resourcePath + '/duck.tga');
		// material.setTexture(Shader.DIFFUSE_MAP, texture1);

		var count = 3;
		for (var x = 0; x < count; x++) {
			for (var y = 0; y < count*2; y++) {
				for (var z = 0; z < count; z++) {
					var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
					entity.transformComponent.transform.translation.setd((x-count/2)*15, (y-count/2)*15 - 10, (z-count/2)*15);
					entity.meshRendererComponent.materials.push(material);
					entity.addToWorld();
				}
			}
		}

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Add orbit camera
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(200, 0, 0.2)
		}));
		cameraEntity.setComponent(scripts);

		var lightEntity1 = goo.world.createEntity('Light1');
		var pointLight1 = new PointLight();
		pointLight1.range = 5000;
		pointLight1.color.setd(1.0,1.0,1.0,1.0);
		lightEntity1.setComponent(new LightComponent(pointLight1));
		lightEntity1.transformComponent.transform.translation.setd(-200, 200, -200);
		lightEntity1.addToWorld();

		loadSkybox(goo);

		var meshData = ShapeCreator.createQuad(200, 200, 10, 10);
		var waterEntity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.simple, 'mat');
		waterEntity.meshRendererComponent.materials.push(material);
		waterEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
		waterEntity.addToWorld();

		var script = {
			run: function (entity) {
				var transformComponent = entity.transformComponent;
				// transformComponent.transform.translation.x = Math.sin(World.time * 1.0) * 30;
				transformComponent.transform.translation.y = 0;
				// transformComponent.transform.translation.z = Math.cos(World.time * 1.0) * 30;
				transformComponent.setUpdated();
			}
		};
		waterEntity.setComponent(new ScriptComponent(script));

		var waterRenderer = new FlatWaterRenderer({
			normalsUrl: 'resources/water/waternormals3.png'
		});
		goo.renderSystem.preRenderers.push(waterRenderer);

		waterRenderer.setWaterEntity(waterEntity);
		waterRenderer.setSkyBox(skybox);

		waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
		waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;

	}

	function loadSkybox (goo) {
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
		skybox = createBox(goo, skyboxShader, 10, 10, 10);
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

	function createBox (goo, shader, w, h, d) {
		var meshData = ShapeCreator.createBox(w, h, d);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(shader, 'mat');
		entity.meshRendererComponent.materials.push(material);
		return entity;
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

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		waterDemo(goo);
	}

	init();
});

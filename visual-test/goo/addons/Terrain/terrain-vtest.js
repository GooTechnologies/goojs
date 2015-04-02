require([
	'goo/renderer/Material',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/renderer/light/DirectionalLight',
	'goo/addons/waterpack/FlatWaterRenderer',
	'goo/addons/terrainpack/TerrainHandler',
	'goo/scriptpack/FlyControlScript',
	'goo/scripts/Scripts',
	'lib/V'
], function(
	Material,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	ShaderBuilder,
	Vector3,
	Camera,
	MeshData,
	Shader,
	Texture,
	DirectionalLight,
	FlatWaterRenderer,
	TerrainHandler,
	FlyControlScript,
	Scripts,
	V
) {
	'use strict';

	V.describe('The large quad should look like water, with ripples and a reflection of the skybox and the boxes above the quad\'s surface.');

	function loadSkybox() {
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

		goo.callbacksPreRender.push(function() {
			var source = cameraEntity.transformComponent.worldTransform;
			var target = skybox.transformComponent.worldTransform;
			target.translation.setVector(source.translation);
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
			'}' //
		].join('\n'),
		fshader: [ //
			'precision mediump float;',

			'uniform samplerCube diffuseMap;',

			'varying vec3 eyeVec;',

			'void main(void)',
			'{',
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',
			'	gl_FragColor = cube;',
			'}' //
		].join('\n')
	};

	var goo = V.initGoo();
	var world = goo.world;

	var skybox = null;

	var orbitScript = Scripts.create(FlyControlScript, {
		walkSpeed: 20
	});
	var camera = new Camera();
	var cameraEntity = goo.world.createEntity(camera, orbitScript, 'CameraEntity').addToWorld();
	// var cameraEntity = V.addOrbitCamera(new Vector3(100, Math.PI / 3, Math.PI / 4));

	// V.addLights();
	var directionalLight = new DirectionalLight(new Vector3(1, 1, 0.9));
	directionalLight.intensity = 1;
	var light = goo.world.createEntity('directionalLight', directionalLight).addToWorld();
	light.setRotation(-Math.PI/4, 0, 0);

	loadSkybox();

	// var meshData = new Quad(200, 200, 10, 10);
	// var material = new Material(ShaderLib.simple);
	// var waterEntity = world.createEntity('Water', meshData, material, function(entity) {
	// 	// entity.setTranslation(0, Math.sin(world.time * 1) * 5, 0);
	// }).setRotation([-Math.PI / 2, 0, 0]).addToWorld();

	// var waterRenderer = new FlatWaterRenderer({
	// 	normalsUrl: 'resources/water/waternormals3.png',
	// 	useRefraction: false
	// });
	// goo.renderSystem.preRenderers.push(waterRenderer);

	// waterRenderer.setWaterEntity(waterEntity);
	// waterRenderer.setSkyBox(skybox);

	// waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 1;
	// waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
	// waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;


	var terrainHandler = new TerrainHandler(goo, 256, 5, 'resources/');

	var forrestLODMap = {};
	var terrainEditSettings = {
		edit: false,
		mode: 'height',
		brush: 'flare.png',
		size: 20,
		power: 100,
		rgba: 'ground2'
	};
	var terrainData = {
		"map_id": "legend01_map01",
		"heightMap": "maps/legend01_map01_height.raw",
		"splatMap": "maps/legend01_map01_splat.raw",
		"terrainConfig": "legend01",
		"ground1": {
			"texture": "images/legend_02/ground/grass_01.dds",
			"material": "ground_dirt_hit",
			"vegetation": {
				"grass_short_yellow_1": 0.39,
				"grass_short_green_1": 0.2,
				"grass_tall_3": 0.2,
				"grass_tall_4": 0.2,
				"thicket_1": 0.01
			},
			"forrest": {
				"rock_s_01": 0.4,
				"rock_s_02": 0.3,
				"rock_m_01": 0.05,
				"rock_m_02": 0.05
			}
		},
		"ground2": {
			"texture": "images/legend_02/ground/grass_02.dds",
			"material": "ground_grass_hit",
			"vegetation": {
				"grass_short_green_1": 0.3,
				"grass_short_green_2": 0.3,
				"grass_tall_1": 0.2,
				"grass_tall_2": 0.1,
				"nettles_1": 0.1
			},
			"forrest": {
				"tree_aspen_xs": 0.2,
				"tree_aspen_s": 0.05,
				"tree_spruce_xs": 0.2,
				"bush_aspen_l": 0.1,
				"bush_aspen_s": 0.05,
				"rock_s_01": 0.05,
				"rock_s_02": 0.05,
				"rock_m_01": 0.1,
				"rock_m_02": 0.1,
				"rock_l_01": 0.1
			}
		},
		"ground3": {
			"texture": "images/legend_02/ground/gravel_clay_debris_01.dds",
			"material": "ground_dirt_hit",
			"vegetation": {
				"grass_short_yellow_1": 0.3
			},
			"forrest": {
				"rock_s_01": 0.2,
				"rock_s_02": 0.2,
				"rock_m_01": 0.05
			}
		},
		"ground4": {
			"texture": "images/legend_02/ground/gravel_01.dds",
			"material": "ground_gravel_hit"
		},
		"ground5": {
			"texture": "images/legend_02/ground/grass_03.dds",
			"material": "ground_grass_hit",
			"vegetation": {
				"nettles_1": 0.1,
				"thicket_1": 0.02,
				"grass_tall_2": 0.2,
				"grass_short_yellow_1": 0.2,
				"grass_tall_3": 0.1,
				"grass_tall_4": 0.1
			},
			"forrest": {
				"tree_aspen_xs": 0.2,
				"tree_aspen_s": 0.1,
				"tree_aspen_m": 0.05,
				"tree_aspen_l": 0.05,
				"tree_spruce_xs": 0.1,
				"tree_spruce_s": 0.2,
				"bush_aspen_l": 0.1,
				"bush_aspen_s": 0.1,
				"rock_s_01": 0.01,
				"rock_s_02": 0.01,
				"rock_m_01": 0.01,
				"rock_m_02": 0.02,
				"rock_l_01": 0.05
			}
		},
		"stone": {
			"texture": "images/legend_02/ground/stone_01.dds",
			"material": "ground_stone_hit"
		},
		"vegetationAtlas": "images/legend_02/vegetation/grass.dds",
		"vegetationTypes": {
			"grass_short_green_1": {
				"w": 1,
				"h": 0.5,
				"tx": 0,
				"ty": 0.75,
				"tw": 0.25,
				"th": 0.25
			},
			"grass_short_green_2": {
				"w": 1,
				"h": 0.5,
				"tx": 0.25,
				"ty": 0.75,
				"tw": 0.25,
				"th": 0.25
			},
			"grass_short_green_3": {
				"w": 1,
				"h": 0.5,
				"tx": 0,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.25
			},
			"grass_short_green_4": {
				"w": 1,
				"h": 0.5,
				"tx": 0.25,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.25
			},
			"grass_short_yellow_1": {
				"w": 1,
				"h": 0.5,
				"tx": 0.5,
				"ty": 0.75,
				"tw": 0.25,
				"th": 0.25
			},
			"grass_tall_1": {
				"w": 1,
				"h": 1,
				"tx": 0,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"grass_tall_2": {
				"w": 1,
				"h": 1,
				"tx": 0.25,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"grass_tall_3": {
				"w": 1,
				"h": 1,
				"tx": 0.5,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"grass_tall_4": {
				"w": 1,
				"h": 1,
				"tx": 0.75,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"nettles_1": {
				"w": 1.1,
				"h": 0.7,
				"tx": 0.5,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.25
			},
			"thicket_1": {
				"w": 1.1,
				"h": 1.1,
				"tx": 0.75,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.5
			}
		},
		"forrestAtlas": "images/legend_02/vegetation/impostors_diffuse.dds",
		"forrestAtlasNormals": "images/legend_02/vegetation/impostors_normal.dds",
		"vegetationAlphaThreshold": 0.2,
		"forrestAlphaThreshold": 0.4,
		"forrestTypes": {
			"tree_aspen_xs": {
				"w": 7,
				"h": 7,
				"tx": 0.25,
				"ty": 0.25,
				"tw": 0.25,
				"th": 0.25
			},
			"tree_aspen_s": {
				"w": 14,
				"h": 22,
				"tx": 0.5,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.375
			},
			"tree_aspen_m": {
				"w": 13,
				"h": 26,
				"tx": 0.25,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.5
			},
			"tree_aspen_l": {
				"w": 13,
				"h": 26,
				"tx": 0,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.5
			},
			"tree_spruce_xs": {
				"w": 4,
				"h": 8,
				"tx": 0.875,
				"ty": 0.75,
				"tw": 0.125,
				"th": 0.25
			},
			"tree_spruce_s": {
				"w": 9,
				"h": 18,
				"tx": 0.5,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"bush_aspen_l": {
				"w": 13,
				"h": 13,
				"tx": 0,
				"ty": 0.25,
				"tw": 0.25,
				"th": 0.25
			},
			"bush_aspen_s": {
				"w": 13,
				"h": 6,
				"tx": 0.5,
				"ty": 0.875,
				"tw": 0.25,
				"th": 0.125
			},
			"rock_s_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_s_02": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_m_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_m_02": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_l_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			}
		}
	};

	var levelData = {};
	if (!levelData.fog) {
		levelData.fog = {
			enabled: true,
			start: 0,
			end: 1000,
			color: [1, 1, 1]
		};
	}
	ShaderBuilder.USE_FOG = levelData.fog.enabled;
	ShaderBuilder.FOG_SETTINGS = [levelData.fog.start, levelData.fog.end];
	ShaderBuilder.FOG_COLOR = levelData.fog.color;

	terrainHandler.initLevel(terrainData, terrainEditSettings, forrestLODMap).then(function() {

		// curLightmap = lightMapData;
		// if (curLightmap) {
		// var size = Math.sqrt(curLightmap.byteLength);
		// terrainHandler.useLightmap(new Uint8Array(curLightmap), size);
		// }

		// if (options.disableForrestLOD) {
		terrainHandler.forrest.minDist = 0;
		// }

		console.log("LOADED TERRAIN ", terrainHandler.terrain);
		console.log("HEIGHTMAP = ", terrainHandler.terrain.heightMap);

		goo.callbacks.push(function(tpf) {
			if (!goo.doProcess) {
				return;
			}

			// currentCameraEntity = playCameraEntity;

			// // expose this functionality for when doing platform teleports
			// playerEntity.glueToGround = function() {
			// 	// player entity is what keeps track of player pos
			// 	var pos = playerEntity.transformComponent.transform.translation;
			// 	pos.y = terrainHandler.getHeightAt([pos.x, 0, pos.z]) + 1.5;
			// };

			// playerEntity.glueToGround();

			terrainHandler.update(cameraEntity);
		});

		goo._updateFrame(goo.start);

		// return skyboxPromise;
	}).then(function() {
		// SystemBus.emit('onLevelLoaded');
	});

	V.process();
});
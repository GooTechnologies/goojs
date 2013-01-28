require({
    baseUrl : "./",
    paths : {
        goo: "../src/goo",
    }
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3', 'goo/util/Handy', 'goo/math/Transform',
		'goo/animation/Joint', 'goo/math/Matrix3x3', 'goo/renderer/Util', 'goo/animation/AnimationManager',
		'goo/animation/blendtree/SimpleAnimationApplier', 'goo/animation/state/SteadyState', 'goo/animation/blendtree/ClipSource',
		'goo/math/Quaternion'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera, CameraComponent, BasicControlScript, Vector3, Handy,
	Transform, Joint, Matrix3x3, Util, AnimationManager, SimpleAnimationApplier, SteadyState, ClipSource, Quaternion) {
	"use strict";

    var resourcePath = "../resources";

	var animationManager = null;
	var walking = true;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// var ui = new DebugUI(goo);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 20, 150);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Setup light
		var light = new Light();
		var entity = goo.world.createEntity('Light1');
		entity.setComponent(new LightComponent(light));
		var transformComponent = entity.transformComponent;
		transformComponent.transform.translation.x = 80;
		transformComponent.transform.translation.y = 50;
		transformComponent.transform.translation.z = 80;
		entity.addToWorld();

		// Load skeleton
		loadModels(goo);
	}

	function loadModels(goo) {
		var pool = {};

		var shader = {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0,
				vertexWeights : MeshData.WEIGHTS,
				vertexJointIDs : MeshData.JOINTIDS
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				diffuseMap : Shader.TEXTURE0,
				opacity : 1.0,
				jointPalette : function(shaderInfo) {
					var skMesh = shaderInfo.meshData;
					var pose = skMesh.currentPose;
					if (pose !== null) {
						var palette = pose._matrixPalette;
						var buffLength = skMesh.paletteMap.length * 16;
						var store = pool[buffLength];
						if (!store) {
							store = new Float32Array(buffLength);
							pool[buffLength] = store;
						}
						var refMat;
						for ( var index = 0; index < skMesh.paletteMap.length; index++) {
							var ref = skMesh.paletteMap[index];
							refMat = palette[ref];
							for ( var i = 0; i < 4; i++) {
								for ( var j = 0; j < 4; j++) {
									store[index * 16 + i * 4 + j] = refMat.data[j * 4 + i];
								}
							}
						}
						return store;
					}
				}
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //
			'attribute vec4 vertexWeights;', //
			'attribute vec4 vertexJointIDs;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform mat4 jointPalette[56];', //

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			// apply weights
			'	mat4 mat = mat4(0.0);', //

			'	mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;', //
			'	mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;', //
			'	mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;', //
			'	mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;', //

			'	texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * mat * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap;',//
			'uniform float opacity;',//

			'varying vec2 texCoord0;',//

			'void main(void)',//
			'{',//
			'	gl_FragColor = vec4(texture2D(diffuseMap, texCoord0).rgb, opacity);',//
			'}',//
			].join('\n')
		};
		var skinShader = Material.createShader(shader);

		var importer = new JSONImporter(goo.world);

		var skinMeshes = [];

		// Load asynchronous with callback
		importer.load(resourcePath + '/skeleton/skeleton.model', resourcePath + '/skeleton/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1, 1, 1);
				entities[0].transformComponent.transform.translation.y = -50;
				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));

				for ( var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					console.log(entity.name);
					if (entity.meshDataComponent && entity.meshDataComponent.meshData.type === MeshData.SKINMESH) {
						skinMeshes.push(entity);
						entity.meshRendererComponent.materials[0].shader = skinShader;
					}
				}

				if (skinMeshes.length > 0) {
					loadAnimations(skinMeshes[0].meshDataComponent.meshData.currentPose);
				}
			},
			onError : function(error) {
				console.error(error);
			}
		});

		goo.callbacks.push(function(tpf) {
			if (animationManager) {
				animationManager.update();
			}
		});
	}

	function loadAnimations(pose) {
		var request = new XMLHttpRequest();
		request.open('GET', resourcePath + '/skeleton/skeleton.anim', true);
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					setupAnimations(pose, request.responseText);
				} else {
					console.error(request.statusText);
				}
			}
		};
		request.send();
	}

	function setupAnimations(pose, animationTree) {
		// setup manager
		animationManager = new AnimationManager(pose);
		animationManager._applier = new SimpleAnimationApplier();

		new JSONImporter().importAnimationTree(animationManager, animationTree, {
			onSuccess : function(outputStore) {
				animationManager.getBaseAnimationLayer().setCurrentStateByName("walk_anim", true);
			},
			onError : function(error) {
				console.error(error);
			}
		});

		document.addEventListener('keydown', function(e) {
			e = window.event || e;
			var code = e.charCode || e.keyCode;
			console.log(code);
			if (code == 32) { // space bar
				animationManager.getBaseAnimationLayer().doTransition(walking ? "run" : "walk");
				walking = !walking;
			} else if (code == 13) { // enter
				animationManager.findAnimationLayer("punchLayer").setCurrentStateByName("punch_right", true);
			}
		}, false);
	}

	init();
});

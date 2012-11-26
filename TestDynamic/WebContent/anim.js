require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3', 'goo/util/Handy', 'goo/math/Transform',
		'goo/animation/Joint', 'goo/math/Matrix3x3', 'goo/renderer/Util', 'goo/animation/AnimationManager', 'goo/animation/SimpleAnimationApplier',
		'goo/animation/SteadyState', 'goo/animation/ClipSource'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent,
	MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader,
	JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera, CameraComponent, BasicControlScript, Vector3,
	Handy, Transform, Joint, Matrix3x3, Util, AnimationManager, SimpleAnimationApplier, SteadyState, ClipSource) {
	"use strict";

	var animationManager = null;

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// var ui = new DebugUI(goo);

		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 20, 150);
		camera.lookAt(new Vector3(0, 40, 0), Vector3.UNIT_Y);
		camera.onFrameChange();
		var cameraEntity = goo.world.createEntity("CameraEntity");
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

		// Examples of model loading
		loadModels(goo);
	}

	function loadModels(goo) {
		var shader = {
			bindings : {
				opacity : {
					type : 'float',
					value : 1.0
				},
				jointPalette : {
					type : 'mat4',
					pool : {},
					value : function(shaderInfo) {
						var skMesh = shaderInfo.meshData;
						var pose = skMesh.currentPose;
						if (pose !== null) {
							var palette = pose.matrixPalette;
							var buffLength = skMesh.paletteMap.length * 16;
							var store = this.pool[buffLength];
							if (!store) {
								store = new Float32Array(buffLength);
								this.pool[buffLength] = store;
							}
							var index = 0;
							var refMat;
							for ( var refIndex = 0; refIndex < skMesh.paletteMap.length; refIndex++) {
								var ref = skMesh.paletteMap[refIndex];
								refMat = palette[ref];
								for ( var i = 0; i < 4; i++) {
									for ( var j = 0; j < 4; j++) {
										store[index * 16 + i * 4 + j] = refMat.data[j * 4 + i];
									}
								}
								index++;
							}
							return store;
							// shaderCall.uniformMatrix4fv(false, store);
						}
					}
				}
			},
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //
			'attribute vec4 vertexWeights; //!WEIGHTS', //
			'attribute vec4 vertexJointIDs; //!JOINTIDS', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//
			'uniform mat4 jointPalette[50];', //

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			// apply weights
			'	mat4 mat = mat4(0.0);', //

			'	mat += jointPalette[int(vertexJointIDs[0])] * vertexWeights[0];', //
			'	mat += jointPalette[int(vertexJointIDs[1])] * vertexWeights[1];', //
			'	mat += jointPalette[int(vertexJointIDs[2])] * vertexWeights[2];', //
			'	mat += jointPalette[int(vertexJointIDs[3])] * vertexWeights[3];', //

			'	texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * mat * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap; //!TEXTURE0',//

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
		importer.load('resources/careerrun/running_man_1.model', 'resources/careerrun/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1, 1, 1);
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
					loadAnimations(skinMeshes[0].meshDataComponent.meshData.currentPose, 'resources/careerrun/run.anim');
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

			for ( var i = 0; i < skinMeshes.length; i++) {
				var entity = skinMeshes[i];
				var meshData = entity.meshDataComponent.meshData;
				drawSkeleton(entity, meshData, goo.renderer);
			}
		});
	}

	function loadAnimations(pose, modelUrl) {
		var request = new XMLHttpRequest();
		request.open('GET', modelUrl, true);
		var that = this;
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					setupAnimations(pose, request.responseText);
					// callback.onSuccess(entities);
				} else {
					console.error(request.statusText);
					// callback.onError(request.statusText);
				}
			}
		};
		request.send();
	}

	function setupAnimations(pose, animationTree) {
		// setup manager
		var timer = {
			start : Date.now(),
			getTimeInSeconds : function() {
				return (Date.now() - this.start) / 1000.0;
			}
		}; // new Timer()
		animationManager = new AnimationManager(timer, pose);
		animationManager.applier = new SimpleAnimationApplier();

		var importer = new JSONImporter();

		var clip = importer.importAnimation(animationTree, "run");

		var state = new SteadyState("running");
		var source = new ClipSource(clip, animationManager);
		state._sourceTree = source;

		animationManager.layers[0].steadyStates[state.name] = state;
		animationManager.getClipInstance(clip)._loopCount = -1;
		animationManager.getClipInstance(clip)._timeScale = 0.0; // uncomment to make him slow enough to check out
		animationManager.layers[0].setCurrentStateByName("running", true);
	}

	var alreadyDrawn = {};
	function drawSkeleton(entity, meshData, renderer) {
		var pose = meshData.currentPose;
		if (pose !== undefined /* && !alreadyDrawn[pose.skeleton.name] */) {
			// If we're in view, go ahead and draw our associated skeleton pose
			// SkeletalDebugger.drawSkeleton(pose, scene, renderer);
			var joints = pose.skeleton.joints;
			var globals = pose.globalTransforms;

			for ( var i = 0, max = joints.length; i < max; i++) {
				drawJoint(globals[i], entity, renderer);

				var parentIndex = joints[i].parentIndex;
				if (parentIndex !== Joint.NO_PARENT) {
					drawBone(globals[parentIndex], globals[i], entity, renderer);
				}
			}

			alreadyDrawn[pose.skeleton.name] = true;
		}
	}

	var jointMaterial = Material.createMaterial(Util.clone(Material.shaders.simpleColored));
	jointMaterial.shader.bindings.color.value = [1.0, 0.0, 0.0];
	var renderableJoint = {
		meshData : ShapeCreator.createBoxData(1, 1, 1),
		materials : [jointMaterial],
		transform : new Transform()
	};

	var boneMaterial = Material.createMaterial(Util.clone(Material.shaders.simpleColored));
	boneMaterial.shader.bindings.color.value = [0.0, 1.0, 0.0];
	var renderableBone = {
		meshData : ShapeCreator.createBoxData(1, 1, 5),
		materials : [boneMaterial],
		transform : new Transform()
	};

	function drawJoint(jntTransform, entity, renderer) {
		renderableJoint.transform.multiply(entity.transformComponent.worldTransform, jntTransform);

		// renderableJoint.setWorldRotation(SkeletalDebugger.joint.getWorldRotation());
		// renderableJoint.setWorldScale(size);

		renderer.render(renderableJoint, Renderer.mainCamera, [], null, false);
	}

	function drawBone(start, end, entity, renderer) {
		// Determine our start and end points
		var stPnt = new Vector3();
		var endPnt = new Vector3();
		start.applyForward(Vector3.ZERO, stPnt);
		end.applyForward(Vector3.ZERO, endPnt);

		// determine distance and use as a scale to elongate the bone
		var tmp = new Vector3().set(endPnt).sub(stPnt);
		var scale = tmp.length();
		if (scale === 0) {
			scale = 0.000001;
		}
		// TODO: hack cause transforming doesnt work
		scale = 1;

		// var vol = scene.getWorldBound();
		var size = 1.0;
		// if (vol != null) {
		// SkeletalDebugger.measureSphere.setCenter(vol.getCenter());
		// SkeletalDebugger.measureSphere.setRadius(0);
		// SkeletalDebugger.measureSphere.mergeLocal(vol);
		// size = SkeletalDebugger.BONE_RATIO * SkeletalDebugger.measureSphere.getRadius();
		// }
		renderableBone.transform.setIdentity();
		renderableBone.transform.scale.set(size, size, scale);

		// determine center point of bone (translation).
		var store = new Vector3();
		store.copy(stPnt).add(endPnt).scalarDiv(2.0);
		renderableBone.transform.translation.copy(store);

		// Orient bone to point along axis formed by start and end points.
		var orient = new Matrix3x3();
		orient.lookAt(endPnt.sub(stPnt).normalize(), Vector3.UNIT_Y);
		// var q = new Quaternion().fromRotationMatrix(orient);
		// q.normalizeLocal();
		renderableBone.transform.rotation.copy(orient);

		renderableBone.transform.update();

		// Offset with skin transform
		renderableBone.transform.multiply(entity.transformComponent.worldTransform, renderableBone.transform);

		// renderableBone.transform.update();

		// Draw our bone!
		renderer.render(renderableBone, Renderer.mainCamera, [], null, false);
	}

	init();
});

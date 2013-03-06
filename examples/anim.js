require.config({
    baseUrl : "./",
    paths : {
        goo: "../src/goo",
        'goo/lib': '../lib'
    }
});
require([
	'goo/renderer/MeshData',
	'goo/renderer/Renderer',
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/loaders/JSONImporter',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/animation/Joint',
	'goo/math/Matrix3x3',
	'goo/renderer/Util',
	'goo/animation/AnimationManager',
	'goo/animation/blendtree/SimpleAnimationApplier',
	'goo/animation/state/SteadyState',
	'goo/animation/blendtree/ClipSource',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript'
], function (
	MeshData,
	Renderer,
	Material,
	GooRunner,
	JSONImporter,
	ScriptComponent,
	ShapeCreator,
	LightComponent,
	PointLight,
	Camera,
	CameraComponent,
	Vector3,
	Transform,
	Joint,
	Matrix3x3,
	Util,
	AnimationManager,
	SimpleAnimationApplier,
	SteadyState,
	ClipSource,
	ShaderLib,
	OrbitCamControlScript
) {
	"use strict";

    var resourcePath = "../resources";

	var animationManager = null;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 20, 350);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 40, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(350, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);

		// Setup light
		var light = new PointLight();
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
		var importer = new JSONImporter(goo.world);

		var skinMeshes = [];

		// Load asynchronous with callback
		importer.load(resourcePath + '/careerrun/running_man_1.model', resourcePath + '/careerrun/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1, 1, 1);
				entities[0].transformComponent.transform.translation.y = -50;

				for ( var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					console.log(entity.name);
					if (entity.meshDataComponent && entity.meshDataComponent.meshData.type === MeshData.SKINMESH) {
						skinMeshes.push(entity);
					}
				}

				if (skinMeshes.length > 0) {
					for (var i=0;i<skinMeshes.length;i++) {
						var skinShader = Material.createShader(Util.clone(ShaderLib.skinning));
						skinShader.defines.JOINT_COUNT = skinMeshes[i].meshDataComponent.meshData.paletteMap.length;
						skinShader.defines.WEIGHTS = skinMeshes[i].meshDataComponent.meshData.weightsPerVertex;
						console.log(skinMeshes[i].name + ' - joint count: ', skinShader.defines.JOINT_COUNT, ' weight count: ', skinShader.defines.WEIGHTS);

						skinMeshes[i].meshRendererComponent.materials[0].shader = skinShader;
					}
					loadAnimations(skinMeshes[0].meshDataComponent.meshData.currentPose, resourcePath + '/careerrun/run.anim');
				}
			},
			onError : function(error) {
				console.error(error);
			}
		});

		goo.callbacks.push(function(/*tpf*/) {
			if (animationManager) {
				animationManager.update();
			}

			// Debug draw skeleton
			// for ( var i = 0; i < skinMeshes.length; i++) {
			// var entity = skinMeshes[i];
			// var meshData = entity.meshDataComponent.meshData;
			// drawSkeleton(entity, meshData, goo.renderer);
			// }
		});
	}

	function loadAnimations(pose, modelUrl) {
		var request = new XMLHttpRequest();
		request.open('GET', modelUrl, true);
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
		animationManager = new AnimationManager(pose);
		animationManager._applier = new SimpleAnimationApplier();

		var importer = new JSONImporter();

		var clip = importer.importAnimation(animationTree, "run");

		var state = new SteadyState("running");
		var source = new ClipSource(clip, animationManager);
		state._sourceTree = source;

		animationManager._layers[0]._steadyStates[state._name] = state;
		animationManager.getClipInstance(clip)._loopCount = -1;
		animationManager.getClipInstance(clip)._timeScale = 1.0;
		animationManager._layers[0].setCurrentStateByName("running", true);
	}

	var alreadyDrawn = {};
	function drawSkeleton(entity, meshData, renderer) {
		var pose = meshData.currentPose;
		if (pose !== undefined /* && !alreadyDrawn[pose._skeleton._name] */) {
			// If we're in view, go ahead and draw our associated skeleton pose
			// SkeletalDebugger.drawSkeleton(pose, scene, renderer);
			var joints = pose._skeleton._joints;
			var globals = pose._globalTransforms;

			for ( var i = 0, max = joints.length; i < max; i++) {
				drawJoint(globals[i], entity, renderer);

				var parentIndex = joints[i]._parentIndex;
				if (parentIndex !== Joint.NO_PARENT) {
					drawBone(globals[parentIndex], globals[i], entity, renderer);
				}
			}

			alreadyDrawn[pose._skeleton._name] = true;
		}
	}

	var jointMaterial = Material.createMaterial(Util.clone(ShaderLib.simpleColored));
	jointMaterial.depthState.enabled = false;
	jointMaterial.shader.uniforms.color = [1.0, 0.0, 0.0];
	var renderableJoint = {
		meshData : ShapeCreator.createBox(2, 2, 2),
		materials : [jointMaterial],
		transform : new Transform()
	};

	var boneMaterial = Material.createMaterial(Util.clone(ShaderLib.simpleColored));
	boneMaterial.depthState.enabled = false;
	boneMaterial.shader.uniforms.color = [0.0, 1.0, 0.0];
	var renderableBone = {
		meshData : ShapeCreator.createBox(1, 1, 1),
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
		var tmp = new Vector3().copy(endPnt).sub(stPnt);
		var scale = tmp.length() / 1.0;
		if (scale === 0) {
			scale = 0.000001;
		}
		// TODO: hack cause transforming doesnt work
		// scale = 1;

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
		// TODO: fix, probably matrix row/col issue
		// var q = new Quaternion().fromRotationMatrix(orient);
		// q.normalize();
		// q.toRotationMatrix(orient);
		renderableBone.transform.rotation.copy(orient);

		// Offset with skin transform
		renderableBone.transform.multiply(entity.transformComponent.worldTransform, renderableBone.transform);

		renderableBone.transform.update();

		// Draw our bone!
		renderer.render(renderableBone, Renderer.mainCamera, [], null, false);
	}

	init();
});

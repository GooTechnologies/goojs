require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3', 'goo/util/Handy', 'goo/math/Transform',
		'goo/animation/Joint', 'goo/math/Matrix3x3'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent,
	MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader,
	JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera, CameraComponent, BasicControlScript, Vector3,
	Handy, Transform, Joint, Matrix3x3) {
	"use strict";

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
				}
			},
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
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

		var importer = new JSONImporter(goo.world);

		var skinMeshes = [];

		// Load asynchronous with callback
		importer.load('resources/skeleton.model', 'resources/', {
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
					}
				}
			},
			onError : function(error) {
				console.error(error);
			}
		});

		goo.callbacks.push(function(tpf) {
			for ( var i = 0; i < skinMeshes.length; i++) {
				var entity = skinMeshes[i];
				var meshData = entity.meshDataComponent.meshData;
				drawSkeleton(entity, meshData, goo.renderer);
			}
		});
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

	var renderableJoint = {
		meshData : ShapeCreator.createBoxData(1, 1, 1),
		materials : [Material.createMaterial(Material.shaders.simple)],
		transform : new Transform()
	};

	var renderableBone = {
		meshData : ShapeCreator.createBoxData(1, 1, 1),
		materials : [Material.createMaterial(Material.shaders.simple)],
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

		// Draw our bone!
		renderer.render(renderableBone, Renderer.mainCamera, [], null, false);
	}

	init();
});

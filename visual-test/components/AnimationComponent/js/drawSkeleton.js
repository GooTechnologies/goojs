define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Renderer',

	'goo/shapes/ShapeCreator',
	'goo/animation/Joint',

	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/math/Matrix3x3'
], function(
	MeshData,
	Shader,
	Material,
	Renderer,

	ShapeCreator,
	Joint,

	Vector3,
	Transform,
	Matrix3x3
) {
	var jointScale = new Transform();
	jointScale.scale.setd(3,3,3);
	jointScale.update();
	var boneSize = 1.0;

	var skeletonShaderDef = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			color : [1.0, 1.0, 1.0, 1.0]
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'void main(void) {',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',

		'uniform vec4 color;',

		'void main(void)',
		'{',
		'	gl_FragColor = color;',
		'}'//
		].join('\n')
	};

	var jointMaterial = Material.createMaterial(skeletonShaderDef);
	jointMaterial.depthState.enabled = false;
	jointMaterial.blendState.blending = 'CustomBlending';
	jointMaterial.uniforms.color = [1.0, 0.0, 0.0, 0.2];
	var renderableJoint = {
		meshData : ShapeCreator.createBox(1, 1, 1),
		materials : [jointMaterial],
		transform : new Transform()
	};

	var boneMaterial = Material.createMaterial(skeletonShaderDef);
	boneMaterial.depthState.enabled = false;
	boneMaterial.blendState.blending = 'CustomBlending';
	boneMaterial.shader.uniforms.color = [0.0, 1.0, 0.0, 0.1];
	var renderableBone = {
		meshData : ShapeCreator.createBox(1, 1, 1),
		materials : [boneMaterial],
		transform : new Transform()
	};


	function drawJoint(jntTransform, entity, renderer) {
		renderableJoint.transform.multiply(entity.transformComponent.worldTransform, jntTransform);
		renderableJoint.transform.multiply(renderableJoint.transform, jointScale);

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

		renderableBone.transform.setIdentity();
		renderableBone.transform.scale.set(boneSize, boneSize, scale);

		// determine center point of bone (translation).
		var store = new Vector3();
		store.copy(stPnt).add(endPnt).div(2.0);
		renderableBone.transform.translation.copy(store);

		// Orient bone to point along axis formed by start and end points.
		var orient = new Matrix3x3();
		orient.lookAt(endPnt.sub(stPnt).normalize(), Vector3.UNIT_Y);
		renderableBone.transform.rotation.copy(orient);

		// Offset with skin transform
		renderableBone.transform.multiply(entity.transformComponent.worldTransform, renderableBone.transform);


		renderableBone.transform.update();

		// Draw our bone!
		renderer.render(renderableBone, Renderer.mainCamera, [], null, false);
	}


	return function(entity, renderer) {
		var pose = entity.meshDataComponent.currentPose;
		if (pose !== undefined) {
			// If we're in view, go ahead and draw our associated skeleton pose
			var joints = pose._skeleton._joints;
			var globals = pose._globalTransforms;

			for ( var i = 0, max = joints.length; i < max; i++) {
				drawJoint(globals[i], entity, renderer);

				var parentIndex = joints[i]._parentIndex;
				if (parentIndex !== Joint.NO_PARENT) {
					drawBone(globals[parentIndex], globals[i], entity, renderer);
				}
			}
		}
	};
});
require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/geometrypack/Surface',
	'goo/renderer/Camera',

	'goo/animationpack/components/AnimationComponent',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/Skeleton',
	'goo/animationpack/Joint',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/animationpack/clip/JointChannel',
	'goo/animationpack/clip/AbstractAnimationChannel',
	'goo/animationpack/systems/AnimationSystem'

], function (
	V,
	Material,
	ShaderLib,
	Box,
	Vector3,
	Quaternion,
	MathUtils,
	MeshData,
	Surface,
	Camera,

	AnimationComponent,
	SkeletonPose,
	Skeleton,
	Joint,
	SteadyState,
	ClipSource,
	AnimationClip,
	JointChannel,
	AbstractAnimationChannel,
	AnimationSystem
) {
	'use strict';

	V.describe('Origami Animation Test');


	function addSkeltonAttributeData(meshData, joints) {

		var skeletonMaps = MeshData.defaultMap([MeshData.JOINTIDS, MeshData.WEIGHTS]);
		meshData.attributeMap[MeshData.JOINTIDS] = skeletonMaps[MeshData.JOINTIDS];
		meshData.attributeMap[MeshData.WEIGHTS] = skeletonMaps[MeshData.WEIGHTS];
		// rebuildData generates dataviews on the new attributes.
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
		// These are probably used somewhere.
		meshData.weightsPerVertex = 4; // Default weights count
		meshData.type = MeshData.SKINMESH;

		// Just map 1to1,
		meshData.paletteMap = [];
		for (var i =0; i < joints.length; i++) {
			meshData.paletteMap[i] = i;
		}
		

	}

	function getInvT(joint, joints, tArray) {
		
		if (joint._parentIndex != Joint.NO_PARENT) {
			var parentJoint = joints[joint._parentIndex];
			var invT = parentJoint._inverseBindPose.translation.data;
			tArray[0] -= invT[0];
			tArray[1] -= invT[1];
			tArray[2] -= invT[2];
			getInvT(parentJoint, joints, tArray);
		}

		return tArray;
	}

	function createJointChannel(joint, joints, times, t, r, s, blendType, channels) {

		// The channel's transform keyframes needs to be cobined with the joint's 
		// inverse bind pose, it uses the offset from it to create the resulting transform

		// TODO : Rotation and scale.
		var invT = joint._inverseBindPose.translation.data;
		getInvT(joint, joints, invT);

		var translation = [];

		for (var i = 0; i < t.length; i+=3) {
			translation[i] = -invT[0] + t[i];
			translation[i+1] = -invT[1] + t[i+1];
			translation[i+2] = -invT[2] + t[i+2];
		}

		var channel = new JointChannel(
			joint._index,
			joint._name,
			times,
			r,
			translation,
			s,
			blendType
		);

		channels.push(channel);

		return channel
	}

	function setJointBindPose(joint, T, R) {
		
		var trans = joint._inverseBindPose;
		trans.setIdentity();
		
		if (T) {
			trans.translation.setDirect(T[0], T[1], T[2]);	
		}
		
		if (R) {
			trans.setRotationXYZ(R[0], R[1], R[2]);
		}

		var it = trans.invert();
		it.update();
		joint._inverseBindPose = it;
	}

	function createNewJoint(jointName, jointIndex, parentJoint, joints, bindPosition) {
		
		var joint = new Joint(jointName);
		joint._index = jointIndex;
		if (parentJoint) {
			joint._parentIndex = parentJoint._index;
		} else {
			joint._parentIndex = Joint.NO_PARENT;
		}

		if (bindPosition) {
			setJointBindPose(joint, bindPosition);
		}

		joints.push(joint);

		return joint;
	}

	function smoothWeights(d, bleedD, weightData, quadIndex) {
		var b = MathUtils.clamp( d / bleedD, 0, 1);
		var w = MathUtils.scurve3(b);
		weightData[quadIndex] = w;
		weightData[quadIndex + 1] = 1.0 - w;
	}

	function loopSetJoints(joint, vertIndexArray, jointData) {
		var quadIndex; 
		for (var i = 0; i < vertIndexArray.length; i++) {
			quadIndex = vertIndexArray[i] * 4; 
			jointData[quadIndex] = joint._index;
			jointData[quadIndex + 1] = joint._parentIndex;
		}
	}

	function addFoldingPaper(world) {

		var size = 1;

		var joints = [];

		// Create skeleton joint hierarchy
		var rootJoint = createNewJoint('RootJoint', 0, null, joints, [0, -0.5, 0]);

		var midJoint = createNewJoint('mid', 1, rootJoint, joints, [0, 0.0, 0]);
		
		var skeleton = new Skeleton('PaperSkeleton', joints);
		var skeletonPose = new SkeletonPose(skeleton);
		var animComp = new AnimationComponent(skeletonPose);
		
		var times = [0, 0.5, 1.2];
		var rots = [];
		var q1 = new Quaternion();
		var q2 = new Quaternion();
		q1.fromAngleNormalAxis(-0.05, new Vector3(1,0,0).normalize());
		q2.fromAngleNormalAxis(-MathUtils.HALF_PI, new Vector3(1,0,0).normalize());
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0,
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var animChannels = [];

		var rootChannel = createJointChannel(
			rootJoint, 
			joints, 
			times, 
			trans, 
			rots, 
			scales, 
			AbstractAnimationChannel.BLENDTYPES.QUINTIC ||'SCurve5',
			animChannels
		);

		rots = [];
		q2.fromAngleNormalAxis(-Math.PI * 0.98, new Vector3(1,0,0).normalize());
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q1.data);
		var midChannel = createJointChannel(
			midJoint,
			joints, 
			times, 
			trans, 
			rots, 
			scales, 
			AbstractAnimationChannel.BLENDTYPES.QUINTIC ||'SCurve5',
			animChannels
		);

		var clip = new AnimationClip('My animation Clip', animChannels);
		var clipSource = new ClipSource(clip);
		clipSource._clipInstance._loopCount = -1;  // -1 for looping infinetly
		clipSource.setTimeScale(1);
		var animState = new SteadyState('My animation state');
		animState.setClipSource(clipSource);
		var animLayer = animComp.layers[0];  // Default animation layer
		animLayer.setState('RootRotateState', animState);
		animLayer.setCurrentState(animState, true);
		
		var vertCount = 50;
		var bleedD = 0;
		var meshData = Surface.createTessellatedFlat(size, size, vertCount, vertCount);

		addSkeltonAttributeData(meshData, joints);

		var weightData = meshData.dataViews.WEIGHTS;
		for (var i = 0; i < weightData.length; i+=4) {
			weightData[i] = 1;
			weightData[i+1] = 0;
			weightData[i+2] = 0;
			weightData[i+3] = 0;
		}

		var midVerts = [];
		var positions = meshData.dataViews.POSITION;
		var posLen = positions.length;
		for (var i = 0; i < posLen; i+=3) {
			var x = positions[i];
			var y = positions[i+1];

			var vertIndex = i/3;
			var quadIndex = vertIndex * 4;

			if (y > 0) {
				midVerts.push(vertIndex);
				smoothWeights(y, bleedD, weightData, quadIndex);
			}

		}

		var jointData = meshData.dataViews.JOINTIDS;

		loopSetJoints(midJoint, midVerts, jointData);
		
		var material = new Material(ShaderLib.uber);
		material.uniforms.materialDiffuse = [0.4, 0.8, 0.4, 1];
		material.cullState.enabled = false;
		var surfaceEntity = world.createEntity(meshData, material);

		var scale = 8;
		surfaceEntity.transformComponent.setScale(scale, scale, scale);
		surfaceEntity.set(animComp);
		surfaceEntity.meshDataComponent.currentPose = surfaceEntity.animationComponent._skeletonPose;
		surfaceEntity.addToWorld();
		return surfaceEntity;
	}
	
	function init() {

		var goo = V.initGoo();
		goo._addDebugKeys();
		var world = goo.world;

		// The animationsystem calls the animation components, updating 
		// the animation data every frame.
		var animSystem = new AnimationSystem();
		animSystem.stop();
		world.setSystem(animSystem);

		var paperEntity = addFoldingPaper(world);

		var animT = 0;
		var tstep = 0.05;
		window.addEventListener('keydown', function(event) {
			switch (event.keyCode) {
				case 37:					
					animT -= tstep;
					break;
				case 39:
					animT += tstep;
					break;
				case 40:
					animT = 0;
			}

			// If the animstate is updated to equal maxtime, the 
			// animation loops to first keyframe
			animT = MathUtils.clamp(animT, 0, 0.999999);

			var animationComponent = paperEntity.animationComponent;
			var layer = animationComponent.layers[0];
			var animState = layer._currentState;
			var clipSource = animState._sourceTree;

			var maxTime = clipSource._clip._maxTime;

			animState.update(animT * maxTime);
			animationComponent.apply(paperEntity.transformComponent);
			animationComponent.postUpdate();
		});


		V.addLights();

		world.createEntity(new Camera(), [0, 1, 15]).addToWorld().lookAt([0, 0, 0]);

		V.process();
	}

	init();
});

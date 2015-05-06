require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/renderer/MeshData',
	'goo/geometrypack/Surface',

	'goo/animationpack/components/AnimationComponent',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/Skeleton',
	'goo/animationpack/Joint',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/animationpack/clip/JointChannel',
	'goo/animationpack/systems/AnimationSystem'

], function (
	V,
	Material,
	ShaderLib,
	Box,
	Vector3,
	Quaternion,
	MeshData,
	Surface,

	AnimationComponent,
	SkeletonPose,
	Skeleton,
	Joint,
	SteadyState,
	ClipSource,
	AnimationClip,
	JointChannel,
	AnimationSystem
) {
	'use strict';

	V.describe('Skeleton Animation Test');


	function addSkeltonAttributeData(meshData) {

		var skeletonMaps = MeshData.defaultMap([MeshData.JOINTIDS, MeshData.WEIGHTS]);
		meshData.attributeMap[MeshData.JOINTIDS] = skeletonMaps[MeshData.JOINTIDS];
		meshData.attributeMap[MeshData.WEIGHTS] = skeletonMaps[MeshData.WEIGHTS];
		// rebuildData generates dataviews on the new attributes.
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
		// These are probably used somewhere.
		meshData.weightsPerVertex = 4; // Default weights count
		meshData.type = MeshData.SKINMESH;
	}

	function addPaletteMap(meshData) {
		var jointData = meshData.dataViews.JOINTIDS;
		// Code stolen from meshdatahandler
		var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
		// Map skeleton joint index local joint index
		var localJointMap = [];

		var localIndex = 0;
		for (var idx = 0; idx < jointData.length; idx++) {
			var jointIndex = jointData[idx];
			if (localJointMap[jointIndex] === undefined) {
				// If vertex has joint index, add to localmap
				localJointMap[jointIndex] = localIndex++;
			}
			// Set vertex joint index to local index
			buffer.set([localJointMap[jointIndex]], idx);
		}
		// Make a reverse map from local joint to skeleton joint
		// We will use this later in animation shader code
		var localMap = [];
		for (var jointIndex = 0; jointIndex < localJointMap.length; jointIndex++) {
			var localIndex = localJointMap[jointIndex];
			if (localIndex !== null) {
				localMap[localIndex] = jointIndex;
			}
		}
		meshData.paletteMap = localMap;  // The palettemap is used in the animation shader code.
	}

	function addWeirdCube(world) {

		var j2 = new Joint('j2');
		j2._index = 0;
		j2._parentIndex = Joint.NO_PARENT;

		var j1 = new Joint('asdfsfd');
		j1._index = 1;
		j1._parentIndex = j2._index;

		var joints = [j2, j1];

		var skeleton = new Skeleton('My very own skeleton', joints);
		var skeletonPose = new SkeletonPose(skeleton);
		var animComp = new AnimationComponent(skeletonPose);

		var times = [0.0, 1.0, 2.0];

		var rots = [];
		var q1 = new Quaternion();
		var q2 = new Quaternion();
		q2.fromAngleNormalAxis(Math.PI, Vector3.UNIT_Y);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q1.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var rootChannel = new JointChannel(
			j1._index,
			j1._name,
			times,
			rots,
			trans,
			scales,
			'SCurve3'
			);

		var j2Channel = new JointChannel(
			j2._index,
			j2._name,
			times,
			[0,0,0,1,
			0,0,0,1,
			0,0,0,1,],
			[
			0,0,0,
			0,1,0,
			0,0,0],
			scales,
			'SCurve3');

		var animChannels = [rootChannel, j2Channel];
		var clip = new AnimationClip('My animation Clip', animChannels);
		var clipSource = new ClipSource(clip);
		clipSource._clipInstance._loopCount = -1;  // -1 for looping infinetly
		var animState = new SteadyState('My animation state');
		animState.setClipSource(clipSource);
		var animLayer = animComp.layers[0];  // Default animation layer
		animLayer.setState('RootRotateState', animState);
		animLayer.setCurrentState(animState, true);

		var meshData = new Box();
		// The Box does not create skeleton related attributes, doin' it manually
		addSkeltonAttributeData(meshData);

		var positions = meshData.dataViews.POSITION;
		var vertIndices = [];
		for (var i = 0; i < positions.length; i+=3) {
			var y = positions[i+1];
			if (y > 0) {
				vertIndices.push(i/3);
			}
		}

		var weightData = meshData.dataViews.WEIGHTS;
		for (var i = 0; i < weightData.length; i++) {
			weightData[i] = 1;
		}

		var jointData = meshData.dataViews.JOINTIDS;
		for (var i = 0; i < jointData.length; i++) {
			jointData[i] = 0;
		}

		for (var i = 0; i < vertIndices.length; i++) {
			jointData[vertIndices[i]*4] = 1;
		}

		addPaletteMap(meshData);

		// Ubershader contains the animation shader logic , plus any other feature.
		var boxEntity = world.createEntity(meshData, new Material(ShaderLib.uber));
		boxEntity.set(animComp);

		// The entity's meshdatacomponent needs the currentPose to be set to the SkeletonPose.
		boxEntity.meshDataComponent.currentPose = boxEntity.animationComponent._skeletonPose;
		boxEntity.addToWorld();
	}

	function createJointChannel(joint, times, t, r, s, blendType) {
		return new JointChannel(
			joint._index,
			joint._name,
			times,
			r,
			t,
			s,
			blendType
		);
	}

	function setJointBindPose(joint, T, R) {
		
		var trans = joint._inverseBindPose;
		trans.setIdentity();
		
		if (T) {
			trans.translation.setDirect(T[0], T[1], T[2]);	
		}
		
		if (R) {
			//trans.setRotationXYZ(0, 0, -Math.PI/4);	
		}

		var it = trans.invert();
		it.update();
		joint._inverseBindPose = it;
	}

	function createNewJoint (jointName, jointIndex, parentJoint) {
		
		var joint = new Joint(jointName);
		joint._index = jointIndex;
		if (parentJoint) {
			joint._parentIndex = parentJoint._index;
		} else {
			joint._parentIndex = Joint.NO_PARENT;
		}

		return joint;
	}

	function addFoldingPaper(world) {

		var joints = [];

		// Create skeleton joint hierarchy
		var rootJoint = createNewJoint('RootJoint', 0);
		joints.push(rootJoint);

		var leftSideJoint = createNewJoint('side.left', 1, rootJoint);
		joints.push(leftSideJoint);

		var offsetJoint = createNewJoint('corner.offset.left', 2, leftSideJoint);
		setJointBindPose(offsetJoint, [5, 5, 0]);
		joints.push(offsetJoint);

		var leftCornerJoint = createNewJoint('Corner.left', 3, offsetJoint);
		console.log(leftCornerJoint);
		setJointBindPose(leftCornerJoint, [5, 5, 0]);
		joints.push(leftCornerJoint);

		var skeleton = new Skeleton('PaperSkeleton', joints);
		var skeletonPose = new SkeletonPose(skeleton);
		var animComp = new AnimationComponent(skeletonPose);
		
		var times = [0.0, 3.0, 6.0];
		var rots = [];
		var q1 = new Quaternion();
		var q2 = new Quaternion();
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var rootChannel = createJointChannel(rootJoint, times, trans, rots, scales, 'Linear');

		rots = [];
		
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var leftChannel = createJointChannel(leftSideJoint, times, trans, rots, scales, 'SCurve5');

		var offsetChannel = createJointChannel(offsetJoint, times, trans, rots, scales, 'Linear');

		rots = [];
		q2.fromAngleNormalAxis(Math.PI * 0.5, new Vector3(0,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q1.data);
		var leftCornerChannel = createJointChannel(leftCornerJoint, times, trans, rots, scales, 'SCurve5');

		var animChannels = [rootChannel, leftChannel, offsetChannel, leftCornerChannel];
		var clip = new AnimationClip('My animation Clip', animChannels);
		var clipSource = new ClipSource(clip);
		clipSource._clipInstance._loopCount = -1;  // -1 for looping infinetly
		var animState = new SteadyState('My animation state');
		animState.setClipSource(clipSource);
		var animLayer = animComp.layers[0];  // Default animation layer
		animLayer.setState('RootRotateState', animState);
		animLayer.setCurrentState(animState, true);

		var size = 10;
		var vertCount = 100;
		var meshData = Surface.createTessellatedFlat(size, size, vertCount, vertCount);

		addSkeltonAttributeData(meshData);

		// Just map 1to1,
		meshData.paletteMap = [];
		for (var i =0; i < joints.length; i++) {
			meshData.paletteMap[i] = i;
		}
		

		var weightData = meshData.dataViews.WEIGHTS;
		for (var i = 0; i < weightData.length; i+=4) {
			weightData[i] = 1;
			weightData[i+1] = 0;
			weightData[i+2] = 0;
			weightData[i+3] = 0;
		}

		var leftVertIndices = [];
		var leftCornerVerts = [];
		var positions = meshData.dataViews.POSITION;
		for (var i = 0; i < positions.length; i+=3) {
			var x = positions[i];
			var y = positions[i+1];

			var vertIndex = i/3;

			if (x + y < 0) {
				leftVertIndices.push(vertIndex);
			}

			if (x + y < -8) {
				leftCornerVerts.push(vertIndex);
			}
		}

		var jointData = meshData.dataViews.JOINTIDS;
		for (var i = 0; i < leftCornerVerts.length; i++) {
			jointData[leftCornerVerts[i]*4] = leftCornerJoint._index;
		}

		/*
		for (var i = 0; i < jointData.length; i+=4) {
			jointData[i] = 1;
		}*/

		var material = new Material(ShaderLib.uber);
		material.cullState.enabled = false;
		var surfaceEntity = world.createEntity(meshData, material);
		surfaceEntity.set(animComp);
		surfaceEntity.meshDataComponent.currentPose = surfaceEntity.animationComponent._skeletonPose;
		surfaceEntity.addToWorld();
	}
	
	function init() {

		var goo = V.initGoo();
		var world = goo.world;

		// The animationsystem calls the animation components, updating 
		// the animation data every frame.
		var animSystem = new AnimationSystem();
		world.setSystem(animSystem);

		//addWeirdCube(world);

		addFoldingPaper(world);

		V.addLights();

		V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

		V.process();
	}

	init();
});

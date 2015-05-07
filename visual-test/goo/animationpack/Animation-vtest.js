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

	function createJointChannel(joint, joints, times, t, r, s, blendType) {

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

		console.log(joint._name, translation);

		return new JointChannel(
			joint._index,
			joint._name,
			times,
			r,
			translation,
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
			trans.setRotationXYZ(R[0], R[1], R[2]);
		}

		var it = trans.invert();
		it.update();
		console.log(it.translation.data);
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

		var size = 1;

		var joints = [];

		// Create skeleton joint hierarchy
		var rootJoint = createNewJoint('RootJoint', 0);
		joints.push(rootJoint);

		var topJoint = createNewJoint('top.first', 1, rootJoint);
		setJointBindPose(topJoint, [-0.5, 0, 0]);
		joints.push(topJoint);

		var botJoint = createNewJoint('bottom.first', 2, rootJoint);
		setJointBindPose(botJoint, [0.25, 0, 0]);
		joints.push(botJoint);

		var botLeft = createNewJoint('bottom.1.left', 3, rootJoint);
		setJointBindPose(botLeft, [0.125, 0, 0]);
		joints.push(botLeft);

		var botLeft2 = createNewJoint('bottom.2.left', 4, botLeft);
		setJointBindPose(botLeft2, [0.25, 0, 0]);
		joints.push(botLeft2);

		var botTipLeft = createNewJoint('bottom.tip.left', 5, botLeft);
		setJointBindPose(botTipLeft, [0.92, -0, 0]);
		joints.push(botTipLeft);

		var skeleton = new Skeleton('PaperSkeleton', joints);
		var skeletonPose = new SkeletonPose(skeleton);
		var animComp = new AnimationComponent(skeletonPose);
		
		var times = [0.0, 1.0, 2.0, 3.0, 4.0];
		var rots = [];
		var q1 = new Quaternion();
		var q2 = new Quaternion();
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0,
			0,0,0,
			0,0,0,
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var rootChannel = createJointChannel(rootJoint, joints, times, trans, rots, scales, 'Linear');

		rots = [];
		q2.fromAngleNormalAxis(Math.PI * 0.99, new Vector3(-1,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		var topchan = createJointChannel(topJoint, joints, times, trans, rots, scales, 'SCurve5');

		rots = [];
		q2.fromAngleNormalAxis(-Math.PI * 0.98, new Vector3(-1,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);

		var botchan = createJointChannel(botJoint, joints, times, trans, rots, scales, 'SCurve5');

		rots = [];
		q2.fromAngleNormalAxis(-Math.PI * 0.95, new Vector3(0,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0,
			0,0,0.02,
			0,0,0.02,
		];

		var botchanLeft = createJointChannel(botLeft, joints, times, trans, rots, scales, 'SCurve5');

		rots = [];
		q2.fromAngleNormalAxis(-Math.PI * 0.98, new Vector3(-1,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		Array.prototype.push.apply(rots, q2.data);
		var trans = [
			0,0,0,
			0,0,0,
			0,0,0,
			0,0,0,
			0,0,0,
		];
		var botchanLeft2 = createJointChannel(botLeft2, joints, times, trans, rots, scales, 'SCurve5');

		rots = [];
		q2.fromAngleNormalAxis(-Math.PI * 0.98, new Vector3(1,1,0).normalize());
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q1.data);
		Array.prototype.push.apply(rots, q2.data);
		var botchanTipLeft = createJointChannel(botTipLeft, joints, times, trans, rots, scales, 'SCurve5');
		
		var animChannels = [rootChannel, topchan, botchan, botchanLeft, botchanLeft2, botchanTipLeft];
		var clip = new AnimationClip('My animation Clip', animChannels);
		var clipSource = new ClipSource(clip);
		clipSource._clipInstance._loopCount = -1;  // -1 for looping infinetly
		var animState = new SteadyState('My animation state');
		animState.setClipSource(clipSource);
		var animLayer = animComp.layers[0];  // Default animation layer
		animLayer.setState('RootRotateState', animState);
		animLayer.setCurrentState(animState, true);

		
		var vertCount = 200;
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

		var topVerts = [];
		var botVerts = [];
		var botLeft2Verts = [];
		var botLeftVerts = [];
		var botTipLeftVerts = [];
		var positions = meshData.dataViews.POSITION;
		var posLen = positions.length;
		for (var i = 0; i < posLen; i+=3) {
			var x = positions[i];
			var y = positions[i+1];

			var vertIndex = i/3;

			if (x + y <= -0.5) {
				topVerts.push(vertIndex);
			}

			if (x + y >= 0.25) {
				if ( y < 0.125 ){
					botLeft2Verts.push(vertIndex);
				} else  {
					botVerts.push(vertIndex);
				}
			}

			if (x > 0.125 && y < 0.125) {
				botLeftVerts.push(vertIndex);
			}

			if (x - y > 0.92) {
				botTipLeftVerts.push(vertIndex);
			}
			
		}

		var jointData = meshData.dataViews.JOINTIDS;
		for (var i = 0; i < topVerts.length; i++) {
			jointData[topVerts[i]*4] = topJoint._index;
		}
		for (var i = 0; i < botVerts.length; i++) {
			jointData[botVerts[i]*4] = botJoint._index;
		}

		for (var i = 0; i < botLeftVerts.length; i++) {
			jointData[botLeftVerts[i]*4] = botLeft._index;
		}

		for (var i = 0; i < botLeft2Verts.length; i++) {
			jointData[botLeft2Verts[i]*4] = botLeft2._index;
		}

		for (var i = 0; i < botTipLeftVerts.length; i++) {
			jointData[botTipLeftVerts[i]*4] = botTipLeft._index;
		}
		
		var material = new Material(ShaderLib.uber);
		material.uniforms.materialDiffuse = [0.92, 0.1, 0.85, 1];
		material.cullState.enabled = false;
		var surfaceEntity = world.createEntity(meshData, material);
		surfaceEntity.transformComponent.setRotation(0, 0, -Math.PI * 0.75);

		var scale = 8;
		surfaceEntity.transformComponent.setScale(scale, scale, scale);
		surfaceEntity.set(animComp);
		surfaceEntity.meshDataComponent.currentPose = surfaceEntity.animationComponent._skeletonPose;
		surfaceEntity.addToWorld();
	}
	
	function init() {

		var goo = V.initGoo();
		goo._addDebugKeys();
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

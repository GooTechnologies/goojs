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
		meshData.paletteMap = [0,1];  // The palettemap is used in the animation shader code.
	}
	
	function init() {

		var j2 = new Joint('j2');
		j2._index = 0;
		j2._parentIndex = Joint.NO_PARENT;

		var j1 = new Joint('rootjoint');
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
			'Linear'
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
			0,0,0,
			0,0,0],
			scales,
			'Linear');

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

		var goo = V.initGoo();
		var world = goo.world;
		
		// The animationsystem calls the animation components, updating 
		// the animation data every frame.
		var animSystem = new AnimationSystem();
		world.setSystem(animSystem);

		// Ubershader contains the animation shader logic , plus any other feature.
		var boxEntity = world.createEntity(meshData, new Material(ShaderLib.uber));
		boxEntity.set(animComp);

		// The entity's meshdatacomponent needs the currentPose to be set to the SkeletonPose.
		boxEntity.meshDataComponent.currentPose = boxEntity.animationComponent._skeletonPose;
		boxEntity.addToWorld();

		V.addLights();

		V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

		V.process();
	}

	init();
});

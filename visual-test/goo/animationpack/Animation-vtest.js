require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/MeshData',

	'goo/animationpack/components/AnimationComponent',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/Skeleton',
	'goo/animationpack/Joint',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip'
], function (
	V,
	Material,
	ShaderLib,
	Box,
	Vector3,
	MeshData,

	AnimationComponent,
	SkeletonPose,
	Skeleton,
	Joint,
	SteadyState,
	ClipSource,
	AnimationClip
) {
	'use strict';

	V.describe('Skeleton Animation Test');

	var j1 = new Joint('rootjoint');
	j1._index = 0;
	var j2 = new Joint('j2');
	j2._index = 1;
	j2._parentIndex = 0;

	var joints = [j1, j2];

	var skeleton = new Skeleton('My very own skeleton', joints);
	var skeletonPose = new SkeletonPose(skeleton);
	var animComp = new AnimationComponent(skeletonPose);

	var animChannels = [];
	var clip = new AnimationClip('My animation Clip', animChannels);
	var clipSource = new ClipSource(clip);
	var animState = new SteadyState('My animation state');
	animState.setClipSource(clipSource);
	var animLayer = animComp.layers[0];  // Default animation layer

	
	var meshData = new Box();
	// The Box does not create skeleton related attributes, doin' it manually
	var skeletonMaps = MeshData.defaultMap([MeshData.JOINTIDS, MeshData.WEIGHTS]);
	meshData.attributeMap[MeshData.JOINTIDS] = skeletonMaps[MeshData.JOINTIDS];
	meshData.attributeMap[MeshData.WEIGHTS] = skeletonMaps[MeshData.WEIGHTS];
	// rebuildData generates dataviews on the new attributes.
	meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
	// These are probably used somewhere.
	meshData.weightsPerVertex = 4; // Default weights count
	meshData.type = MeshData.SKINMESH;

	console.log(meshData);

	var goo = V.initGoo();
	var world = goo.world;
	// Ubershader contains the animation shader logic , plus any other feature.
	var boxEntity = world.createEntity(meshData, new Material(ShaderLib.uber));
	boxEntity.set(animComp);

	boxEntity.addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
});

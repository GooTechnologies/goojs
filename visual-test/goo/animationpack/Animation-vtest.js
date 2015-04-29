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
	'goo/animationpack/Joint'
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
	Joint
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

	var goo = V.initGoo();

	var world = goo.world;
	// Ubershader contains the animation shader logic , plus any other feature.
	var meshData = new Box();

	meshData.weightsPerVertex = 4;
	meshData.type = MeshData.SKINMESH;
	meshData.attributeMap[MeshData.JOINTIDS] = MeshData.defaultMap([MeshData.JOINTIDS]);

	console.log(meshData);

	var boxEntity = world.createEntity(meshData, new Material(ShaderLib.uber));
	boxEntity.set(animComp);

	boxEntity.addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
});

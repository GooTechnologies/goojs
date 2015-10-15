require([
	'goo/util/MeshBuilder',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Cylinder',
	'goo/shapes/Box',
	'goo/renderer/MeshData',
	'lib/V'
], function (
	MeshBuilder,
	Material,
	ShaderLib,
	Vector3,
	Transform,
	Cylinder,
	Box,
	MeshData,
	V
	) {
	'use strict';

	V.describe('Create a single movie camera entity from different parts');

	var goo = V.initGoo();

	var meshBuilder = new MeshBuilder();
	var transform = new Transform();

	var cameraBox1 = new Cylinder(32, 0.6);
	var cameraBox2 = new Cylinder(32, 0.6);
	var cameraBox3 = new Box(0.3, 1, 1.6);
	var cameraBox4 = new Box(0.2, 0.15, 0.7);

	cameraBox4.applyFunction(MeshData.POSITION, function (vert) {
		return new Vector3(
			vert.x + vert.x / ((vert.z + 1.1) * 0.3),
			vert.y + vert.y / ((vert.z + 1.1) * 0.3),
			vert.z
		);
	});

	transform.translation.setDirect(0, 0.0, 0);
	transform.update();
	meshBuilder.addMeshData(cameraBox4, transform);

	transform.translation.setDirect(0, 0.0, 1.3);
	transform.update();
	meshBuilder.addMeshData(cameraBox3, transform);

	transform.scale.setDirect(1, 1, 0.5);
	transform.setRotationXYZ(0, Math.PI / 2, 0);

	transform.translation.setDirect(0, 1.2, 0.6);
	transform.update();
	meshBuilder.addMeshData(cameraBox1, transform);

	transform.translation.setDirect(0, 1.2, 2.0);
	transform.update();
	meshBuilder.addMeshData(cameraBox2, transform);

	var meshData = meshBuilder.build()[0];

	goo.world.createEntity( meshData, new Material(ShaderLib.simpleLit), function (entity) {
		entity.addRotation(0.012, 0.02, 0);
	}).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

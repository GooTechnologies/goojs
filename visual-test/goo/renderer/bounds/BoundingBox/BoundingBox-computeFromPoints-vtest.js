require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Vector3',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Sphere,
	MeshData,
	BoundingBox,
	Vector3,
	V
	) {
	'use strict';

	var goo = V.initGoo();

	var shapeMeshData = new Sphere();

	// shape and boundingBox material
	var material1 = new Material(ShaderLib.simpleColored, '');
	material1.uniforms.color = [0.3, 0.6, 0.9];
	var material2 = new Material(ShaderLib.simpleColored, '');
	material2.uniforms.color = [0.3, 0.9, 0.6];
	material2.wireframe = true;

	// wrap shapeMeshData in an entity
	goo.world.createEntity(shapeMeshData, material1).addToWorld();

	// bounding box
	var boundingBox = new BoundingBox();
	boundingBox.computeFromPoints(shapeMeshData.dataViews.POSITION);
	var xSize = boundingBox.xExtent * 2;
	var ySize = boundingBox.yExtent * 2;
	var zSize = boundingBox.zExtent * 2;
	var xCenter = boundingBox.center.data[0];
	var yCenter = boundingBox.center.data[1];
	var zCenter = boundingBox.center.data[2];

	var boxMeshData = new Box(xSize, ySize, zSize);
	goo.world.createEntity(boxMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();

	// camera
	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});

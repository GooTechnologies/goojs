
	'use strict';

	var gooRunner = V.initGoo();

	var shapeMeshData = new Sphere();

	// shape and boundingBox material
	var material1 = new Material(ShaderLib.simpleColored, '');
	material1.uniforms.color = [0.3, 0.6, 0.9];
	var material2 = new Material(ShaderLib.simpleColored, '');
	material2.uniforms.color = [0.3, 0.9, 0.6];
	material2.wireframe = true;

	// wrap shapeMeshData in an entity
	gooRunner.world.createEntity(shapeMeshData, material1).addToWorld();

	// bounding box
	var boundingBox = new BoundingBox();
	boundingBox.computeFromPoints(shapeMeshData.dataViews.POSITION);
	var xSize = boundingBox.xExtent * 2;
	var ySize = boundingBox.yExtent * 2;
	var zSize = boundingBox.zExtent * 2;
	var xCenter = boundingBox.center.x;
	var yCenter = boundingBox.center.y;
	var zCenter = boundingBox.center.z;

	var boxMeshData = new Box(xSize, ySize, zSize);
	gooRunner.world.createEntity(boxMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();

	// camera
	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});

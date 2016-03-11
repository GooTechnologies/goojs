
	goo.V.attachToGlobal();

	function addBoundingSphereToWorld(goo, boundingSphere) {
		var material2 = new Material(ShaderLib.simpleColored);
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		var radius = boundingSphere.radius;
		var xCenter = boundingSphere.center.x;
		var yCenter = boundingSphere.center.y;
		var zCenter = boundingSphere.center.z;

		var sphereMeshData = new Sphere(16, 16, radius);
		gooRunner.world.createEntity(sphereMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();
	}

	function addBoundingBoxToWorld(goo, boundingBox) {
		var material2 = new Material(ShaderLib.simpleColored);
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		var xSize = boundingBox.xExtent * 2;
		var ySize = boundingBox.yExtent * 2;
		var zSize = boundingBox.zExtent * 2;
		var xCenter = boundingBox.center.x;
		var yCenter = boundingBox.center.y;
		var zCenter = boundingBox.center.z;

		var boxMeshData = new Box(xSize, ySize, zSize);
		gooRunner.world.createEntity(boxMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();
	}

	var gooRunner = V.initGoo();

	var transform = new Transform();

	var shape1MeshData = new Quad();
	transform.translation.setDirect(2, 0, 0);
	transform.update();
	shape1MeshData.applyTransform(MeshData.POSITION, transform);
	var shape2MeshData = new Box();
	transform.translation.setDirect(0, 2, 0);
	transform.update();
	shape1MeshData.applyTransform(MeshData.POSITION, transform);

	// shapes and boundingBox material
	var material1 = new Material(ShaderLib.simpleColored);
	material1.uniforms.color = [0.3, 0.6, 0.9];

	// wrap shapeMeshData-s entities entity
	gooRunner.world.createEntity(shape1MeshData, material1).addToWorld();
	gooRunner.world.createEntity(shape2MeshData, material1).addToWorld();

	// bounding sphere for shape 1
	var boundingSphere1 = new BoundingSphere();
	boundingSphere1.computeFromPoints(shape1MeshData.dataViews.POSITION);

	// bounding box for shape 2
	var boundingBox2 = new BoundingBox();
	boundingBox2.computeFromPoints(shape2MeshData.dataViews.POSITION);

	// get mergedBoundingSphere
	var boundingSphere1_1 = new BoundingSphere();
	boundingSphere1_1.computeFromPoints(shape1MeshData.dataViews.POSITION);
	var mergedBoundingSphere = boundingSphere1_1.merge(boundingBox2);

	addBoundingSphereToWorld(goo, boundingSphere1);
	addBoundingBoxToWorld(goo, boundingBox2);
	addBoundingSphereToWorld(goo, mergedBoundingSphere);

	// camera
	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();

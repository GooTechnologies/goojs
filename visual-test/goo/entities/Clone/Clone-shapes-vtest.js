goo.V.attachToGlobal();

	V.describe('Cloning shapes');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();


	// create one of each
	var originalShapes = [Box, Cone, Cylinder, Disk, Grid, Quad, SimpleBox, Sphere, Torus].map(function (shapeConstructor, i) {
		var meshData = new shapeConstructor();
		world.createEntity(meshData, new Material(ShaderLib.simpleLit), [(i - 4) * 2, -3, 0]).addToWorld();
		return meshData;
	});

	// clone them all
	originalShapes.forEach(function (originalShape, i) {
		var clonedShape = originalShape.clone();
		world.createEntity(clonedShape, new Material(ShaderLib.simpleLit), [(i - 4) * 2,  3, 0]).addToWorld();
	});

	V.process();
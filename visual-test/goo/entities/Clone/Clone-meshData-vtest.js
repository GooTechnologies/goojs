goo.V.attachToGlobal();

	V.describe('Cloning mesh data');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	V.addLights();


	function buildCustomTriangle(verts) {
		var indices = [0, 1, 2];

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = [3];
		meshData.indexModes = ['Triangles'];

		return meshData;
	}

	var originalMeshData = buildCustomTriangle([0, -1, 0, 1, 0, 0, 0, 1, 0]);

	function noiseIt(meshData) {
		meshData.applyFunction(MeshData.POSITION, function (vertex) {
			vertex.scale(0.1 + V.rng.nextFloat());
			return vertex;
		});
		meshData.setAttributeDataUpdated(MeshData.POSITION);
	}

	var clonedMeshData1 = originalMeshData.clone();
	var clonedMeshData2 = originalMeshData.clone();

	noiseIt(clonedMeshData1);
	noiseIt(clonedMeshData2);

	world.createEntity(clonedMeshData1, new Material(ShaderLib.simpleLit), [-2, 0, 0]).addToWorld();
	world.createEntity(originalMeshData, new Material(ShaderLib.simpleLit), [ 0, 0, 0]).addToWorld();
	world.createEntity(clonedMeshData2, new Material(ShaderLib.simpleLit), [ 2, 0, 0]).addToWorld();


	V.process();
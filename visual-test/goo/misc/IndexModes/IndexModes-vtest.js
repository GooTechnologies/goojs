require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/MeshData',
	'goo/math/Vector3',
	'lib/V'
], function (
	Material,
	ShaderLib,
	MeshData,
	Vector3,
	V
	) {
	'use strict';

	V.describe('All possble index modes are featured in this scene: GL_POINTS, GL_LINES, GL_LINE_STRIP, GL_LINE_LOOP, GL_TRIANGLES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN');

	// points =======
	function buildPoints(verts) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.indexModes = ['Points'];
		return meshData;
	}

	// lines ========
	function buildLines(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['Lines'];
		return meshData;
	}

	function buildLineStrip(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['LineStrip'];
		return meshData;
	}

	function buildLineLoop(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['LineLoop'];
		return meshData;
	}

	// triangles ====
	function buildTriangles(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['Triangles'];
		return meshData;
	}

	function buildTriangleStrip(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['TriangleStrip'];
		return meshData;
	}

	function buildTriangleFan(verts, indices) {
		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);
		meshData.indexModes = ['TriangleFan'];
		return meshData;
	}
	//--------
	function wrapAndAdd(goo, meshData, x, y, z) {
		x = x || 0;
		y = y || 0;
		z = z || 0;
		var material = new Material(ShaderLib.simple);
		var entity = goo.world.createEntity(meshData, material);
		entity.transformComponent.transform.translation.setDirect(x, y, z);
		entity.addToWorld();
		console.log('Added', entity);
		return entity;
	}
	//--------
	var goo = V.initGoo();

	// points =======
	var pointsMesh = buildPoints([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0
	]);
	wrapAndAdd(goo, pointsMesh, -5, 5);
	// lines ========
	var linesMesh = buildLines([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0
	], [0, 1, 0, 2, 0, 3]);
	wrapAndAdd(goo, linesMesh, -5, 0);

	var lineStripMesh = buildLineStrip([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0
	], [0, 1, 2, 3]);
	wrapAndAdd(goo, lineStripMesh, 0, 0);

	var lineLoopMesh = buildLineLoop([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0
	], [0, 1, 2, 3]);
	wrapAndAdd(goo, lineLoopMesh, 5, 0);

	// triangles ====
	var trianglesMesh = buildTriangles([
		 0, 0, 0,
		 1, 0, 0,
		 1, 1, 0,
		 0, 2, 0,
		-1, 2, 0
	], [0, 1, 2, 0, 3, 4]);
	wrapAndAdd(goo, trianglesMesh, -5, -5);

	var triangleStripMesh = buildTriangleStrip([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0,
		2, 2, 0
	], [0, 1, 3, 2, 4]);
	wrapAndAdd(goo, triangleStripMesh, 0, -5);

	var triangleFanMesh = buildTriangleFan([
		0, 0, 0,
		1, 0, 0,
		1, 1, 0,
		0, 2, 0
	], [0, 1, 2, 3]);
	wrapAndAdd(goo, triangleFanMesh, 5, -5);

	// light
	V.addLights();

	// camera
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	V.process();
});

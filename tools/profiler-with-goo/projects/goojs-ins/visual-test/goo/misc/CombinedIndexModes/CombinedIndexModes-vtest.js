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

	V.describe([
		'A 7x7 matrix of shapes using all possible combinations of index modes.',
		'From left to right, top to bottom: GL_POINTS, GL_LINES, GL_LINE_STRIP, GL_LINE_LOOP, GL_TRIANGLES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN'
	].join('\n'));

	function buildCombined(verts1, indices1, indexMode1, verts2, indices2, indexMode2) {
		var nVerts1 = verts1.length / 3;
		var translatedVerts1 = verts1.map(function(e, i) { return e - (i % 3 === 0 ? 1 : 0); });
		var translatedVerts2 = verts2.map(function(e, i) { return e + (i % 3 === 0 ? 1 : 0); });
		var verts = translatedVerts1.concat(translatedVerts2);
		var indexLength1 = indices1.length;
		var indexLength2 = indices2.length;
		var shiftedIndices2 = indices2.map(function(e) { return e + nVerts1; });
		var indices = indices1.concat(shiftedIndices2);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);

		if(indices.length > 0) {
			meshData.getIndexBuffer().set(indices);
		}

		meshData.indexLengths = [indexLength1, indexLength2];
		meshData.indexModes = [indexMode1, indexMode2];

		return meshData;
	}
	//--------
	function wrapAndAdd(goo, meshData, x, y, z) {
		x = x || 0;
		y = y || 0;
		z = z || 0;
		var material = new Material(ShaderLib.simple);
		var entity = goo.world.createEntity(meshData, material);
		entity.transformComponent.transform.translation.set(x, y, z);
		entity.addToWorld();
		console.log('Added', entity);
		return entity;
	}
	//--------
	var goo = V.initGoo();

	var modes = [
		{ v: [0, 0, 0, 1, 0, 0,	1, 1, 0, 0, 2, 0], i: [], m: 'Points'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0], i: [0, 1, 0, 2, 0, 3], m: 'Lines'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0], i: [0, 1, 2, 3], m: 'LineStrip'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0], i: [0, 1, 2, 3], m: 'LineLoop'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0, -1, 2, 0], i: [0, 1, 2, 0, 3, 4], m: 'Triangles'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0, 2, 2, 0], i: [0, 1, 3, 2, 4], m: 'TriangleStrip'},
		{ v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0, -0.5, 1, 0], i: [0, 1, 2, 3, 4], m: 'TriangleFan'}];

	// build a grid of all possible 7x7 combinations
	for (var i = 0; i < modes.length; i++) {
		for (var j = 0; j < modes.length; j++) {
			var mode1 = modes[i];
			var mode2 = modes[j];
			var combinedMesh = buildCombined(mode1.v, mode1.i, mode1.m, mode2.v, mode2.i, mode2.m);
			wrapAndAdd(goo, combinedMesh, (i - modes.length/2) * 8, -(j - modes.length/2) * 3);
		}
	}

	// light
	V.addLights();

	// camera
	V.addOrbitCamera(new Vector3(35, Math.PI / 2, 0));

	V.process();
});

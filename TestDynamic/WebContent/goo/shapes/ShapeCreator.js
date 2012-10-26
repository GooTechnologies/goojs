define(['goo/renderer/MeshData', 'goo/entities/EntityUtils'], function(MeshData, EntityUtils) {
	"use strict";

	function ShapeCreator() {
	}

	ShapeCreator.createBoxEntity = function(world, width, height, length) {
		var meshData = ShapeCreator.createBoxMeshData(width, height, length);

		var entity = EntityUtils.createTypicalEntity(world, meshData);

		return entity;
	};

	ShapeCreator.createBoxMeshData = function(width, height, length) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);

		var meshData = new MeshData(attributeMap, 24, 36);

		var verts = [//
		-width, -height, -length, //
		width, -height, -length, //
		width, height, -length, //
		-width, height, -length, //
		width, -height, length, //
		-width, -height, length, //
		width, height, length, //
		-width, height, length, //
		];

		var vertices = [];

		function fillV(fillIndices) {
			for ( var i = 0; i < fillIndices.length; i++) {
				var index = fillIndices[i] * 3;
				vertices.push(verts[index]);
				vertices.push(verts[index + 1]);
				vertices.push(verts[index + 2]);
			}
		}

		fillV([//
		0, 1, 2, 3,//
		1, 4, 6, 2,//
		4, 5, 7, 6,//
		5, 0, 3, 7,//
		2, 6, 7, 3,//
		0, 5, 4, 1,//
		]);

		meshData.getAttributeBuffer(MeshData.POSITION).set(vertices);

		var norms = [//
		0, 0, -1,//
		1, 0, 0,//
		0, 0, 1,//
		-1, 0, 0,//
		0, 1, 0,//
		0, -1, 0,//
		];

		var normals = [];

		function fillN() {
			for ( var i = 0; i < norms.length / 3; i++) {
				for ( var j = 0; j < 4; j++) {
					var index = i * 3;
					normals.push(norms[index]);
					normals.push(norms[index + 1]);
					normals.push(norms[index + 2]);
				}
			}
		}
		fillN();

		meshData.getAttributeBuffer(MeshData.NORMAL).set(normals);

		var tex = [];

		for ( var i = 0; i < 6; i++) {
			tex.push(1);
			tex.push(0);

			tex.push(0);
			tex.push(0);

			tex.push(0);
			tex.push(1);

			tex.push(1);
			tex.push(1);
		}

		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		meshData.getIndexBuffer().set(
			[2, 1, 0, 3, 2, 0, 6, 5, 4, 7, 6, 4, 10, 9, 8, 11, 10, 8, 14, 13, 12, 15, 14, 12, 18, 17, 16, 19, 18, 16,
					22, 21, 20, 23, 22, 20]);

		return meshData;
	};

	return ShapeCreator;
});
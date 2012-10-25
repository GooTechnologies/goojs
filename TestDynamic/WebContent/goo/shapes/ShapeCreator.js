define(['goo/renderer/MeshData'], function(MeshData) {
	"use strict";

	function ShapeCreator() {
	}

	ShapeCreator.createBox = function(width, height, length) {
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

		function fill(fillIndices) {
			for ( var i = 0; i < fillIndices.length; i++) {
				var index = fillIndices[i] * 3;
				vertices.push(verts[index]);
				vertices.push(verts[index + 1]);
				vertices.push(verts[index + 2]);
			}
		}

		fill([//
		0, 1, 2, 3,//
		1, 4, 6, 2,//
		4, 5, 7, 6,//
		5, 0, 3, 7,//
		2, 6, 7, 3,//
		0, 5, 4, 1,//
		]);

		meshData.getAttributeBuffer(MeshData.POSITION).set(vertices);
		// meshData.getAttributeBuffer(MeshData.NORMAL).set([0, 0, 0, 1, 1, 1, 1, 0]);
		// meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([0, 0, 0, 1, 1, 1, 1, 0]);

		meshData.getIndexBuffer().set(
			[2, 1, 0, 3, 2, 0, 6, 5, 4, 7, 6, 4, 10, 9, 8, 11, 10, 8, 14, 13, 12, 15, 14, 12, 18, 17, 16, 19, 18, 16,
					22, 21, 20, 23, 22, 20]);

		return meshData;
	};

	return ShapeCreator;
});
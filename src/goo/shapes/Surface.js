define(['goo/renderer/MeshData'],
	/** @lends */
	function (MeshData) {
	"use strict";

	/**
	 * @class A grid-like surface shape
	 * @param {number[]} [verts] The vertices data array
	 * @param {number} [verticesPerLine] The number of vertices
	 */
	function Surface(verts, vertsPerLine) {
		this.verts = verts;
		this.vertsPerLine = vertsPerLine;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;
		MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);

		this.rebuild();
	}

	Surface.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data
	 * @returns {Surface} Self for chaining
	 */
	Surface.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var indices = [];
		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;

		for (var i = 0; i < nLines - 1; i++) {
			for (var j = 0; j < this.vertsPerLine - 1; j++) {
				var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
				var downRight = (i + 1) * this.vertsPerLine + (j + 1);
				var upRight = (i + 0) * this.vertsPerLine + (j + 1);

				indices.push(upLeft, upRight, downLeft, downLeft, upRight, downRight);
			}
		}

		this.getIndexBuffer().set(indices);

		return this;
	};

	return Surface;
});
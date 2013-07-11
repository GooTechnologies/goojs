define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],
	/** @lends */
	function (
		MeshData,
		MathUtils) {
	"use strict";

	/**
	 * @class A grid-like surface shape
	 * @param {number[]} [verts] The vertices data array
	 * @param {number} [verticesPerLine] The number of vertices
	 */
	function Surface(verts, vertsPerLine, verticallyClosed) {
		this.verts = verts;
		this.vertsPerLine = vertsPerLine;
		this.verticallyClosed = !!verticallyClosed;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);

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

		var norms = [];
		var normals = [];

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;

		for (var i = 0; i < nLines - 1; i++) {
			for (var j = 0; j < this.vertsPerLine - 1; j++) {
				var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
				var downRight = (i + 1) * this.vertsPerLine + (j + 1);
				var upRight = (i + 0) * this.vertsPerLine + (j + 1);

				indices.push(upLeft, downLeft, upRight, upRight, downLeft, downRight);

				normals = MathUtils.getTriangleNormals(
					this.verts[upLeft * 3 + 0],
					this.verts[upLeft * 3 + 1],
					this.verts[upLeft * 3 + 2],

					this.verts[downLeft * 3 + 0],
					this.verts[downLeft * 3 + 1],
					this.verts[downLeft * 3 + 2],

					this.verts[upRight * 3 + 0],
					this.verts[upRight * 3 + 1],
					this.verts[upRight * 3 + 2]);

				norms.push(normals[0], normals[1], normals[2]);
			}

			if(this.verticallyClosed) {
				var upLeft = (i + 0) * this.vertsPerLine + (0 + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (0 + 0);
				var upRight = (i + 0) * this.vertsPerLine + (0 + 1);

				normals = MathUtils.getTriangleNormals(
					this.verts[upLeft * 3 + 0],
					this.verts[upLeft * 3 + 1],
					this.verts[upLeft * 3 + 2],

					this.verts[downLeft * 3 + 0],
					this.verts[downLeft * 3 + 1],
					this.verts[downLeft * 3 + 2],

					this.verts[upRight * 3 + 0],
					this.verts[upRight * 3 + 1],
					this.verts[upRight * 3 + 2]);

				norms.push(normals[0], normals[1], normals[2]);
			}
			else {
				norms.push(normals[0], normals[1], normals[2]);
			}
		}

		i--;
		for (var j = 0; j < this.vertsPerLine - 1; j++) {
			var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
			var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
			var upRight = (i + 0) * this.vertsPerLine + (j + 1);

			normals = MathUtils.getTriangleNormals(
				this.verts[upLeft * 3 + 0],
				this.verts[upLeft * 3 + 1],
				this.verts[upLeft * 3 + 2],

				this.verts[downLeft * 3 + 0],
				this.verts[downLeft * 3 + 1],
				this.verts[downLeft * 3 + 2],

				this.verts[upRight * 3 + 0],
				this.verts[upRight * 3 + 1],
				this.verts[upRight * 3 + 2]);

			norms.push(normals[0], normals[1], normals[2]);
		}

		norms.push(normals[0], normals[1], normals[2]);

		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getIndexBuffer().set(indices);
		return this;
	};

	return Surface;
});
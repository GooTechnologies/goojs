define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],

	function (
		MeshData,
		MathUtils) {
	'use strict';

	/**
	 * A grid-like surface shape
	 * @param {Array<number>} verts The vertices data array
	 * @param {number} [verticesPerLine=2] The number of vertices
	 */
	function Surface(verts, vertsPerLine, verticallyClosed) {
		this.verts = verts;
		this.vertsPerLine = vertsPerLine || 2;
		this.verticallyClosed = !!verticallyClosed;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;
		MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);

		this.rebuild();
	}

	Surface.prototype = Object.create(MeshData.prototype);
	Surface.prototype.constructor = Surface;

	/**
	 * Builds or rebuilds the mesh data
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

				normals = MathUtils.getTriangleNormal(
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

				normals = MathUtils.getTriangleNormal(
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

			normals = MathUtils.getTriangleNormal(
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

		// compute texture coordinates
		var tex = [];
		var bounds = getBounds(this.verts);
		var extentX = bounds.maxX - bounds.minX;
		var extentY = bounds.maxY - bounds.minY;

		for (var i = 0; i < this.verts.length; i += 3) {
			var x = (this.verts[i + 0] - bounds.minX) / extentX;
			var y = (this.verts[i + 2] - bounds.minY) / extentY;
			tex.push(x, y);
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		return this;
	};

	function getBounds(verts) {
		var minX = verts[0];
		var maxX = verts[0];
		var minY = verts[2];
		var maxY = verts[2];

		for (var i = 3; i < verts.length; i += 3) {
			minX = minX < verts[i + 0] ? minX : verts[i + 0];
			maxX = maxX > verts[i + 0] ? maxX : verts[i + 0];
			minY = minY < verts[i + 2] ? minY : verts[i + 2];
			maxY = maxY > verts[i + 2] ? maxY : verts[i + 2];
		}

		return {
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY
		};
	}

	/**
	 * Create a Surface from a supplied height map in the form of a matrix
	 * @param {Array<number>} [heightMap] The height map
	 * @param {number} [xScale=1]
	 * @param {number} [yScale=1]
	 * @param {number} [zScale=1]
	 * @returns {Surface} The created surface
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/HeightMap-vtest.html Working example
	 */
	Surface.createFromHeightMap = function (heightMap, xScale, yScale, zScale) {
		xScale = xScale || 1;
		yScale = yScale || 1;
        zScale = zScale || 1;

		var verts = [];
		for (var z = 0; z < heightMap.length; z++) {
			for (var x = 0; x < heightMap[z].length; x++) {
				verts.push(
					x * xScale,
					heightMap[z][x] * yScale,
					z * zScale
				);
			}
		}
		return new Surface(verts, heightMap[0].length);
	};

	/**
	 * Create a tessellated Surface typically useful for a waterplane to reduce z-fighting
	 * @param {number} xSize x axis size in units
	 * @param {number} zSize z axis size in numbers
	 * @param {number} xCount x axis vertex count
	 * @param {number} zCount z axis vertex count
	 * @returns {Surface} The surface mesh
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/HeightMap-vtest.html Working example
	 */
	Surface.createTessellatedFlat = function (xSize, zSize, xCount, zCount) {
		var verts = [];
		for (var z = 0; z < zCount; z++) {
			for (var x = 0; x < xCount; x++) {
				verts.push(
					(x * xSize / xCount) - xSize * 0.5,
					0,
					(z * zSize / zCount) - zSize * 0.5
				);
			}
		}
		var surface = new Surface(verts, xCount);
		return surface;
	};

	return Surface;
});
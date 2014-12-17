define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],

	function (
		MeshData,
		MathUtils) {
	'use strict';

	/**
	 * A grid-like surface shape
	 * @param {number[]} verts The vertices data array
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
		var minY = verts[1];
		var maxY = verts[1];

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
	 * @param {number[]} [heightMap] The height map
	 * @param {number} [xScale=1]
	 * @param {number} [yScale=1]
	 * @returns {Surface} The created surface
	 * @example
	 * <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/HeightMap-vtest.html Working example}</caption>
	 */
	Surface.createFromHeightMap = function (heightMap, xScale, yScale, zScale) {
		xScale = xScale || 1;
		yScale = yScale || 1;
        zScale = zScale || 1;

		var verts = [];
		for (var i = 0; i < heightMap.length; i++) {
			for (var j = 0; j < heightMap[i].length; j++) {
				verts.push(i * xScale, heightMap[i][j]*yScale, j * zScale);
			}
		}
		verts.reverse();

		return new Surface(verts, heightMap[0].length);
	};

	/**
	 * Create a tessellated Surface typically useful for a waterplane to reduce z-fighting
	 * @param {number} xSize x axis size in units
	 * @param {number} ySize y axis size in numbers
	 * @param {number} xCount x axis vertex count
	 * @param {number} yCount y axis vertex count
	 * @returns {Surface} The surface mesh
	 */
	Surface.createTessellatedFlat = function (xSize, ySize, xCount, yCount) {
		var verts = [];
		for (var i = 0; i < xCount; i++) {
			for (var j = 0; j < yCount; j++) {
				verts.push((i * xSize / xCount)-xSize*0.5, (j*ySize/yCount) -ySize*0.5, 0);
			}
		}
		var surface = new Surface(verts, xCount);
		return surface;
	};

	return Surface;
});
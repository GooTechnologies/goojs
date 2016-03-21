var MeshData = require('../../renderer/MeshData');
var MathUtils = require('../../math/MathUtils');

/**
 * A grid-like surface shape
 * @param {array} heightMatrix The height data by x and z axis.
 * @param {number} xWidth x axis size in units
 * @param {number} yHeight y axis size in units
 * @param {number} zWidth z axis size in units
 */
function TerrainSurface(heightMatrix, xWidth, yHeight, zWidth) {
    var verts = [];
    for (var i = 0; i < heightMatrix.length; i++) {
        for (var j = 0; j < heightMatrix[i].length; j++) {
            verts.push(i * xWidth / (heightMatrix.length-1), heightMatrix[i][j]*yHeight, j * zWidth / (heightMatrix.length-1));
        }
    }
	this.verts = verts;
	this.vertsPerLine = heightMatrix[0].length;

	var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);

	var nVerts = this.verts.length / 3;
	var nLines = nVerts / this.vertsPerLine;
	MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);

	this.rebuild();
}

TerrainSurface.prototype = Object.create(MeshData.prototype);

/**
 * Builds or rebuilds the mesh data
 * @returns {Surface} Self for chaining
 */
TerrainSurface.prototype.rebuild = function () {
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

			indices.push(downLeft, upLeft, upRight, downLeft, upRight, downRight);

			normals = MathUtils.getTriangleNormal(
				this.verts[upLeft * 3 + 0],
				this.verts[upLeft * 3 + 1],
				this.verts[upLeft * 3 + 2],

                this.verts[upRight * 3 + 0],
                this.verts[upRight * 3 + 1],
                this.verts[upRight * 3 + 2],

				this.verts[downLeft * 3 + 0],
				this.verts[downLeft * 3 + 1],
				this.verts[downLeft * 3 + 2]


            );

			norms.push(normals[0], normals[1], normals[2]);
		}
		norms.push(normals[0], normals[1], normals[2]);
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

            this.verts[upRight * 3 + 0],
            this.verts[upRight * 3 + 1],
            this.verts[upRight * 3 + 2],

			this.verts[downLeft * 3 + 0],
			this.verts[downLeft * 3 + 1],
			this.verts[downLeft * 3 + 2]
        );


		norms.push(normals[0], normals[1], normals[2]);
	}

	norms.push(normals[0], normals[1], normals[2]);

	this.getAttributeBuffer(MeshData.NORMAL).set(norms);
	this.getIndexBuffer().set(indices);

	// compute texture coordinates
	var tex = [];

    var maxX = this.verts[this.verts.length-3];
    var maxZ = this.verts[this.verts.length-1];
	for (var i = 0; i < this.verts.length; i += 3) {
		var x = (this.verts[i + 0]) / maxX;
		var z = (this.verts[i + 2]) / maxZ;
		tex.push(x, z);
	}

	this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

	return this;
};

module.exports = TerrainSurface;

import MeshData = require('../renderer/MeshData');
import ObjectUtils = require('../util/ObjectUtils');

/**
 * Meshdata for a grid; useful for displaying tiles
 * @extends MeshData
 * @param matrix
 * @param textureUnitsPerLine
 */
class TextureGrid extends MeshData {
	matrix: Array<Array<number>>;
	textureUnitsPerLine: number;

	constructor(matrix, textureUnitsPerLine) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var nCells = countCells(matrix);
		super(attributeMap, nCells * 4, nCells * 6);

		this.matrix = matrix;
		this.textureUnitsPerLine = textureUnitsPerLine || 8;

		this.rebuild();
	}

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {TextureGrid} Self for chaining.
	 */
	rebuild() {
		var verts = [];
		var norms = [];
		var indices = [];
		var tex = [];

		var indexCounter = 0;
		var halfHeight = this.matrix.length / 2;
		for (var i = 0; i < this.matrix.length; i++) {
			var halfWidth = this.matrix[i].length / 2;
			for (var j = 0; j < this.matrix[i].length; j++) {
				verts.push(
					j - halfWidth, -i - 1 + halfHeight, 0,
					j - halfWidth, -i + halfHeight, 0,
					j + 1 - halfWidth, -i + halfHeight, 0,
					j + 1 - halfWidth, -i - 1 + halfHeight, 0
				);

				norms.push(
					0, 0, 1,
					0, 0, 1,
					0, 0, 1,
					0, 0, 1
				);

				var texX = (this.matrix[i][j] % this.textureUnitsPerLine) / this.textureUnitsPerLine;
				var texY = Math.floor(this.matrix[i][j] / this.textureUnitsPerLine) / this.textureUnitsPerLine;
				texY = 1 - texY;

				tex.push(
					texX, texY - 1 / this.textureUnitsPerLine,
					texX, texY,
					texX + 1 / this.textureUnitsPerLine, texY,
					texX + 1 / this.textureUnitsPerLine, texY - 1 / this.textureUnitsPerLine
				);

				indices.push(
					indexCounter + 3, indexCounter + 1, indexCounter + 0,
					indexCounter + 2, indexCounter + 1, indexCounter + 3
				);

				indexCounter += 4;
			}
		}

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		this.getIndexBuffer().set(indices);

		return this;
	};

	/**
	 * Returns a clone of this texture grid
	 * @returns {TextureGrid}
	 */
	clone() {
		return new TextureGrid(this.matrix, this.textureUnitsPerLine);
	};

	static fromString = function (str) {
		return new TextureGrid(stringToMatrix(str), 16);
	};
}

function countCells(matrix) {
	var count = 0;
	for (var i = 0; i < matrix.length; i++) {
		count += matrix[i].length;
	}
	return count;
}

function stringToMatrix(str) {
	var matrix = [];
	var lineAr = str.split('\n');
	lineAr.forEach(function (line) {
		var charAr = line.split('');
		var matrixLine = charAr.map(function (ch) {
			return ch.charCodeAt(0);
		});
		matrix.push(matrixLine);
	});
	return matrix;
}

export = TextureGrid;

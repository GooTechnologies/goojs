'use strict';

/**
 *
 * @param parameters
 * @constructor
 */
function OccludeeTriangleData (parameters) {
	var numberOfPositions = parameters.numberOfPositions;
	var numberOfIndices = parameters.numberOfIndices;
	/*
	 Initialize the index count to zero. This will be filled up after hand. The only indices wanted are the
	 ones which create front facing triangles.
	 */
	this.indexCount = 0;

	var vertBytes = numberOfPositions * Float32Array.BYTES_PER_ELEMENT;
	/*
	 Using 8bit unsigned integers implies a maximum of 256 vertices. This will most likely be the case for
	 the low detailed geometries.
	 */
	var indexBytes = numberOfIndices * Uint8Array.BYTES_PER_ELEMENT;

	this._dataBuffer = new ArrayBuffer(vertBytes + indexBytes);
	this.positions = new Float32Array(this._dataBuffer, 0, numberOfPositions);
	this.indices = new Uint8Array(this._dataBuffer, vertBytes, numberOfIndices);
}

/**
 * Adds 3 indices to the index array.
 * @param {Uint8Array} triangleIndices
 */
OccludeeTriangleData.prototype.addIndices = function (triangleIndices) {
	var index = this.indexCount;
	this.indices[index] = triangleIndices[0];
	index++;
	this.indices[index] = triangleIndices[1];
	index++;
	this.indices[index] = triangleIndices[2];
	index++;
	this.indexCount = index;
};

/**
 * Empties the data.
 */
OccludeeTriangleData.prototype.clear = function () {
	this.indexCount = 0;
};

module.exports = OccludeeTriangleData;

/**
 * Container class, which holds the data needed to render triangles.
 * @param parameters
 * @constructor
 */
function OccluderTriangleData (parameters) {
	var vertCount = parameters.vertCount;
	var indexCount = parameters.indexCount;

	/*
		The position array will contain 4 values per vertex. (x, y, z, w).

		The maximum amount of extra vertices are 2 per triangle, thus 2*4 extra positions per triangle

		The maximum amount of extra indices are 3 per triangle. (The triangle can be split up in two triangles)
		This assuming that all triangles are front facing, which probably isn't the case.
	*/
	var triangleCount = indexCount / 3;
	var originalCount = vertCount * 4;
	var compensatedPositionCount = originalCount + triangleCount * 8;
	var compensatedIndexCount = indexCount * 2; // + triangleCount * 3;

	/*
		Initialize the number of positions to the known original. Since it will be initialized to the copied and
		transformed values anyway.

		This number gives the next index in the array to write to.
	*/
	this.posCount = 0;

	/*
		Storing the highest possible vertex index to acess. This value is set externally to correspond to the
		current entity's number of indices.
	*/
	this.largestIndex = -1;
	/*
		Initialize the index count to zero. This will be filled up after hand. The only indices wanted are the
		ones which create front facing triangles.
	*/
	this.indexCount = 0;

	var vertBytes = compensatedPositionCount * Float32Array.BYTES_PER_ELEMENT;
	/*
		Using 8bit unsigned integers implies a maximum of 256 vertices. This will most likely be the case for
		the low detailed occluder geometries.
	*/
	var indexBytes = compensatedIndexCount * Uint8Array.BYTES_PER_ELEMENT;

	this._dataBuffer = new ArrayBuffer(vertBytes + indexBytes);
	this.positions = new Float32Array(this._dataBuffer, 0, compensatedPositionCount);
	this.indices = new Uint8Array(this._dataBuffer, vertBytes, compensatedIndexCount);
}

/**
 * Adds the array of vertex data to the position array and returns the new vertex's index to the position.
 * @param {Float32Array} array [x, y, z, w]
 * @returns {number} the added position's vertex index
 */
OccluderTriangleData.prototype.addVertex = function (array) {
	var writeIndex = this.posCount;
	this.positions[writeIndex] = array[0];
	writeIndex++;
	this.positions[writeIndex] = array[1];
	writeIndex++;
	this.positions[writeIndex] = array[2];
	writeIndex++;
	this.positions[writeIndex] = array[3];
	writeIndex++;
	// Set the poscount to point at the next free position in the array to write to.
	this.posCount = writeIndex;
	// Add one to the largest index, since a new vertex has been added. The returned index is used to access the
	// correct position in the position array.
	this.largestIndex++;
	return this.largestIndex;
};

/**
* Sets the counters to the correct values to correspond to the positions written into the array.
 * @param {number} positionCount The number of position values which have been written to the position array.
*/
OccluderTriangleData.prototype.setCountersToNewEntity = function (positionCount) {
	this.indexCount = 0;
	var vertCount = positionCount / 3;
	// Set the position counter to point at the next empty position to write to.
	this.posCount = vertCount * 4;
	// Set the largest index , zero based list.
	this.largestIndex = vertCount - 1;
};

/**
 * Adds 3 indices to the index array.
 * @param {Uint8Array} triangleIndices
 */
OccluderTriangleData.prototype.addIndices = function (triangleIndices) {
	var writeIndex = this.indexCount;
	this.indices[writeIndex] = triangleIndices[0];
	writeIndex++;
	this.indices[writeIndex] = triangleIndices[1];
	writeIndex++;
	this.indices[writeIndex] = triangleIndices[2];
	writeIndex++;
	this.indexCount = writeIndex;
};

module.exports = OccluderTriangleData;
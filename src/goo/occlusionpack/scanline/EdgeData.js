/**
 *
 * @constructor
 */
function EdgeData() {
	var integerElements = 2;
	var floatElements = 8;
	var integerBytes = integerElements * Int16Array.BYTES_PER_ELEMENT;
	var floatBytes = floatElements * Float32Array.BYTES_PER_ELEMENT;

	this._dataBuffer = new ArrayBuffer(integerBytes + floatBytes);
	this.floatData = new Float32Array(this._dataBuffer, 0, floatElements);
	this.integerData = new Int16Array(this._dataBuffer, floatBytes, integerElements);
}

/**
 * Sets the values in the edgeData.
 * @param dataArray
 */
EdgeData.prototype.setData = function (dataArray) {
	this.integerData[0] = dataArray[0];
	this.integerData[1] = dataArray[1];

	this.floatData[0] = dataArray[2];
	this.floatData[1] = dataArray[3];
	this.floatData[2] = dataArray[4];
	this.floatData[3] = dataArray[5];
	this.floatData[4] = dataArray[6];
	this.floatData[5] = dataArray[7];
	this.floatData[6] = dataArray[8];
	this.floatData[7] = dataArray[9];
};

EdgeData.prototype.getStartLine = function () {
	return this.integerData[0];
};

EdgeData.prototype.getStopLine = function () {
	return this.integerData[1];
};

EdgeData.prototype.getLongX = function () {
	return this.floatData[0];
};

EdgeData.prototype.setLongX = function (value) {
	this.floatData[0] = value;
};

EdgeData.prototype.getShortX = function () {
	return this.floatData[1];
};

EdgeData.prototype.setShortX = function (value) {
	this.floatData[1] = value;
};

EdgeData.prototype.getLongZ = function () {
	return this.floatData[2];
};

EdgeData.prototype.getShortZ = function () {
	return this.floatData[3];
};

EdgeData.prototype.getLongXIncrement = function () {
	return this.floatData[4];
};

EdgeData.prototype.getShortXIncrement = function () {
	return this.floatData[5];
};

EdgeData.prototype.getLongZIncrement = function () {
	return this.floatData[6];
};

EdgeData.prototype.getShortZIncrement = function () {
	return this.floatData[7];
};

module.exports = EdgeData;
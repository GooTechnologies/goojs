define([],
/** @lends EdgeRecord */
function () {


	/*
		An edge record contains three values,
		 -lowest x-coordinate 
		 -highest y-coordinate 
		 -delta x
	*/
	function EdgeRecord() {

		// 16bits integers for the pixelcoordinates x and y
		var coordBytes = 2 * Uint16Array.BYTES_PER_ELEMENT;
		// 32bit float for delta x
		var deltaBytes = Float32Array.BYTES_PER_ELEMENT;
		
		this._buffer = new ArrayBuffer(coordBytes+deltaBytes);
		this._coordArray = new Uint16Array(this._buffer, 0, 2);
		this._deltaArray = new Float32Array(this._buffer, coordBytes, 1);

	};

	EdgeRecord.prototype.getXCoordinate = function() {
		return this._coordArray[0];
	};

	EdgeRecord.prototype.getYCoordinate = function() {
		return this._coordArray[1];
	};

	EdgeRecord.prototype.getDeltaX = function() {
		return this._deltaArray[0];
	};

	EdgeRecord.prototype.setXCoordinate = function(value) {
		this._coordArray[0] = value;
	};

	EdgeRecord.prototype.setYCoordinate = function(value) {
		this._coordArray[1] = value;
	};

	EdgeRecord.prototype.setDeltaX = function(value) {
		this._deltaArray[0] = value;
	};

	return EdgeRecord;
});
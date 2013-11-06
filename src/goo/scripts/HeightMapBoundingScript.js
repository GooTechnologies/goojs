define([],
	function() {

	"use strict";

		/**
		 * @class Handles the height data for a heightmap and
		 * provides functions for getting elevation at given coordinates.
		 * @param {Array} matrixData The height data. Needs to be power of two.
		 * @constructor
		 */

	function HeightMapBoundingScript(matrixData) {
		this.matrixData = matrixData;
		this.width = Math.sqrt(matrixData.length);
	}

	// get the whole height map in matrix form
	HeightMapBoundingScript.prototype.getPointInMatrix = function(x, y) {
		return this.matrixData[x][y];
	};

	// get the value at the precise integer (x, y) coordinates
	HeightMapBoundingScript.prototype.getAt = function(x, y) {
		if(x < 0 || x > this.width || y < 0 || y > this.height) {
			return 0;
		}
		else {
			return this.getPointInMatrix(x, y);
		}
	};

	// get the interpolated value
	HeightMapBoundingScript.prototype.getInterpolated = function(x, y) {
		var valueLeftUp = this.getAt(Math.ceil(x), Math.ceil(y));
		var valueLeftDown = this.getAt(Math.ceil(x), Math.floor(y));
		var valueRightUp = this.getAt(Math.floor(x), Math.ceil(y));
		var valueRightDown = this.getAt(Math.floor(x), Math.floor(y));

		var fracX = x - Math.floor(x);
		var fracY = y - Math.floor(y);

		var upAvg = valueLeftUp * fracX + valueRightUp * (1 - fracX);
		var downAvg = valueLeftDown * fracX + valueRightDown * (1 - fracX);

		var totalAvg = upAvg * fracY + downAvg * (1 - fracY);

		return totalAvg;
	};

	HeightMapBoundingScript.prototype.run = function(entity) {
		var translation = entity.transformComponent.transform.translation;
		translation.data[1] = this.getInterpolated(translation.data[0], translation.data[2]);
	};

	return HeightMapBoundingScript;
});
define([
	'goo/math/MathUtils'
], function (
	MathUtils
) {
	'use strict';

	/**
	 * Handles the height data for a heightmap and
	 * provides functions for getting elevation at given coordinates.
	 * @param {Array} matrixData The height data. Needs to be power of two.
	 */
	function HeightMapBoundingScript(matrixData) {
		this.matrixData = matrixData;
		this.width = matrixData.length - 1;
	}

	/**
	 * Gets the terrain matrix data
	 * @returns {Array} the height data matrix
	 */
	HeightMapBoundingScript.prototype.getMatrixData = function() {
		return this.matrixData;
	};

	// get a height at point from matrix
	HeightMapBoundingScript.prototype.getPointInMatrix = function(x, y) {
		return this.matrixData[x][y];
	};

	// get the value at the precise integer (x, y) coordinates
	HeightMapBoundingScript.prototype.getAt = function(x, y) {
		if(x < 0 || x > this.width || y < 0 || y > this.width) {
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


	HeightMapBoundingScript.prototype.getTriangleAt = function(x, y) {
		var xc = Math.ceil(x);
		var xf = Math.floor(x);
		var yc = Math.ceil(y);
		var yf = Math.floor(y);

		var fracX = x - xf;
		var fracY = y - yf;

		var p1  = {x:xf, y:yc, z:this.getAt(xf, yc)};
		var p2  = {x:xc, y:yf, z:this.getAt(xc, yf)};

		var p3;

		if (fracX < 1-fracY) {
			p3 = {x:xf, y:yf, z:this.getAt(xf, yf)};
		} else {
			p3 = {x:xc, y:yc, z:this.getAt(xc, yc)};
		}
		return [p1, p2, p3];
	};

	// get the exact height of the triangle at point
	HeightMapBoundingScript.prototype.getPreciseHeight = function(x, y) {
		var tri = this.getTriangleAt(x, y);
		var find = MathUtils.barycentricInterpolation(tri[0], tri[1], tri[2], {x:x, y:y, z:0});
		return find.z;
	};

	HeightMapBoundingScript.prototype.run = function(entity) {
		var translation = entity.transformComponent.transform.translation;
		translation.y = this.getInterpolated(translation.z, translation.x);
	};

	return HeightMapBoundingScript;
});
define([],
	function() {

	"use strict";

	function HeightMapBoundingScript(fileName, callback) {
		// have the image load
		var img = new Image();
		img.src = fileName;

		// create an off screen canvas
		this.canvas = document.createElement('canvas');

		// get its context
		this.con2d = this.canvas.getContext('2d');

		this.loaded = false;
		var that = this;
		img.onload = function() {
			// when ready, paint the image on the canvas
			that.canvas.width = img.width;
			that.canvas.height = img.height;

			that.con2d.drawImage(img, 0, 0);
			that.loaded = true;

			callback(this);
		};
	}

	// get the whole height map in matrix form
	HeightMapBoundingScript.prototype.getMatrix = function() {
		var matrix = [];
		for (var i = 0; i < this.canvas.width; i++) {
			matrix.push([]);
			for (var j = 0; j < this.canvas.height; j++) {
				matrix[i].push(this.getAt(i, j));
			}
		}
		return matrix;
	};

	// get the value at the precise integer (x, y) coordinates
	HeightMapBoundingScript.prototype.getAt = function(x, y) {
		if(x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
			return 0;
		}
		else {
			return this.con2d.getImageData(x, y, 1, 1).data[0] / 255 * 8;
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
		var translation = entity.transform.translation;
		translation.data[1] = this.getInterpolated(translation.data[0], translation.data[2]);
	};

	return HeightMapBoundingScript;
});
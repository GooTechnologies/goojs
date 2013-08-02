define([],
	function() {

	"use strict";

	function HeightMapBoundingScript(fileName) {
		// have the image load
		var img = new Image();
		img.src = fileName;

		// create an off screen canvas
		this.canvas = document.createElement('canvas');
		this.canvas.width = img.width;
		this.canvas.height = img.height;

		// get it's context
		this.con2d = this.canvas.getContext('2d');

		this.loaded = false;
		var that = this;
		img.onload = function() {
			// when ready, paint the image on the canvas
			that.con2d.drawImage(img, 0, 0);
		};
	}

	// get the value at the precise integer (x, y) coordinates
	HeightMapBoundingScript.prototype.getAt = function(x, y) {
		return this.con2d.getImageData(x, y, 1, 1).data;
	};

	// get the interpolated value
	HeightMapBoundingScript.prototype.getInterpolated = function(x, y) {
		var leftUp = this.getAt(Math.floor(x), Math.floor(x));
		var leftDown = this.getAt(Math.floor(x), Math.ceil(y));
		var rightUp = this.getAt(Math.ceil(x), Math.ceil(y));
		var rightDown = this.getAt(Math.ceil(x), Math.floor(y));

		var upAvg = (leftUp + rightUp) / 2;
		var downAvg = (leftDown + rightDown) / 2;

		var totalAvg = (upAvg + downAvg) / 2;

		return totalAvg;
	};

	HeightMapBoundingScript.prototype.run = function(entity) {
		var translation = entity.transformComponent.transform.translation;
		translation.data[1] = this.getInterpolated(translation.data[0], translation.data[2]);
	};

	return HeightMapBoundingScript;
});
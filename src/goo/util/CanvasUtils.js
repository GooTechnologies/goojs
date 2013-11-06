define([],
	/** @lends */
	function() {

		"use strict";

		function CanvasUtils() {

		}

		/**
		 * Loads a canvas element from a given path and returns the result within a callback.
		 *
		 * @param {String} canvasPath
		 * @param {function} callback
		 */
		CanvasUtils.prototype.loadCanvasFromPath = function(canvasPath, callback) {
			// have the image load
			var img = new Image();
			img.src = canvasPath;

			// create an off screen canvas
			var canvas = document.createElement('canvas');

			// get its context
			var context = canvas.getContext('2d');

			img.onload = function() {
				// when ready, paint the image on the canvas
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img, 0, 0);
				callback(canvas);
			};
		};

		/**
		 * Takes a canvas element and returns it's image data as a matrix.
		 * Useful for things such as heightmap displacement from image source.
		 *
		 * @param canvas
		 * @returns {Array}
		 */

		CanvasUtils.prototype.getMatrixFromCanvas = function(canvas) {
			var context = canvas.getContext('2d');

			var getAt = function(x, y) {
				if(x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
					return 0;
				}
				else {
					return context.getImageData(x, y, 1, 1).data[0] / 255 * 8;
				}
			};

			var matrix = [];
			for (var i = 0; i < canvas.width; i++) {
				matrix.push([]);
				for (var j = 0; j < canvas.height; j++) {
					matrix[i].push(getAt(i, j));
				}
			}
			return matrix;
		};

		return CanvasUtils;

	});
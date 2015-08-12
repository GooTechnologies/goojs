define([
	'goo/util/PromiseUtils',
	'goo/util/ObjectUtils'
], function (
	PromiseUtils,
	ObjectUtils
) {
	'use strict';

	// TODO: make promise based instead of sending callbacks

	/**
	 * Provides useful canvas-related methods
	 */
	function CanvasUtils() {}

	// REVIEW: add documentation about what happens if the image is corrupt
	/**
	 * Loads an image element from a given URL and returns the image rendered on a canvas within a callback.
	 *
	 * @param {string} canvasPath	                 The URL to the image to render to the canvas.
	 * @param {Object} [options]
	 * @param {number} [options.width]             Resulting width of the canvas, falls back to image width.
	 * @param {number} [options.height]            Resulting height of the canvas, falls back to image height.
	 * @param {number} [options.sourceX]           Where to start clipping in x
	 * @param {number} [options.sourceY]           Where to start clipping in y
	 * @param {number} [options.sourceWidth]       The width of the clipped image
	 * @param {number} [options.sourceHeight]      The height of the clipped image
	 * @param {number} [options.destX]             Destination frame offset in x
	 * @param {number} [options.destY]             Destination frame offset in y
	 * @param {number} [options.destWidth]         Destination frame width
	 * @param {number} [options.destHeight]        Destination frame height
	 * @param {number} [options.resizeToFit=false] If true, the image is stretched to fit and centered on the canvas.
	 * @param {Function} callback
	 */
	CanvasUtils.loadCanvasFromPath = function (canvasPath, callback) {
		var options = {};
		if (arguments.length === 3) {
			// Called with loadCanvasFromPath(path, options, callback)
			options = arguments[1];
			callback = arguments[2];
		}

		// have the image load
		var img = new Image();
		img.onerror = function () {
			console.error('Failed to load svg!');
			callback();
		};
		img.src = canvasPath;

		// create an off screen canvas
		var canvas = document.createElement('canvas');

		// get its context
		var context = canvas.getContext('2d');

		img.onload = function () {
			// when ready, paint the image on the canvas

			if (img.width === 0 && img.height === 0) {
				// Could not load
				return callback();
			}

			ObjectUtils.defaults(options, {
				// Canvas size
				width: img.width,
				height: img.height,

				// Clipping window size & position
				sourceX: 0,
				sourceY: 0,
				sourceWidth: img.width,
				sourceHeight: img.height,

				// Destination window size & position
				destX: 0,
				destY: 0
			});

			ObjectUtils.defaults(options, {
				destWidth: options.width,
				destHeight: options.height
			});

			if (options.resizeToFit) {
				// preserve aspect ratio of input image and center it
				var ratio = options.sourceWidth / options.sourceHeight;
				if (ratio > 1) {
					options.destHeight = options.destWidth / ratio;
					options.destY = (options.height - options.destHeight) * 0.5;
				} else if (ratio < 1) {
					options.destWidth = options.destHeight * ratio;
					options.destX = (options.width - options.destWidth) * 0.5;
				}
			}

			// Set dimensions
			canvas.width = options.width;
			canvas.height = options.height;

			// Render to canvas
			context.drawImage(
				img,
				options.sourceX, options.sourceY,
				options.sourceWidth, options.sourceHeight,
				options.destX, options.destY,
				options.destWidth, options.destHeight
			);

			callback(canvas);
		};
	};

	/**
	 * Renders an SVG to a canvas element.
	 *
	 * @param {string} svgSource			The SVG XML source code
	 * @param {Object} options				Will be passed to loadCanvasFromPath.
	 * @param {Function} callback			Will be called when done. The single argument to this function will be the HTMLCanvasElement, or null if an error occurred.
	 * @example
	 * var data = '&lt;svg xmlns="http://www.w3.org/2000/svg" width=100 height=100&gt;&lt;rect x=0 y=0 width=100 height=100 fill="blue" /&gt;&lt;/svg&gt;';
	 * CanvasUtils.renderSvgToCanvas(data, {
	 *     resizeToFit:true,
	 *     width:100,
	 *     height:100
	 * }, function (canvas){
	 *     // canvas is an HTMLCanvasElement
	 * });
	 */
	CanvasUtils.renderSvgToCanvas = function (svgSource, options, callback) {
		var url = 'data:image/svg+xml;base64,' + btoa(svgSource);

		CanvasUtils.loadCanvasFromPath(url, options, callback);
	};

	/**
	 * Takes a canvas element and returns it's image data as a matrix.
	 * Useful for things such as heightmap displacement from image source.
	 *
	 * @param canvas
	 * @returns {Array}
	 */
	CanvasUtils.getMatrixFromCanvas = function (canvas) {
		var context = canvas.getContext('2d');

		var getAt = function (x, y) {
			if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
				return 0;
			} else {
				return context.getImageData(x, y, 1, 1).data[0] / 255;
			}
		};

		var matrix = [];
		for (var i = 0; i < canvas.width; i++) {
			matrix.push([]);
			for (var j = 0; j < canvas.height; j++) {
				matrix[i].push(getAt(i, canvas.height - (j + 1)));
			}
		}
		return matrix;
	};

	/**
	 *
	 * Convert SVG XML content to an HTMLImageElement.
	 * @param  {string} data
	 * @returns {RSVP.Promise} Promise that resolves with the Image.
	 */
	CanvasUtils.svgDataToImage = function (data) {
		var DOMURL = window.URL || window.webkitURL || window;

		var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });

		var img = new Image();
		img.src = DOMURL.createObjectURL(svg);

		return PromiseUtils.createPromise(function (resolve, reject) {
			img.onload = function () {
				resolve(img);
			};
			img.onerror = function () {
				reject('Could not load SVG image.');
			};
		});
	};

	return CanvasUtils;
});

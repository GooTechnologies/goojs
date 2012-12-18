define(function () {
	"use strict";

	/**
	 * @name Loader
	 * @class Image loader util
	 */
	function Loader() {
		this.crossOrigin = 'anonymous';
	}

	Loader.prototype.loadImage = function (url, callback) {
		var image = new Image();

		callback = callback !== undefined ? callback : {};
		image.addEventListener('load', function () {
			console.log('Loaded image: ' + url);
			image.dataReady = true;
			if (callback.onSuccess) {
				callback.onSuccess(image);
			}
		}, false);

		image.addEventListener('error', function () {
			if (callback.onError) {
				callback.onError('Couldn\'t load URL [' + url + ']');
			}
		}, false);

		if (this.crossOrigin) {
			image.crossOrigin = this.crossOrigin;
		}

		image.src = url;

		return image;
	};

	return Loader;
});
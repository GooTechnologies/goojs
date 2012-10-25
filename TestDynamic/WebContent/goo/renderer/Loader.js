"use strict";

define(function() {
	function Loader() {
		this.crossOrigin = 'anonymous';
	}

	Loader.prototype.loadImage = function(url, callback) {
		var image = new Image();

		callback = callback !== undefined ? callback : {};
		// (function(image) {
		image.addEventListener('load', function() {
			console.log(image.src);
			image.dataReady = true;
			if (callback.onSuccess) {
				callback.onSuccess(image);
			}
		}, false);
		// })(image);

		image.addEventListener('error', function() {
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
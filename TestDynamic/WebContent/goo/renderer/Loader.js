define(function() {
	function Loader() {
		this.crossOrigin = 'anonymous';
	}

	Loader.prototype.loadImage = function(url, callback) {
		var image = new Image();

		callback = callback !== undefined ? callback : {};
		image.addEventListener('load', function() {
			if (callback.onSuccess) {
				callback.onSuccess(image);
			}
		}, false);

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
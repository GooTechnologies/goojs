define([
		'goo/util/Deferred',
		'goo/util/Ajax'
	],
	/** @lends Loader */
	function (
		Deferred,
		Ajax
	) {
	"use strict";

	/**
	 * @class Loader util
	 */
	function Loader(parameters) {
		if(typeof parameters !== "undefined" && parameters !== null) {
			this._crossOrigin = parameters.crossOrigin || 'anonymous';
			this.projectRoot = parameters.projectRoot || '';
		} else {
			throw new Error('Loader(): Argument `parameters` is undefined/null');
		}
	}

	Loader.prototype.load = function(url) {
		if(typeof url === "undefined" || url === null) {
			throw new Error('Loader(): `url` was undefined/null');
		}

		var deferred = new Deferred();

		var ajaxProperties = {
			url: this._projectRoot + url
		};

		var that = this;
		new Ajax(ajaxProperties)
		.done(function(request) {
			try {
				var data = that._getDataFromSuccessfulRequest(request, ajaxProperties);
				deferred.resolve(data);
			} catch(e) {
				deferred.reject(e);
			}
		})
		.fail(function(reason) {
			deferred.reject(reason);
		});

		return deferred.promise();
	};

	Loader.prototype._getDataFromSuccessfulRequest = function(request, ajaxProperties) {

		if(!(request instanceof XMLHttpRequest)) {
			throw new Error('Loader._getDataFromSuccessfulRequest(): Argument `request` must be an XMLHttpRequest');
		}

		var contentType = request.getResponseHeader('Content-Type');

		if(contentType === 'application/json') {
			var json = JSON.parse(request.responseText);
			return json;
		} else if(contentType === 'application/octet-stream') {
			var match = ajaxProperties.url.match(/.glsl$/);

			if(match !== null) {
				// If the request url contains a known file extension
				return request.responseText;
			} else {
				throw new Error('Loader._getDataFromSuccessfulRequest(): No known extension found in `' + ajaxProperties.url + '` for content type `' +  contentType);
			}
		}

		// We couldn't figure out what to do with the data
		throw new Error('Loader._getDataFromSuccessfulRequest(): Unexpected content type `' +  contentType);
	};

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

		if (this._crossOrigin) {
			image.crossOrigin = this._crossOrigin;
		}

		image.src = url;

		return image;
	};

	return Loader;
});
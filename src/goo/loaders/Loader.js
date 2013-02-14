define([
		'lib/rsvp.amd',
		'goo/util/Ajax'
	],
	/** @lends Loader */
	function (
		RSVP,
		Ajax
	) {
	"use strict";

	/**
	 * Handles loading of data.
	 *
	 * @constructor
	 * @param {string} [parameters.projectRoot=''] parameters.projectRoot The absolute path of the project root. Ex. <code>/project/root/</code>.
	 * @param {string} [parameters.crossOrigin='anonymous'] parameters.crossOrigin Sets the Image.crossOrigin of any loaded Image objects.
	 */
	function Loader(parameters) {
		parameters = (typeof parameters !== "undefined" && parameters !== null) ? parameters : {};
		
		this._crossOrigin = parameters.crossOrigin || 'anonymous';
		this.projectRoot = parameters.projectRoot || '';
	}

	/**
	 * Loads data at specified path which is returned in a Promise object. If a parser function is specified the data will be parsed by it.
	 *
	 * @param {string} path Relative path to whatever shall be loaded.
	 * @param {Function} parser A function that parses the loaded data. If the function returns a Promise then its resolved value will resolve the load()'s Promise .
	 * @return {Promise} The promise is resolved with the data loaded. If a parser is specified the data will be of the type resolved by the parser promise.
	 */
	Loader.prototype.load = function(path, parser) {
		if(typeof path === "undefined" || path === null) {
			throw new Error('Loader(): `path` was undefined/null');
		}

		var ajaxProperties = {
			url: this._buildURL(path)
		};
		
		console.log(ajaxProperties.url);

		var that = this;
		var promise = new Ajax(ajaxProperties)
		.then(function(request) {
			return that._getDataFromSuccessfulRequest(request, ajaxProperties);
		})
		.then(function(data) {
			return (typeof parser === 'function') ? parser(data) : data;
		})
		.then(function(parsed) {
			console.log(parsed);
			promise.resolve(parsed);
		});

		return promise;
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

	/**
	 * Loads image data at specified path which is returned in a Promise object. If a parser function is specified the data will be parsed by it.
	 *
	 * @param {string} path Relative path to whatever shall be loaded.
	 * @param {Function} parser A function that parses the loaded data.
	 * @return {Promise} The promise is resolved with an Image object.
	 */
	Loader.prototype.loadImage = function (url) {
		var promise = new RSVP.Promise();
		var image = new Image();
		var _url = this._buildURL(url);
		
		
		image.crossOrigin = this._crossOrigin || '';

		image.addEventListener('load', function () {
			console.log('Loaded image: ' + _url);
			image.dataReady = true;
			promise.resolve(image);
		}, false);

		image.addEventListener('error', function () {
			promise.reject('Loader.loadImage(): Couldn\'t load from [' + _url + ']');
		}, false);

		image.src = _url;

		return promise;
	};

	Loader.prototype._buildURL = function(URLString) {
		var _match = URLString.match(/\.(ent|mat|mesh|shader)$/);
		var _url = _match ? URLString + '.json' : URLString;
		return this.projectRoot + _url;
	};

	return Loader;
});

define([
		'goo/lib/rsvp.amd',
		'goo/util/Ajax'
	],
	/** @lends */
	function (
		RSVP,
		Ajax
	) {
	"use strict";

	/**
	 * @class Handles loading of data.
	 *
	 * @constructor
	 * @param {string} [parameters.rootPath=''] The path of the project root.
	 * Ex. <code>/project/root/</code>.
	 * @param {string} [parameters.crossOrigin='anonymous'] Sets the Image.crossOrigin 
	 * of any loaded Image objects.
	 * @param {Ajax} [parameters.xhr]
	 */
	function Loader(parameters) {
		if(typeof parameters !== "undefined" && parameters !== null && typeof parameters !== "object") {
			throw new Error('Loader(): Argument `parameters` must be of type `object`');
		} else if(typeof parameters === "undefined" || parameters === null) {
			parameters = {};
		}

		this._crossOrigin = parameters.crossOrigin || 'anonymous';
		this.rootPath = parameters.rootPath || '';
		this.xhr = parameters.xhr || new Ajax();
	}

	/**
	 * Loads data at specified path which is returned in a Promise object.
	 * If a parser function is specified the data will be parsed by it.
	 *
	 * @param {string} path Relative path to whatever shall be loaded.
	 * @param {function(object)} parser A function that parses the loaded data.
	 * If the function returns a Promise then its resolved value will resolve the load()'s Promise .
	 * @param {string} [mode] Currently only supports {@link Loader.ARRAY_BUFFER}, otherwise skip.
	 *
	 * @returns {RSVP.Promise} The promise is resolved with the data loaded. If a parser is specified
	 * the data will be of the type resolved by the parser promise.
	 */
	Loader.prototype.load = function(path, parser, mode) {
		if(typeof path === "undefined" || path === null) {
			throw new Error('Loader(): `path` was undefined/null');
		}

		var ajaxProperties = {
			url: this._buildURL(path)
		};
		if (mode === Loader.ARRAY_BUFFER) {
			ajaxProperties.responseType = Loader.ARRAY_BUFFER;
		}

		var that = this;
		var promise = this.xhr.get(ajaxProperties)
		.then(function(request) {
			return that._getDataFromSuccessfulRequest(request, ajaxProperties);
		})
		.then(function(data) {
			return (typeof parser === 'function') ? parser(data) : data;
		})
		.then(function(parsed) {
			promise.resolve(parsed);
			console.log('Loaded: ' + ajaxProperties.url);
			return parsed;
		})
		// Bubble an error
		.then(null, function(reason) {
			console.error('Loader.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
			throw new Error('Loader.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
		});

		return promise;
	};

	Loader.prototype._getDataFromSuccessfulRequest = function(request, ajaxProperties) {
		if (/\.json$/.test(ajaxProperties.url)) {
			return JSON.parse(request.responseText);
		} else if (/\.(glsl|dds|vs|fs|vert|frag)$/.test(ajaxProperties.url)) {
			// If the request url contains a known file extension
			if (request.responseType === Loader.ARRAY_BUFFER) {
				return request.response;
			}
			return request.responseText;
		} else {
			throw new Error('Loader._getDataFromSuccessfulRequest(): No known extension found in `' + ajaxProperties.url + '`');
		}
	};

	/**
	 * Loads image data at specified path which is returned in a Promise object. If a parser
	 * function is specified the data will be parsed by it.
	 *
	 * @example
	 * loader.loadImage('resources/image.png').then(function(image) {
	 *   // handle {@link Image} image
	 * });
	 * @param {string} url Relative path to whatever shall be loaded.
	 * @returns {RSVP.Promise} The promise is resolved with an Image object.
	 */
	Loader.prototype.loadImage = function (url) {
		var promise = new RSVP.Promise();
		var image = new Image();
		var _url = this._buildURL(url);


		image.crossOrigin = this._crossOrigin || '';

		image.addEventListener('load', function () {
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
		var _match = URLString.match(/\.(bundle|scene|ent|mat|mesh|shader|tex)$/);
		var _url = _match ? URLString + '.json' : URLString;
		return this.rootPath + _url;
	};

	/** @type {string}
	 * @default
	 */
	Loader.ARRAY_BUFFER = 'arraybuffer';

	return Loader;
});
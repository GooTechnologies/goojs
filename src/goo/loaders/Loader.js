
define([
		'goo/util/rsvp',
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
	 * @param {object} [parameters]
	 * @param {string} [parameters.rootPath=''] The path of the project root.
	 * Ex. <code>/project/root/</code>.
	 * @param {Ajax} [parameters.xhr]
	 */
	function Loader(parameters) {
		if(typeof parameters !== "undefined" && parameters !== null && typeof parameters !== "object") {
			throw new Error('Loader(): Argument `parameters` must be of type `object`');
		} else if(typeof parameters === "undefined" || parameters === null) {
			parameters = {};
		}

		this.rootPath = parameters.rootPath || '';
		this.xhr = parameters.xhr || new Ajax(this._progressCallback.bind(this));
		this._progressCallbacks = [];
		this.total = 0;
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

		var promise = this.xhr.get(ajaxProperties)
		.then(function(request) {
			return request.response;
		});

		if (parser) {
			promise = promise.then(function(data) {
				return (typeof parser === 'function') ? parser(data) : data;
			});
		}

		promise.then(function(/*parsed*/) {
			console.log('Loaded: ' + ajaxProperties.url);
		});
		// Bubble an error
		promise.then(null, function(reason) {
			console.error('Loader.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
			throw new Error('Loader.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
		});

		return promise;
	};

	/**
	 * Add a callback to get loader progress. The object passed to the callback will be
	 * on the form:<br />
	 * <code>{
	 *   loaded: number Bytes loaded
	 *   total: number Bytes to load
	 *   count: number Number of resources loaded/loading
	 * }</code>
	 * @param {function(object)} callback
	 */
	Loader.prototype.addProgressCallback = function (callback) {
		this._progressCallbacks.push(callback);
	};

	/**
	 * Remove a progress callback. It has to be the same function you added to callback earlier.
	 * @param {function(object)} callback
	 */
	Loader.prototype.removeProgressCallback = function (callback) {
		for (var i = 0; i < this._progressCallbacks.length; i++) {
			if (this._progressCallbacks[i] === callback) {
				this._progressCallbacks.splice(i, 1);
				break;
			}
		}
	};

	Loader.prototype._progressCallback = function(progress) {
		if (this.total) {
			progress.total = this.total;
		}
		for (var i = 0; i < this._progressCallbacks.length; i++) {
			this._progressCallbacks[i](progress);
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

		image.addEventListener('load', function () {
			image.dataReady = true;
			window.URL.revokeObjectURL(image.src);
			promise.resolve(image);
		}, false);

		image.addEventListener('error', function () {
			promise.reject('Loader.loadImage(): Couldn\'t load from [' + url + ']');
		}, false);

		/**
		image.src = this._buildURL(url);
		return promise;
		/**/

		// Loading image as binary, then base64 encoding them. Needed to listen to progress
		this.load(url, function(data) {
			var bytes = new Uint8Array(data,0,data.byteLength);
			var type = 'image/jpeg';
			if(/\.png$/.test(url)) {
				type = 'image/png';
			}
			var blob = new Blob([bytes], { type: type });

			image.src = window.URL.createObjectURL(blob);

		}, Loader.ARRAY_BUFFER);
		return promise;
		/**/
	};

	Loader.prototype._buildURL = function(url) {
		return this.rootPath + escape(url);
	};

	/** @type {string}
	 * @default
	 */
	Loader.ARRAY_BUFFER = 'arraybuffer';

	return Loader;
});
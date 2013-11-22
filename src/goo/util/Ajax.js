define([
	'goo/util/rsvp'
],
/** @lends */
function(
	RSVP
) {
	"use strict";

	/**
	 * @class Subclass of Promise. Wrapper class around an XHR call.
	 * @constructor
	 * @description Creates a new Ajax instance.
	 * @param {function(object)} progressCallback A function receiving an object on the form<br />
	 * <code>{
	 *   loaded: number Bytes loaded
	 *   total: number Bytes to load
	 *   count: number Number of resources loaded/loading
	 * }</code>
	 */
	function Ajax(progressCallback) {
		this._loadStack = [];
		this._callback = progressCallback;

	}

	/**
	 * Uses GET to retrieve data at a remote location.
	 *
	 * @param {object} options
	 * @param {string} options.url
	 * @return {Promise} Returns a promise that is resolved and rejected with the XMLHttpRequest.
	 */
	Ajax.prototype.get = function(options) {
		var promise = new RSVP.Promise();

		var progress = this._progress.bind(this);
		var payload = {
			loaded: 0,
			total: 0,
			lengthComputable: false
		};
		this._loadStack.push(payload);

		options = options || {};

		var url = options.url || '';

		var method = 'GET';
		var async = true;

		var request = new XMLHttpRequest();


		request.open(method, url, async);
		if (options.responseType) {
			request.responseType = options.responseType;
		}

		request.onreadystatechange = function () {
			if ( request.readyState === 4 ) {
				if ( request.status >= 200 && request.status <= 299 ) {
					payload.loaded = payload.total;
					progress();
					promise.resolve(request);
				} else {
					promise.reject(request.statusText);
				}
			}
		};

		request.addEventListener('progress', function(evt) {
			payload.loaded = evt.loaded || evt.position;
			payload.total = evt.total || evt.totalSize;
			payload.lengthComputable = evt.lengthComputable;

			progress();
		}, false);

		request.send();

		return promise;
	};

	Ajax.prototype._progress = function() {
		if (this._callback) {
			var obj = {
				total: 0,
				loaded: 0,
				count: this._loadStack.length
			};
			for (var i = 0; i < this._loadStack.length; i++) {
				obj.total += this._loadStack[i].total;
				obj.loaded += this._loadStack[i].loaded;
			}
			this._callback(obj);
		}
	};

	Ajax.ARRAY_BUFFER = 'arraybuffer';

	/**
	 * Loads data at specified path which is returned in a Promise object.
	 *
	 * @param {string} path Path to whatever shall be loaded.
	 * @param {string} [mode] Currently only supports {@link Ajax.ARRAY_BUFFER}, otherwise skip.
	 *
	 * @returns {RSVP.Promise} The promise is resolved with the data loaded. If a parser is specified
	 * the data will be of the type resolved by the parser promise.
	 */
	Ajax.prototype.load = function(path, mode) {
		if(typeof path === "undefined" || path === null) {
			throw new Error('Ajax(): `path` was undefined/null');
		}

		var ajaxProperties = {
			url: path
		};
		if (mode === Ajax.ARRAY_BUFFER) {
			ajaxProperties.responseType = Ajax.ARRAY_BUFFER;
		}

		var promise = this.get(ajaxProperties)
		.then(function(request) {
			return request.response;
		});

		// Bubble an error
		promise.then(null, function(reason) {
			console.error('Ajax.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
			throw new Error('Ajax.load(): Could not retrieve data from `' + ajaxProperties.url + '`.\n Reason: ' + reason);
		});

		return promise;
	};

	/**
	 * Loads image data at specified path which is returned in a Promise object. 
	 *
	 * @example
	 * loader.loadImage('resources/image.png').then(function(image) {
	 *   // handle {@link Image} image
	 * });
	 * @param {string} url Path to whatever shall be loaded.
	 * @returns {RSVP.Promise} The promise is resolved with an Image object.
	 */
	Ajax.prototype.loadImage = function (url, needsProgress) {
		window.URL = window.URL || window.webkitURL;
		var promise = new RSVP.Promise();
		var image = new Image();

		image.addEventListener('load', function () {
			image.dataReady = true;
			window.URL.revokeObjectURL(image.src);
			promise.resolve(image);
		}, false);

		image.addEventListener('error', function (e) {
			console.log(e);
			promise.reject('Ajax.loadImage(): Couldn\'t load from [' + url + ']');
		}, false);


		if (needsProgress) {
			// Loading image as binary, then base64 encoding them. Needed to listen to progress
			this.load(url, function(data) {
				var bytes = new Uint8Array(data,0,data.byteLength);
				var type = 'image/jpeg';
				if(/\.png$/.test(url)) {
					type = 'image/png';
				}
				var blob = new Blob([bytes], { type: type });
				image.src = window.URL.createObjectURL(blob);
				return image;
			}, Ajax.ARRAY_BUFFER);
		} else {
			image.src = url;
		}
		return promise;
	};

	return Ajax;
});
define([
	'goo/loaders/handlers/TextureHandler',
	'goo/sound/AudioContext',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/util/rsvp'
],
/** @lends */
function(
	TextureHandler,
	AudioContext,
	PromiseUtil,
	_,
	RSVP
) {
	'use strict';

	/**
	 * @class Ajax helper class
	 * @constructor
	 * @param {string} rootPath
	 * @param {object} options
	 */
	function Ajax(rootPath, options) {
		if (rootPath) {
			this._rootPath = rootPath;
			if (rootPath.slice(-1) !== '/') {
				this._rootPath += '/';
			}
		}
		this.options = options || {};
		this._cache = {};
	}

	/**
	 * Prefill ajax cache with data
	 * @param {object} bundle Pairs of key-configs
	 * @param {boolean} [clear=false] If set to true will overwrite cache, otherwise extend it
	 */
	Ajax.prototype.prefill = function(bundle, clear) {
		if (clear) {
			this._cache = bundle;
		} else {
			_.extend(this._cache, bundle);
		}
	};

	/**
	 * Clears the ajax cache
	 * Is called by {@link DynamicLoader.clear}
	 */
	Ajax.prototype.clear = function() {
		this._cache = {};
	};

	/*
	 * Uses GET to retrieve data at a remote location.
	 *
	 * @param {object} options
	 * @param {string} options.url
	 * @return {Promise} Returns a promise that is resolved and rejected with the XMLHttpRequest.
	 */
	Ajax.prototype.get = function(options) {
		options = options || {};
		var url = options.url || '';

		var method = 'GET';

		var request = new XMLHttpRequest();

		request.open(method, url, true);
		if (options.responseType) {
			request.responseType = options.responseType;
		}

		var promise = new RSVP.Promise();
		request.onreadystatechange = function () {
			if ( request.readyState === 4 ) {
				if ( request.status >= 200 && request.status <= 299 ) {
					promise.resolve(request);
				} else {
					promise.reject(request.statusText);
				}
			}
		};

		request.send();

		return promise;
	};

	Ajax.ARRAY_BUFFER = 'arraybuffer';

	/**
	 * Loads data at specified path which is returned in a Promise object.
	 *
	 * @param {string} path Path to whatever shall be loaded.
	 * @param {boolean} [reload=false] If set to true, reloads even if url is cached
	 *
	 * @returns {RSVP.Promise} The promise is resolved with the data loaded. If a parser is specified
	 * the data will be of the type resolved by the parser promise.
	 */
	Ajax.prototype.load = function(path, reload) {
		var that = this;
		var type = path.slice(path.lastIndexOf('.')+1).toLowerCase();
		function typeInGroup(type, group) {
			return type && Ajax.types[group] && _.indexOf(Ajax.types[group], type) >= 0;
		}

		if (!path) {
			PromiseUtil.createDummyPromise(null, 'Path was undefined');
		}

		if (path.indexOf(Ajax.ENGINE_SHADER_PREFIX) === 0) {
			return PromiseUtil.createDummyPromise();
		}

		if (this._cache[path] && !reload) {
			if (typeInGroup(type, 'bundle')) {
				this.prefill(this._cache[path], reload);
			}
			if (this._cache[path] instanceof RSVP.Promise) {
				return this._cache[path];
			} else {
				return PromiseUtil.createDummyPromise(this._cache[path]);
			}
		}

		var url = (this._rootPath) ? this._rootPath + path : path;
		if (typeInGroup(type, 'image')) {
			return this._cache[path] = this._loadImage(url);
		} else if (typeInGroup(type, 'video')) {
			return this._cache[path] = this._loadVideo(url);
		} else if (typeInGroup(type, 'audio')) {
			return this._cache[path] = this._loadAudio(url);
		}

		var ajaxProperties = {
			url: url
		};

		if (typeInGroup(type, 'binary')) {
			ajaxProperties.responseType = Ajax.ARRAY_BUFFER;
		}

		return this._cache[path] = this.get(ajaxProperties)
		.then(function(request) {
			if (typeInGroup(type, 'bundle')) {
				var bundle = JSON.parse(request.response);
				that.prefill(bundle, reload);
				return bundle;
			}
			if (typeInGroup(type, 'json')) {
				return JSON.parse(request.response);
			}
			return request.response;
		}).then(null, function(err) {
			throw new Error('Could not load data from ' + path + ', ' + err);
		});
	};

	Ajax.prototype.update = function(path, config) {
		this._cache[path] = config;
		return PromiseUtil.createDummyPromise(config);
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
	Ajax.prototype._loadImage = function (url) {
		window.URL = window.URL || window.webkitURL;
		var image = new Image();
		if (this.crossOrigin) {
			image.crossOrigin = 'anonymous';
		}

		var promise = new RSVP.Promise();
		image.addEventListener('load', function () {
			image.dataReady = true;
			if(window.URL && window.URL.revokeObjectURL !== undefined) {
				window.URL.revokeObjectURL(image.src);
			}

			promise.resolve(image);
		}, false);

		image.addEventListener('error', function (e) {
			promise.reject('Could not load image from ' + url + ', ' + e);
		}, false);

		image.src = url;
		return promise;
	};

	Ajax.prototype._loadVideo = function (url) {
		var video = document.createElement('video');
		if (this.crossOrigin) {
			video.crossOrigin = 'anonymous';
		}
		var promise = new RSVP.Promise();
		video.addEventListener('canplay', function() {
			video.dataReady = true;
			promise.resolve(video);
		}, false);

		video.addEventListener('onerror', function(e) {
			promise.reject('Coult not load video from ' + url + ', ' + e);
		}, false);

		video.src = url;
		return promise;
	};

	Ajax.prototype._loadAudio = function (url) {
		var ajaxProperties = {
			url: url,
			responseType: Ajax.ARRAY_BUFFER
		};
		return this.get(ajaxProperties).then(function(request) {
			return request.response;
		})
		.then(null, function(err) {
			throw new Error('Could not load data from ' + url + ', ' + err);
		});
	};

	// TODO Put this somewhere nicer
	Ajax.ENGINE_SHADER_PREFIX = "GOO_ENGINE_SHADERS/";


	Ajax.types = {
		text: [
			'vert',
			'frag' // + Scripts in the future
		],
		json: [
			'shader',
			'script',
			'entity',
			'material',
			'scene',
			'mesh',
			'texture',
			'skeleton',
			'animation',
			'clip',
			'bundle',
			'project',
			'machine',
			'posteffects',
			'animstate',
			'sound',
			'environment',
			'skybox'
		],
		image: [
			'jpg',
			'jpeg',
			'png',
			'gif'
		],
		video: [
			'mp4',
			'ogv',
			'webm'
		],
		binary: [
			'dat',
			'bin'
		].concat(
			_.keys(TextureHandler.loaders)
		),
		audio: [
			'mp3',
			'wav',
			'ogg'
		],
		bundle: [
			'bundle'
		]
	};
	Ajax.types.asset = Ajax.types.image.concat(
		Ajax.types.binary
	);

	Ajax.parseURL = (function() {
		var splitRegExp = new RegExp(
			'^' +
				'(?:' +
				'([^:/?#.]+)' +                         // scheme - ignore special characters
														// used by other URL parts such as :,
														// ?, /, #, and .
				':)?' +
				'(?://' +
				'(?:([^/?#]*)@)?' +                     // userInfo
				'([\\w\\d\\-\\u0100-\\uffff.%]*)' +     // domain - restrict to letters,
														// digits, dashes, dots, percent
														// escapes, and unicode characters.
				'(?::([0-9]+))?' +                      // port
				')?' +
				'([^?#]+)?' +                           // path
				'(?:\\?([^#]*))?' +                     // query
				'(?:#(.*))?' +                          // fragment
				'$');

		return function (uri) {
			var split;
			split = uri.match(splitRegExp);
			return {
				'scheme':split[1],
				'user_info':split[2],
				'domain':split[3],
				'port':split[4],
				'path':split[5],
				'query_data': split[6],
				'fragment':split[7]
			};
		};
	})();

	/**
	 * Removes everything after the path in the URL, including query parameters and fragments.
	 *
	 * @example
	 *     var url = 'http://example.com/images/goo.png?param=1#fragment';
	 *     var newURL = Ajax.removeParamsFromURL(url); // 'http://example.com/images/goo.png'
	 *
	 * @param  {string} url
	 * @return {string}
	 *
	 * @see http://codereview.stackexchange.com/questions/9574/faster-and-cleaner-way-to-parse-parameters-from-url-in-javascript-jquery
	 */
	Ajax.removeParamsFromURL = function(url){
		if (!url) {
			return '';
		}
		var parsedUrl = Ajax.parseURL(url);
		var path = parsedUrl.path;
		if (!path) {
			return url;
		}
		var idx = url.indexOf(path);
		var len = idx + path.length;
		if (len > url.length) {
			return url;
		}
		return url.substr(0,len);
	};

	return Ajax;
});
define([
	'goo/loaders/handlers/TextureHandler',
	'goo/sound/AudioContext',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/util/StringUtil',
	'goo/util/rsvp'
], function (
	TextureHandler,
	AudioContext,
	PromiseUtil,
	_,
	StringUtil,
	RSVP
) {
	'use strict';

	/**
	 * Ajax helper class
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
	Ajax.prototype.prefill = function (bundle, clear) {
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
	Ajax.prototype.clear = function () {
		this._cache = {};
	};

	/*
	 * Uses GET to retrieve data at a remote location.
	 *
	 * @param {object} options
	 * @param {string} options.url
	 * @return {Promise} Returns a promise that is resolved and rejected with the XMLHttpRequest.
	 */
	Ajax.prototype.get = function (options) {
		options = options || {};
		var url = options.url || '';

		var method = 'GET';

		var request = new XMLHttpRequest();

		request.open(method, url, true);
		if (options.responseType) {
			request.responseType = options.responseType;
		}

		return PromiseUtil.createPromise(function (resolve, reject) {
			var handleStateChange = function () {
				if (request.readyState === 4) {
					if (request.status >= 200 && request.status <= 299) {
						request.removeEventListener('readystatechange', handleStateChange);
						resolve(request);
					} else {
						request.removeEventListener('readystatechange', handleStateChange);
						reject(request.statusText);
					}
				}
			};

			request.addEventListener('readystatechange', handleStateChange);

			request.send();
		});
	};

	Ajax.ARRAY_BUFFER = 'arraybuffer';
	Ajax.crossOrigin = false;

	/**
	 * Loads data at specified path which is returned in a Promise object.
	 *
	 * @param {string} path Path to whatever shall be loaded.
	 * @param {boolean} [reload=false] If set to true, reloads even if url is cached
	 *
	 * @returns {RSVP.Promise} The promise is resolved with the data loaded. If a parser is specified
	 * the data will be of the type resolved by the parser promise.
	 */
	Ajax.prototype.load = function (path, reload) {
		var that = this;
		var path2 = StringUtil.parseURL(path).path;//! AT: dunno what to call this
		var type = path2.substr(path2.lastIndexOf('.') + 1).toLowerCase();

		function typeInGroup(type, group) {
			return type && Ajax.types[group] && Ajax.types[group][type];
		}

		if (!path) {
			PromiseUtil.reject('Path was undefined');
		}

		if (path.indexOf(Ajax.ENGINE_SHADER_PREFIX) === 0) {
			return PromiseUtil.resolve();
		}

		if (this._cache[path] && !reload) {
			if (typeInGroup(type, 'bundle')) {
				this.prefill(this._cache[path], reload);
			}
			if (this._cache[path] instanceof RSVP.Promise) {
				return this._cache[path];
			} else {
				return PromiseUtil.resolve(this._cache[path]);
			}
		}

		var url = (this._rootPath) ? this._rootPath + path : path;
		if (typeInGroup(type, 'image')) {
			return this._cache[path] = this._loadImage(url);
		} else if (typeInGroup(type, 'video')) {
			var mimeTypes = {
				mp4: 'video/mp4',
				ogv: 'video/ogg',
				webm: 'video/webm'
			};
			return this._cache[path] = this._loadVideo(url, mimeTypes[type]);
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
		.then(function (request) {
			if (typeInGroup(type, 'bundle')) {
				var bundle = JSON.parse(request.response);
				that.prefill(bundle, reload);
				return bundle;
			}
			if (typeInGroup(type, 'json')) {
				return JSON.parse(request.response);
			}
			return request.response;
		}).then(null, function (err) {
			throw new Error('Could not load data from ' + path + ', ' + err);
		});
	};

	Ajax.prototype.update = function (path, config) {
		this._cache[path] = config;
		return PromiseUtil.resolve(config);
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
		if (Ajax.crossOrigin) {
			image.crossOrigin = 'anonymous';
		}

		return PromiseUtil.createPromise(function (resolve, reject) {
			var onLoad = function loadHandler() {
				image.dataReady = true;
				if (window.URL && window.URL.revokeObjectURL !== undefined) {
					window.URL.revokeObjectURL(image.src);
				}
				image.removeEventListener('load', onLoad);
				image.removeEventListener('error', onError);
				resolve(image);
			};

			var onError = function errorHandler(e) {
				image.removeEventListener('load', onLoad);
				image.removeEventListener('error', onError);
				reject('Could not load image from ' + url + ', ' + e);
			};

			image.addEventListener('load', onLoad, false);
			image.addEventListener('error', onError, false);

			image.src = url;
		});
	};

	Ajax.prototype._loadVideo = function (url, mimeType) {
		var video = document.createElement('video');
		if (Ajax.crossOrigin) {
			video.crossOrigin = 'anonymous';
		}

		var promise = PromiseUtil.createPromise(function (resolve, reject) {
			video.addEventListener('canplay', function () {
				video.dataReady = true;
				resolve(video);
			}, false);
			video.addEventListener('error', function (e) {
				reject('Could not load video from ' + url + ', ' + e);
			}, false);
		});

		var ajaxProperties = {
			url: url,
			responseType: Ajax.ARRAY_BUFFER
		};

		this.get(ajaxProperties).then(function (request) {
			var blob = new Blob([request.response], { type: mimeType });
			var url = window.URL.createObjectURL(blob);
			video.src = url;
		});

		return promise;
	};

	Ajax.prototype._loadAudio = function (url) {
		var ajaxProperties = {
			url: url,
			responseType: Ajax.ARRAY_BUFFER
		};
		return this.get(ajaxProperties).then(function (request) {
			return request.response;
		})
		.then(null, function (err) {
			throw new Error('Could not load data from ' + url + ', ' + err);
		});
	};

	// TODO Put this somewhere nicer
	Ajax.ENGINE_SHADER_PREFIX = "GOO_ENGINE_SHADERS/";

	function addKeys(obj, keys) {
		for (var i = 0; i < keys.length; i++) {
			obj[keys[i]] = true;
		}
		return obj;
	}

	Ajax.types = {
		text: {
			vert: true,
			frag: true // + Scripts in the future
		},
		json: {
			shader: true,
			script: true,
			entity: true,
			material: true,
			scene: true,
			mesh: true,
			texture: true,
			skeleton: true,
			animation: true,
			clip: true,
			bundle: true,
			project: true,
			machine: true,
			posteffects: true,
			animstate: true,
			sound: true,
			environment: true,
			skybox: true
		},
		image: {
			jpg: true,
			jpeg: true,
			png: true,
			gif: true
		},
		video: {
			mp4: true,
			ogv: true,
			webm: true
		},
		binary: addKeys({
			dat: true,
			bin: true
		}, Object.keys(TextureHandler.loaders)),
		audio: {
			mp3: true,
			wav: true,
			ogg: true
		},
		bundle: {
			bundle: true
		}
	};

	Ajax.types.asset = addKeys(
		{},
		Object.keys(Ajax.types.image)
			.concat(Object.keys(Ajax.types.binary))
	);

	return Ajax;
});
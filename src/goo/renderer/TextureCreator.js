define([
	'goo/loaders/Loader',
	'goo/renderer/Texture',
	'goo/loaders/dds/DdsLoader',
	'goo/loaders/tga/TgaLoader',
	'goo/util/SimpleResourceUtil',
	'goo/renderer/Util',
	'goo/util/Latch'
],
/** @lends */
function (
	Loader,
	Texture,
	DdsLoader,
	TgaLoader,
	SimpleResourceUtil,
	Util,
	Latch
) {
	"use strict";

	var window;
	var URL = window?(window.URL || window.webkitURL):self.URL||self.webkitURL;

	/**
	 * @class Takes away the pain of creating textures of various sorts.
	 * @param {Settings} settings Texturing settings
	 */
	function TextureCreator(settings) {
		settings = settings || {};

		this.verticalFlip = settings.verticalFlip !== undefined ? settings.verticalFlip : true;
		this._loader = settings.loader !== undefined ? settings.loader : new Loader();

		this.textureLoaders = {
			'.dds': new DdsLoader(),
			'.tga': new TgaLoader()
		};
	}

	TextureCreator.cache = {};
	TextureCreator.UNSUPPORTED_FALLBACK = '.png';

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	TextureCreator.clearCache = function () {
		TextureCreator.cache = {};
	};

	/**
	 * Creates a texture and loads image into it
	 * @example gridMaterial.setTexture('DIFFUSE_MAP', new TextureCreator().loadTexture2D('scenes/resources/googrid1.jpg'));
	 * @param {string} imageURL
	 * @param {object} settings passed to the {Texture} constructor
	 * @returns {Texture}
	 */
	TextureCreator.prototype.loadTexture2D = function (imageURL, settings, callback) {
		if (TextureCreator.cache[imageURL] !== undefined) {
			if(callback) {
				callback();
			}
			return TextureCreator.cache[imageURL];
		}

		var simpleResourceUtilCallback = {
			onSuccess: function (/* ArrayBuffer */response) {
				loader.load(response, rVal, creator.verticalFlip, 0, response.byteLength);
				TextureCreator._finishedLoading();
				if (callback) { callback(); }
			}.bind(this),
			onError: function (t) {
				console.warn("Error loading texture: " + imageURL + " | " + t);
			}.bind(this)
		};

		var creator = this;
		for (var extension in this.textureLoaders) {
			if (endsWith(imageURL.toLowerCase(), extension)) {
				var loader = this.textureLoaders[extension];

				if (!loader || !loader.isSupported()) {
					imageURL = imageURL.substring(0, imageURL.length - extension.length);
					imageURL += TextureCreator.UNSUPPORTED_FALLBACK;
					settings = settings || {};
					settings.flipY = false;
					break;
				}

				// make a dummy texture to fill on load = similar to normal
				// path, but using arraybuffer instead
				var rVal = new Texture(Util.clone(TextureCreator.DEFAULT_TEXTURE_2D.image), settings);
				rVal.image.dataReady = false;
				rVal.a = imageURL;

				TextureCreator.cache[imageURL] = rVal;

				// from URL
				this._loader.load(imageURL, null, Loader.ARRAY_BUFFER).then(simpleResourceUtilCallback.onSuccess, simpleResourceUtilCallback.onError);

				// return standin while we wait for texture to load.
				return rVal;
			}
		}

		if (TextureCreator.cache[imageURL] !== undefined) {
			if(callback) {
				callback();
			}
			return TextureCreator.cache[imageURL];
		}

		// Create a texture
		var texture = new Texture(null, settings);
		TextureCreator.cache[imageURL] = texture;

		// Load the actual image
		this._loader.loadImage(imageURL).then(function (data) {
			texture.setImage(data);
			TextureCreator._finishedLoading(data);
			if(callback) {
				callback();
			}
		}).then(null, function(err) {
			console.error(err);
		});

//		console.info("Loaded image: " + imageURL);

		return texture;
	};

	TextureCreator.prototype.loadTextureVideo = function (videoURL, loop) {
		if (TextureCreator.cache[videoURL] !== undefined) {
			return TextureCreator.cache[videoURL];
		}

		var video = document.createElement('video');
		video.loop = (typeof (loop) === 'boolean') ? loop : true;

		video.addEventListener('error', function () {
			console.warn('Couldn\'t load video URL [' + videoURL + ']');
		}, false);

		var texture = new Texture(video, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp'
		});

		texture.readyCallback = function () {
			if (video.readyState >= 3) {
				console.log('Video ready: ' + video.videoWidth + ', ' + video.videoHeight);
				video.width = video.videoWidth;
				video.height = video.videoHeight;

				// set minification filter based on pow2
				if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
					texture.generateMipmaps = false;
					texture.minFilter = 'BilinearNoMipMaps';
				}

				video.play();

				video.dataReady = true;
				return true;
			}
			return false;
		};

		texture.updateCallback = function () {
			return !video.paused;
		};

		video.crossOrigin = 'anonymous';

		video.src = videoURL;

		TextureCreator.cache[videoURL] = texture;

		return texture;
	};

	TextureCreator.prototype.loadTextureWebCam = function () {
		var video = document.createElement('video');
		video.autoplay = true;
		video.loop = true;

		var texture = new Texture(video, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp'
		});

		texture.readyCallback = function () {
			if (video.readyState >= 3) {
				console.log('WebCam video ready: ' + video.videoWidth + ', ' + video.videoHeight);
				video.width = video.videoWidth;
				video.height = video.videoHeight;

				// set minification filter based on pow2
				if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
					texture.generateMipmaps = false;
					texture.minFilter = 'BilinearNoMipMaps';
				}

				video.dataReady = true;
				return true;
			}
			return false;
		};
		texture.updateCallback = function () {
			return !video.paused;
		};

		// Webcam video
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, function (stream) {
				video.src = URL.createObjectURL(stream);
			}, function (e) {
				console.warn('Unable to capture WebCam. Please reload the page.', e);
			});
		} else {
			console.warn('No support for WebCam getUserMedia found!');
		}

		return texture;
	};

	/**
	 *
	 * @param {Array} imageDataArray Array containing images, image elements or image urls. [left, right, bottom, top, back, front]
	 * @returns {Texture} cubemap
	 */
	TextureCreator.prototype.loadTextureCube = function (imageDataArray, settings) {
		var texture = new Texture(null, settings);
		texture.variant = 'CUBE';
		var images = [];

		var latch = new Latch(6, {
			done: function () {
				var w = images[0].width;
				var h = images[0].height;
				for (var i = 0; i < 6; i++) {
					var img = images[i];
					if (w !== img.width || h !== img.height) {
						texture.generateMipmaps = false;
						texture.minFilter = 'BilinearNoMipMaps';
						console.error('Images not all the same size!');
					}
				}

				texture.setImage(images);
				texture.image.dataReady = true;
				texture.image.width = w;
				texture.image.height = h;
			}
		});

		var that = this;
		for (var i = 0; i < imageDataArray.length; i++) {
			/*jshint loopfunc: true */
			(function (index) {
				var queryImage = imageDataArray[index];
				if (typeof queryImage === 'string') {
					that._loader.loadImage(queryImage).then(function (image) {
						images[index] = image;
						latch.countDown();
					});
				} else {
					images[index] = queryImage;
					latch.countDown();
				}
			})(i);
		}

		return texture;
	};

	TextureCreator._globalCallback = null;
	TextureCreator._finishedLoading = function (image) {
		if (TextureCreator._globalCallback) {
			try {
				TextureCreator._globalCallback(image);
			} catch (e) {
				console.error('Error in texture callback:', e);
			}
		}
	};

	// Add Object.freeze when fast enough in browsers
	var colorInfo = new Uint8Array([255, 255, 255, 255]);
	TextureCreator.DEFAULT_TEXTURE_2D = new Texture(colorInfo, null, 1, 1);
	TextureCreator.DEFAULT_TEXTURE_CUBE = new Texture([colorInfo, colorInfo, colorInfo, colorInfo, colorInfo, colorInfo], null, 1, 1);
	TextureCreator.DEFAULT_TEXTURE_CUBE.variant = 'CUBE';

	return TextureCreator;
});

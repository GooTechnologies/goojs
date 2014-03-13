define([
	'goo/renderer/Texture',
	'goo/renderer/Util',
	'goo/loaders/handlers/TextureHandler',
	'goo/util/Ajax',
	'goo/util/StringUtil',
	'goo/util/Latch'
],
/** @lends */
function (
	Texture,
	Util,
	TextureHandler,
	Ajax,
	StringUtil,
	Latch
) {
	'use strict';

	//! AT: shouldn't this stay in util?

	/**
	 * @class Takes away the pain of creating textures of various sorts.
	 * @param {Settings} settings Texturing settings
	 */
	function TextureCreator() {
		var ajax = this.ajax = new Ajax();
		this.textureHandler = new TextureHandler(
			{},
			function (ref, options) {
				return ajax.load(ref, options ? options.noCache : false);
			},
			function () {},
			function (ref, options) {
				return ajax.load(ref, options ? options.noCache : false);
			}
		);
	}

	//! AT: unused?
	TextureCreator.UNSUPPORTED_FALLBACK = '.png';
	TextureCreator.clearCache = function () {};

	/**
	 * Creates a texture and loads image into it
	 * @example gridMaterial.setTexture('DIFFUSE_MAP', new TextureCreator().loadTexture2D('scenes/resources/googrid1.jpg'));
	 * @param {string} imageURL
	 * @param {object} settings passed to the {Texture} constructor
	 * @returns {Texture}
	 */
	TextureCreator.prototype.loadTexture2D = function (imageURL, settings, callback) {
		var id = StringUtil.createUniqueId('texture');
		settings = settings || {};
		settings.imageRef = imageURL;
		var texture = this.textureHandler._objects[id] = this.textureHandler._create();
		// texture.setImage(TextureHandler.WHITE, 1, 1);
		this.textureHandler.update(id, settings).then(function() {
			if (callback) {
				callback(texture);
			}
		});
		
		return texture;
	};

	TextureCreator.prototype.loadTextureVideo = function (videoURL, loop, settings, errorCallback) {
		var id = StringUtil.createUniqueId('texture');
		settings = settings || {};
		settings.imageRef = videoURL;
		settings.loop = loop;
		settings.wrapS = 'EdgeClamp';
		settings.wrapT = 'EdgeClamp';
		settings.autoPlay = true;

		var texture = this.textureHandler._objects[id] = this.textureHandler._create();

		this.textureHandler.update(id, settings, {
			texture: {
				dontwait: true
			}
		}).then(null, function(err) {
			errorCallback(err);
		});

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
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, function (stream) {
				video.src = window.URL.createObjectURL(stream);
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
					that.ajax._loadImage(queryImage).then(function (image) {
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

	//! AT: unused
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

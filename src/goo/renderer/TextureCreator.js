var Texture = require('../renderer/Texture');
var MathUtils = require('../math/MathUtils');
var TextureHandler = require('../loaders/handlers/TextureHandler');
var Ajax = require('../util/Ajax');
var StringUtils = require('../util/StringUtils');
var PromiseUtils = require('../util/PromiseUtils');
var RSVP = require('../util/rsvp');

//! AT: shouldn't this stay in util?

/**
 * Takes away the pain of creating textures of various sorts.
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
 * Releases any references to cached objects
 */
TextureCreator.prototype.clear = function () {
	this.ajax.clear();
	this.textureHandler.clear();
};

/**
 * Creates a texture and loads an image into it.
 * @param {string} imageUrl
 * @param {Object} settings passed to the {Texture} constructor
 * @returns {RSVP.Promise} Returns a promise that will resolve with the created Texture.
 * @example
 * new TextureCreator().loadTexture2D('goo.jpg').then(function (texture) {
 *     material.setTexture('DIFFUSE_MAP', texture);
 * }, function () {
 *     console.error('Error loading image.');
 * });
 */
TextureCreator.prototype.loadTexture2D = function (imageUrl, settings) {
	var id = StringUtils.createUniqueId('texture');
	settings = settings || {};
	settings.imageRef = imageUrl;

	var texture = this.textureHandler._create();
	this.textureHandler._objects.set(id, texture);
	return this.textureHandler.update(id, settings);
};

/**
 * Creates a texture and loads a video into it
 * @param {string} videoURL
 * @param {Object} [options]
 * @param {boolean} [options.loop=true]
 * @param {boolean} [options.autoPlay=true]
 * @param {boolean} [options.wrapS='EdgeClamp']
 * @param {boolean} [options.wrapT='EdgeClamp']
 * @returns {RSVP.Promise} Returns a promise that will resolve with the created Texture.
 * @example
 * new TextureCreator().loadTexture2D('goo.mp4').then(function (texture) {
 *     material.setTexture('DIFFUSE_MAP', texture);
 * }, function () {
 *     console.error('Error loading video texture.');
 * });
 */
TextureCreator.prototype.loadTextureVideo = function (videoURL, options) {
	var id = StringUtils.createUniqueId('texture');
	options = options || {};
	options.imageRef = videoURL;
	options.loop = options.loop !== undefined ? options.loop : true;
	options.wrapS = options.wrapS !== undefined ? options.wrapS : 'EdgeClamp';
	options.wrapT = options.wrapT !== undefined ? options.wrapT : 'EdgeClamp';
	options.autoPlay = options.autoPlay !== undefined ? options.autoPlay : true;
	options.texture = options.texture !== undefined ? options.texture : { dontwait: true };

	var texture = this.textureHandler._create();
	this.textureHandler._objects.set(id, texture);

	return this.textureHandler.update(id, options, options);
};

/**
 * Creates a video texture streamed from the webcam.
 * @returns {RSVP.Promise} A promise that will resolve with the created Texture.
 * @example
 * new TextureCreator().loadTextureWebCam().then(function (texture) {
 *     material.setTexture('DIFFUSE_MAP', texture);
 * }, function () {
 *     console.error('Error loading webcam texture.');
 * });
 */
TextureCreator.prototype.loadTextureWebCam = function () {

	return PromiseUtils.createPromise(function (resolve, reject) {
		var video = document.createElement('video');
		video.autoplay = true;
		video.loop = true;

		var texture = new Texture(video, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp'
		});

		texture.readyCallback = function () {
			if (video.readyState >= 3) {
				video.width = video.videoWidth;
				video.height = video.videoHeight;

				// set minification filter based on pow2
				if (!(MathUtils.isPowerOfTwo(video.width) && MathUtils.isPowerOfTwo(video.height))) {
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
				resolve(texture);
			}, reject);
		} else {
			reject(new Error('No support for WebCam getUserMedia found!'));
		}
	});
};

/**
 * Loads an array of six images into a Texture.
 * @param {Array} imageDataArray Array containing images, image elements or image urls. [left, right, bottom, top, back, front]
 * @param {Object} settings Settings object to pass to the Texture constructor
 * @returns {RSVP.Promise} A promise that will resolve with the resulting Texture
 */
TextureCreator.prototype.loadTextureCube = function (imageDataArray, settings) {
	var texture = new Texture(null, settings);
	texture.variant = 'CUBE';

	var promises = imageDataArray.map(function (queryImage) {
		return PromiseUtils.createPromise(function (resolve, reject) {
			if (typeof queryImage === 'string') {
				this.ajax._loadImage(queryImage).then(resolve, reject);
			} else {
				resolve(queryImage);
			}
		}.bind(this));
	}.bind(this));

	return RSVP.all(promises).then(function (images) {
		return PromiseUtils.createPromise(function (resolve, reject) {
			var width = images[0].width;
			var height = images[0].height;
			for (var i = 0; i < 6; i++) {
				var image = images[i];
				if (width !== image.width || height !== image.height) {
					texture.generateMipmaps = false;
					texture.minFilter = 'BilinearNoMipMaps';
					reject(new Error('The images passed to loadTextureCube() must be of the same size!'));
					return;
				}
			}

			texture.setImage(images);
			texture.image.dataReady = true;
			texture.image.width = width;
			texture.image.height = height;

			resolve(texture);
		});
	});
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

module.exports = TextureCreator;

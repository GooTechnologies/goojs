define(['goo/renderer/Loader', 'goo/renderer/Texture', 'goo/loaders/dds/DdsLoader', 'goo/util/SimpleResourceUtil', 'goo/renderer/Util'],
	/** @lends TextureCreator */
	function (Loader, Texture, DdsLoader, SimpleResourceUtil, Util) {
	"use strict";

	/**
	 * @class TBD
	 * @param {Settings} settings Texturing settings
	 */
	function TextureCreator(settings) {
		settings = settings || {};

		this.verticalFlip = settings.verticalFlip !== undefined ? settings.verticalFlip : true;

		this.textureLoaders = {
			// '.png' : 'loader1',
			'.dds' : new DdsLoader()
		};
	}

	TextureCreator.cache = {};
	TextureCreator.UNSUPPORTED_FALLBACK = '.png';

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	TextureCreator.prototype.loadTexture2D = function (imageURL) {
		var creator = this;
		for (var extension in this.textureLoaders) {
			if (endsWith(imageURL.toLowerCase(), extension)) {
				var loader = this.textureLoaders[extension];
				console.log(extension + ' - ' + loader);

				if (!loader || !loader.isSupported()) {
					imageURL = imageURL.substring(0, imageURL.length - extension.length);
					imageURL += TextureCreator.UNSUPPORTED_FALLBACK;
					break;
				}

				// check for cache version
				if (TextureCreator.cache[imageURL] !== undefined) {
					return TextureCreator.cache[imageURL];
				}

				// make a dummy texture to fill on load = similar to normal
				// path, but using arraybuffer instead
				var rVal = new Texture(Util.clone(TextureCreator.DEFAULT_TEXTURE_2D.image));
				rVal.image.dataReady = false;
				rVal.a = imageURL;

				// from URL
				SimpleResourceUtil.loadBinaryAsArrayBuffer(imageURL, {
					onSuccess : function (/* ArrayBuffer */response) {
						loader.load(response, rVal, creator.verticalFlip, 0, response.byteLength);
						console.info("Loaded image: " + imageURL);
						// callLoadCallback(url);
					},
					onError : function (t) {
						console.warn("Error loading texture: " + imageURL + " | " + t);
					}
				});

				// return standin while we wait for texture to load.
				return rVal;
			}
		}

		if (TextureCreator.cache[imageURL] !== undefined) {
			return TextureCreator.cache[imageURL];
		}

		var img = new Loader().loadImage(imageURL);
		var texture = new Texture(img);

		TextureCreator.cache[imageURL] = texture;

		return texture;
	};

	TextureCreator.prototype.loadTextureVideo = function (videoURL) {
		if (TextureCreator.cache[videoURL] !== undefined) {
			return TextureCreator.cache[videoURL];
		}

		var video = document.createElement('video');
		video.loop = true;

		video.addEventListener('error', function () {
			console.warning('Couldn\'t load video URL [' + videoURL + ']');
		}, false);

		var texture = new Texture(video, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
		});

		texture.readyCallback = function () {
            if (video.readyState >= 3) {
                console.log('video ready: ' + video.videoWidth + ', ' + video.videoHeight);
				video.width = video.videoWidth;
				video.height = video.videoHeight;

                // set minification filter based on pow2
                if (Util.isPowerOfTwo(video.width) === false
                        || Util.isPowerOfTwo(video.height) === false) {
            		texture.generateMipmaps = false;
            		texture.minFilter = 'BilinearNoMipMaps';
                }

                // if (autoPlay) {
                    video.play();
                // }

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
		video.width = 320;
		video.height = 240;
		video.autoplay = true;
		video.loop = true;

		var texture = new Texture(video, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
		});

		texture.readyCallback = function () {
			if (video.readyState >= 3) {
				console.log('video ready: ' + video.videoWidth + ', ' + video.videoHeight);
				video.width = video.videoWidth;
				video.height = video.videoHeight;

				// set minification filter based on pow2
				if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
					texture.generateMipmaps = false;
					texture.minFilter = 'BilinearNoMipMaps';
				}

				// if (autoPlay) {
				video.play();
				// }

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
		// get webcam
		navigator.getUserMedia({
			video: true
		}, function (stream) {
			// on webcam enabled
			video.src = window.URL.createObjectURL(stream);
			// prompt.style.display = 'none';
			// title.style.display = 'inline';
			// container.style.display = 'inline';
			// gui.domElement.style.display = 'inline';
		}, function (error) {
			console.warning('Unable to capture WebCam. Please reload the page.');
		});

		return texture;
	};

	TextureCreator.prototype.loadTextureCube = function (imageURLs) {
		var latch = 6;
		var texture = new Texture();
		texture.variant = 'CUBE';
		var images = [];

		for (var i = 0; i < imageURLs.length; i++) {
			(function (index) {
				new Loader().loadImage(imageURLs[index], {
					onSuccess : function (image) {
						images[index] = image;
						latch--;
						if (latch <= 0) {
							texture.setImage(images);
							texture.image.dataReady = true;
							texture.image.isData = false;
							texture.image.width = image.width;
							texture.image.height = image.height;
						}
					},
					onError : function (message) {
						console.error(message);
					}
				});
			})(i);
		}

		return texture;
	};

	// TODO: add Object.freeze?
	var colorInfo = new Uint8Array([255, 255, 255, 255]);
	TextureCreator.DEFAULT_TEXTURE_2D = new Texture(colorInfo, null, 1, 1);
	TextureCreator.DEFAULT_TEXTURE_CUBE = new Texture([colorInfo, colorInfo, colorInfo, colorInfo, colorInfo, colorInfo], null, 1, 1);
	TextureCreator.DEFAULT_TEXTURE_CUBE.variant = 'CUBE';

	return TextureCreator;
});

define(['goo/renderer/Loader', 'goo/renderer/Texture', 'goo/loaders/dds/DdsLoader', 'goo/util/SimpleResourceUtil'], function(Loader, Texture,
	DdsLoader, SimpleResourceUtil) {
	"use strict";

	/**
	 * @name TextureCreator
	 * @class TBD
	 * @param {Settings} settings Texturing settings
	 */
	function TextureCreator(settings) {
		settings = settings || {};

		this.verticalFlip = settings.verticalFlip || true;
		this.storeFormat = settings.storeFormat || 'RGBA'; // Alpha, RGB, RGBA,
		// Luminance,
		// LuminanceAlpha;
		this.minFilter = settings.verticalFlip || 'Trilinear';

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

	TextureCreator.prototype.loadTexture2D = function(imageURL) {
		for ( var extension in this.textureLoaders) {
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
				var rVal = new Texture(TextureCreator.DEFAULT_TEXTURE.image);

				// from URL
				SimpleResourceUtil.loadBinaryAsArrayBuffer(imageURL, {
					onSuccess : function(/* ArrayBuffer */response) {
						// TextureCreator.logger.fine("Loading dds: " + url);
						loader.load(response, rVal, this.verticalFlip, 0, response.byteLength);

						// callLoadCallback(url);
					},
					onError : function(t) {
						console.warn("Error loading texture: " + url + " | " + t);
						TextureState.getDefaultTexture().createSimpleClone(rVal);
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
		// var key = TextureKey.getKey(null, this.verticalFlip,
		// this.storeFormat, img.getUrl(), this.minFilter);
		// var tex = findOrCreateTexture2D(key);
		var texture = new Texture(img);
		// queueImageLoad(img, texture);

		TextureCreator.cache[imageURL] = texture;

		return texture;
	};

	TextureCreator.DEFAULT_TEXTURE = new Texture(new Loader().loadImage('resources/checkerboard.png'));

	return TextureCreator;
});
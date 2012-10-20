"use strict";

define([ 'goo/renderer/Loader', 'goo/renderer/Texture' ], function(Loader, Texture) {
	function TextureCreator(settings) {
		settings = settings || {};

		this.verticalFlip = settings.verticalFlip || true;
		this.storeFormat = settings.storeFormat || 'RGBA'; // Alpha, RGB, RGBA,
		// Luminance,
		// LuminanceAlpha;
		this.minFilter = settings.verticalFlip || 'Trilinear';

		this.textureLoaders = {
		// '.png' : 'loader1',
		// '.dds' : 'loader2'
		};
	}

	TextureCreator.UNSUPPORTED_FALLBACK = '.png';

	TextureCreator.prototype.loadTexture2D = function(imageURL) {
		for (extension in this.textureLoaders) {
			if (imageURL.toLowerCase().endsWith(extension)) {
				var loader = this.textureLoaders[extension];
				console.log(extension + ' - ' + loader);

				if (!loader || !loader.isSupported) {
					imageURL = imageURL.substring(0, imageURL.length() - extension.length());
					imageURL += TextureCreator.UNSUPPORTED_FALLBACK;
					break;
				}

				// create a key
				var key = TextureKey.getKey(null, _verticalFlip, _storeFormat, imageURL, _minFilter);
				// check for cache version
				var cached = findTexture2D(key);
				if (cached !== null) {
					return cached;
				}

				// make a dummy texture to fill on load = similar to normal
				// path, but using arraybuffer instead
				var rVal = creatureNewTexture2D(key);

				// from URL
				var resourceLoader = new RequestBuilderResourceLoader();
				var url = imageURL;
				var finalLoader = loader;
				resourceLoader.loadBinaryAsArrayBuffer(url, {
					onSuccess : function(/* ArrayBuffer */response) {
						// TextureCreator.logger.fine("Loading dds: " + url);
						finalLoader.load(response, rVal, key.isFlipped(), 0, response.getByteLength());

						callLoadCallback(url);
					},
					onError : function(t) {
						TextureCreator.logger.log(Level.SEVERE, "Error loading texture: " + url, t);
						TextureState.getDefaultTexture().createSimpleClone(rVal);
					}
				});

				// return standin while we wait for texture to load.
				return rVal;
			}
		}

		var img = new Loader().loadImage(imageURL, {
			onSuccess : function(image) {
				image.dataReady = true;
			}
		});
		// var key = TextureKey.getKey(null, this.verticalFlip,
		// this.storeFormat, img.getUrl(), this.minFilter);
		// var tex = findOrCreateTexture2D(key);
		var texture = new Texture(img);
		// queueImageLoad(img, texture);
		return texture;
	};

	TextureCreator.DEFAULT_TEXTURE = new Texture();

	return TextureCreator;
});
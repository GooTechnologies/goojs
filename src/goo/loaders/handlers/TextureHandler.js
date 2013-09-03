define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/loaders/dds/DdsLoader',
	'goo/loaders/crunch/CrunchLoader',
	'goo/loaders/tga/TgaLoader',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/renderer/Util',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	TextureCreator,
	Texture,
	DdsLoader,
	CrunchLoader,
	TgaLoader,
	RSVP,
	pu,
	ru,
	_
) {
	/*
	 Options:
	 {bool} dontWaitForTextures if true, return promise that resolves once the texture object is created, don't wait
	 for the image to load. Defaults to false.
	 */
	function TextureHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	TextureHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('texture', TextureHandler);

	TextureHandler.loaders = {
		dds: DdsLoader,
		crn: CrunchLoader,
		tga: TgaLoader
	};

	TextureHandler.prototype._create = function(ref, config) {
		_.defaults(config, {
			verticalFlip: true
		});

		var settings = {
			wrapS: config.wrapU,
			wrapT: config.wrapV,
			magFilter: config.magFilter,
			minFilter: config.minFilter,
			repeat: config.repeat,
			offset: config.offset
		};

		var texture = this._objects[ref] = new Texture(ru.clone(TextureCreator.DEFAULT_TEXTURE_2D.image), settings);
		texture.image.dataReady = false;

		return texture;
	};

	TextureHandler.prototype.update = function(ref, config) {
		//var imgRef, loadedPromise, tc, texture, textureLoader, type, _ref,
		var that = this;

		var imgRef = config.url;
		var type = (imgRef != null) ? imgRef.split('.').pop().toLowerCase() : void 0;

		var texture, loadedPromise;
		if (type === 'mp4') {
			loadedPromise = new RSVP.Promise();
			var tc = new TextureCreator();
			texture = tc.loadTextureVideo(config.url, true);

			return pu.createDummyPromise(texture);
		} else {
			texture = this._objects[ref];
			if (!texture) {
				texture = this._create(ref, config);
			}
			if (!config.url) {
				console.log("Texture " + ref + " has no url");

				return pu.createDummyPromise(texture);
			}
			if (type in TextureHandler.loaders) {
				var textureLoader = new TextureHandler.loaders[type]();
				texture.a = imgRef;
				loadedPromise = this.getConfig(imgRef).then(function(data) {
					textureLoader.load(data, texture, config.verticalFlip, 0, data.byteLength);

					return texture;
				}).then(null, function(e) {
					return console.error("Error loading texture: ", e);
				});
			} else if (type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif') {
				loadedPromise = this.getConfig(imgRef).then(function(data) {
					texture.setImage(data);
					return texture;
				}).then(null, function(e) {
					return console.error("Error loading texture: ", e);
				});
			} else {
				throw new Error("Unknown texture type " + type);
			}
		}
		if (this.options != null && this.options.dontWaitForTextures) {
			// We don't wait for images to load
			return pu.createDummyPromise(texture);
		} else {
			return loadedPromise;
		}
	};

	TextureHandler.prototype.remove = function(ref) {
		console.log("Deleting texture " + ref);
		return delete this._objects[ref];
	};

	return TextureHandler;
});

define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Texture',
	'goo/loaders/dds/DdsLoader',
	'goo/loaders/crunch/CrunchLoader',
	'goo/loaders/tga/TgaLoader',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/renderer/Util',
	'goo/util/ObjectUtil',
	'goo/util/CanvasUtils',
	'goo/util/StringUtil'
],
/** @lends */
function (
	ConfigHandler,
	Texture,
	DdsLoader,
	CrunchLoader,
	TgaLoader,
	RSVP,
	PromiseUtil,
	Util,
	_,
	CanvasUtils,
	StringUtil
) {
	'use strict';

	/*jshint eqeqeq: false, -W041 */
	/**
	 * @class Handler for loading materials into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function TextureHandler() {
		ConfigHandler.apply(this, arguments);
	}

	TextureHandler.prototype = Object.create(ConfigHandler.prototype);
	TextureHandler.prototype.constructor = TextureHandler;
	ConfigHandler._registerClass('texture', TextureHandler);

	TextureHandler.minFilters = [
		'NearestNeighborNoMipMaps',
		'NearestNeighborNearestMipMap',
		'NearestNeighborLinearMipMap',
		'BilinearNoMipMaps',
		'BilinearNearestMipMap',
		'Trilinear'
	];
	TextureHandler.magFilters = [
		'NearestNeighbor',
		'Bilinear'
	];

	TextureHandler.loaders = {
		dds: DdsLoader,
		crn: CrunchLoader, // TODO: not working atm.
		tga: TgaLoader
	};

	// Dummy textures to use while loading image
	TextureHandler.WHITE = new Uint8Array([255, 255, 255, 255]);
	TextureHandler.BLACK = new Uint8Array([0, 0, 0, 255]);

	/**
	 * Preparing texture config by populating it with defaults.
	 * @param {object} config
	 * @private
	 */
	TextureHandler.prototype._prepare = function (config) {
		_.defaults(config, {
			wrapS: 'Repeat',
			wrapT: 'Repeat',
			magFilter: 'Bilinear',
			minFilter: 'Trilinear',
			anisotropy: 1,
			offset: [0, 0],
			repeat: [1, 1],
			flipY: true,
			lodBias: 0.0,
			loop: true
		});
	};

	/**
	 * Removes a texture
	 * @param {ref}
	 * @private
	 */
	TextureHandler.prototype._remove = function (ref) {
		var texture = this._objects.get(ref);
		if (texture && this.world.gooRunner) {
			texture.destroy(this.world.gooRunner.renderer.context);
		}
		this._objects.delete(ref);
	};

	/**
	 * Creates an empty Texture.
	 * @param {string} ref will be the entity's id
	 * @returns {Texture}
	 * @private
	 */
	TextureHandler.prototype._create = function () {
		return new Texture();
	};

	/**
	 * Adds/updates/removes a texture
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated texture or null if removed
	 */
	TextureHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (texture) {
			if (!texture) { return; }
			var ret;

			// Texture settings
			texture.wrapS = config.wrapS;
			texture.wrapT = config.wrapT;

			if (TextureHandler.magFilters.indexOf(config.magFilter) !== -1) {
				texture.magFilter = config.magFilter;
			}
			if (TextureHandler.minFilters.indexOf(config.minFilter) !== -1) {
				texture.minFilter = config.minFilter;
			}

			texture.anisotropy = Math.max(config.anisotropy, 1);

			texture.offset.setArray(config.offset);
			texture.repeat.setArray(config.repeat);
			texture.lodBias = config.lodBias;

			if (texture.flipY !== config.flipY) {
				texture.flipY = config.flipY;
				texture.setNeedsUpdate();
			}

			if (texture.generateMipmaps !== config.generateMipmaps) {
				texture.generateMipmaps = config.generateMipmaps !== false;
				texture.setNeedsUpdate();
			}

			texture.updateCallback = null;

			var imageRef = config.imageRef;
			if (imageRef) {
				var path = StringUtil.parseURL(imageRef).path;
				var type = path.substr(path.lastIndexOf('.') + 1).toLowerCase();
				var Loader = TextureHandler.loaders[type];
				if (Loader) {
					// Special (dds, tga, crn)
					texture.a = imageRef;
					ret = that.loadObject(imageRef).then(function (data) {
						if (data && data.preloaded) {
							_.extend(texture.image, data.image);
							texture.format = data.format;
							texture.setNeedsUpdate();
							return texture;
						}
						var loader = new Loader();
						loader.load(data, texture, config.flipY, 0, data.byteLength);
						return texture;
					});
				} else if (['jpg', 'jpeg', 'png', 'gif'].indexOf(type) !== -1) {
					// Images
					// Beware of image caching but should be handled by Ajax
					ret = that.loadObject(imageRef, options).then(function (image) {
						if (texture.image !== image) {
							texture.setImage(image);
						}
						return texture;
					});
				} else if (['mp4', 'ogv', 'webm'].indexOf(type) !== -1) {
					// Video
					ret = that.loadObject(imageRef, options).then(function (video) {
						video.width = video.videoWidth;
						video.height = video.videoHeight;
						video.loop = config.loop !== undefined ? config.loop : true;
						if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
							texture.generateMipmaps = false;
							texture.minFilter = 'BilinearNoMipMaps';
						}
						texture.setImage(video);
						texture.updateCallback = function () {
							return !video.paused;
						};
						if (config.autoPlay === undefined || config.autoPlay) {
							video.play();
						}
						return texture;
					});
				} else {
					throw new Error('Unknown texture type');
				}
			} else if (config.svgData) {
				// Load SVG data
				ret = PromiseUtil.createPromise(function (resolve, reject) {
					CanvasUtils.renderSvgToCanvas(config.svgData, {}, function (canvas) {
						if (canvas) {
							texture.setImage(canvas);
							resolve(texture);
						} else {
							reject('could not render svg to canvas');
						}
					});
				});
			} else {
				// Blank
				// console.warn('Texture ' + ref + ' has no imageRef');
				// texture.setImage(TextureHandler.WHITE, 1, 1);
				ret = texture;
			}
			if (options && options.texture && options.texture.dontwait) {
				return texture;
			} else {
				return ret;
			}
		});
	};

	return TextureHandler;
});

define([
	'goo/math/Vector2'
],
/** @lends */
function (
	Vector2
) {
	'use strict';

	/**
	 * @class <code>Texture</code> defines a texture object to be used to display an image on a piece of geometry. The image to be displayed is
	 *        defined by the <code>Image</code> class. All attributes required for texture mapping are contained within this class. This includes
	 *        mipmapping if desired, magnificationFilter options, apply options and correction options. Default values are as follows:
	 *        minificationFilter - NearestNeighborNoMipMaps, magnificationFilter - NearestNeighbor, wrap - EdgeClamp on S,T and R, apply - Modulate,
	 *        environment - None.
	 * @param {Image} image Image to use as base for texture
	 * @param {object} settings Texturing settings
	 * @param {string} [settings.wrapS='Repeat'] possible values:
	 *		<ul>
	 *			<li>'Repeat' = Repeat texture (ignore integer part of texture coords)
	 *			<li>'MirroredRepeat' = Repeat with reversed direction on odd integer part of texture coords
	 *			<li>'EdgeClamp' = Clamp texture coord range to 0..1 and use edge color
	 *		</ul>
	 * @param {string} [settings.wrapT='Repeat'] possible values:
	 *		<ul>
	 *			<li>'Repeat' = Repeat texture (ignore integer part of texture coords)
	 *			<li>'MirroredRepeat' = Repeat with reversed direction on odd integer part of texture coords
	 *			<li>'EdgeClamp' = Clamp texture coord range to 0..1 and use edge color
	 *		</ul>
	 * @param {string} [settings.magFilter='Bilinear'] possible values:
	 *		<ul>
	 *			<li>'NearestNeighbor' =
	 *			<li>'Bilinear' =
	 *		</ul>
	 * @param {string} [settings.minFilter='TriLinear'] possible values:
	 *		<ul>
	 *			<li>'NearestNeighborNoMipMaps' =
	 *			<li>'NearestNeighborNearestMipMap' =
	 *			<li>'NearestNeighborLinearMipMap' =
	 *			<li>'BilinearNoMipMaps' =
	 *			<li>'BilinearNearestMipMap' =
	 *			<li>'Trilinear' =
	 *		</ul>
	 * @param {number} [settings.anisotropy=1] Amount of anisotropic filtering (1=1x, 4=4x etc, max usually 4 or 16. Card max in Capabilities.maxAnisotropy)
	 * @param {string} [settings.format='RGBA'] possible values:
	 *		<ul>
	 *			<li>'RGBA' =
	 *			<li>'RGB' =
	 *			<li>'Alpha' =
	 *			<li>'Luminance' =
	 *			<li>'LuminanceAlpha' =
	 *		</ul>
	 * @param {string} [settings.type='UnsignedByte'] possible values:
	 *		<ul>
	 *			<li>'UnsignedByte' =
	 *			<li>'UnsignedShort565' =
	 *			<li>'UnsignedShort4444' =
	 *			<li>'UnsignedShort5551' =
	 *			<li>'Float' =
	 *		</ul>
	 * @param {Array} [settings.offset=(0,0)] Texture offset
	 * @param {Array} [settings.repeat=(1,1)] Texture repeat/scale
	 * @param {boolean} [settings.generateMipmaps='true'] Automatically generate mipmaps
	 * @param {boolean} [settings.premultiplyAlpha='false'] Premultiply alpha
	 * @param {number} [settings.unpackAlignment=1] Unpack alignment setting
	 * @param {boolean} [settings.flipY='true'] Flip texture in y-axis
	 * @param {number} width Width of the texture
	 * @param {number} height Height of the texture
	 */
	function Texture(image, settings, width, height) {
		this.glTexture = null;

		settings = settings || {};

		this.wrapS = settings.wrapS || 'Repeat';
		this.wrapT = settings.wrapT || 'Repeat';

		this.magFilter = settings.magFilter || 'Bilinear';
		this.minFilter = settings.minFilter || 'Trilinear';

		/**
		 * The anisotropic filtering level.<br>
		 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/renderer/texture/AnisotropicFiltering/Anisotropic-vtest.html Working example}
		 * @type {number}
		 */
		this.anisotropy = settings.anisotropy !== undefined ? settings.anisotropy : 1;

		this.format = settings.format || 'RGBA';
		this.type = settings.type || 'UnsignedByte';
		this.variant = '2D'; // CUBE

		this.offset = new Vector2(settings.offset || [0, 0]);
		this.repeat = new Vector2(settings.repeat || [1, 1]);
		this.lodBias = 0.0;

		this.generateMipmaps = settings.generateMipmaps !== undefined ? settings.generateMipmaps : true;
		this.premultiplyAlpha = settings.premultiplyAlpha !== undefined ? settings.premultiplyAlpha : false;
		this.unpackAlignment = settings.unpackAlignment !== undefined ? settings.unpackAlignment : 1;
		this.flipY = settings.flipY !== undefined ? settings.flipY : true;

		this.hasBorder = false;

		this.needsUpdate = false;
		this.updateCallback = null;
		this.readyCallback = null;

		this._originalImage = null;
		this._originalWidth = 0;
		this._originalHeight = 0;

		this.image = null;
		if (image) {
			this.setImage(image, width, height, settings);
		}

		this.textureRecord = {};
	}

	/**
	* Checks if the texture's data is ready.
	* @return {Boolean} True if ready.
	*/
	Texture.prototype.checkDataReady = function () {
		return this.image && (this.image.dataReady || this.image instanceof HTMLImageElement) || this.readyCallback !== null && this.readyCallback();
	};

	/**
	* Checks if the texture needs an update.
	* @return {Boolean} True if needed.
	*/
	Texture.prototype.checkNeedsUpdate = function () {
		//! AT: what's the precedence here? || first and then && or the other way around?
		return this.needsUpdate || this.updateCallback !== null && this.updateCallback();
	};

	/**
	 * Marks the texture as needing to be updated by the engine.
	 */
	Texture.prototype.setNeedsUpdate = function () {
		this.needsUpdate = true;
	};

	//! AT: this takes the same parameters as the Texture function but in a different order!
	/**
	 * Sets an image on the texture object.
	 *
	 * @param {Image} image The image to set. Can be an Image, TypedArray or an array of Images (for cubemaps)
	 * @param {Number} [width]
	 * @param {Number} [height]
	 */
	Texture.prototype.setImage = function (image, width, height, settings) {
		//! AT: this is not a general pattern; it is applied here only because of the complexity of this function
		this._originalImage = image;

		this.image = image; //! AT: is this always overriden? if so then why set it?

		var data = image instanceof Array ? image[0] : image;
		if (data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Uint16Array || data instanceof Float32Array) {
			width = width || image.width;
			height = height || image.height;
			if (width !== undefined && height !== undefined) {
				this.image = {
					data: image,
					width: width,
					height: height,
					isData: true,
					dataReady: true
				};

				if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
					this.type = 'UnsignedByte';
				} else if (data instanceof Uint16Array) {
					this.type = 'UnsignedShort565';
					this.format = settings.format || 'RGB';
				} else if (data instanceof Float32Array) {
					this.type = 'Float';
					this.format = settings.format || 'RGBA';
				}
			} else {
				throw new Error('Data textures need width and height');
			}
		} else {
			if (image instanceof Array) {
				this.image = {
					data: image
				};
			}
			if (data instanceof HTMLCanvasElement) {
				this.image.dataReady = true;
			}
		}
		this.setNeedsUpdate();

		//! AT: this is not a general pattern; it is applied here only because of the complexity of this function
		// these are delayed here in case width and height are modified in this function
		this._originalWidth = width;
		this._originalHeight = height;
	};

	/**
	 * Releases the allocated texture
	 * @param {WebGLRenderingContext} context
	 */
	Texture.prototype.destroy = function (context) {
		context.deleteTexture(this.glTexture);
		this.glTexture = null;
	};

	/**
	 * Returns the number of bytes this texture occupies in memory
	 * @returns {number}
	 */
	Texture.prototype.getSizeInMemory = function () {
		var size;

		if (!this.image) { return 0; }
		var width = this.image.width || this.image.length;
		var height = this.image.height || 1;

		size = width * height;

		if (this.format === 'Luminance' || this.format === 'Alpha') {
			size *= 1;
		} else if (this.format === 'Lumin`anceAlpha') {
			size *= 2;
		} else if (this.format === 'RGB') {
			size *= 3; // some dubious video cards may use 4 bits anyway
		} else if (this.format === 'RGBA') {
			size *= 4;
		} else if (this.format === 'PrecompressedDXT1') {
			size *= 4 / 8; // 8 : 1 ratio
		} else if (this.format === 'PrecompressedDXT1A') {
			size *= 4 / 6; // 6 : 1 ratio
		} else if (this.format === 'PrecompressedDXT3' || this.format === 'PrecompressedDXT5') {
			size *= 4 / 4; // 4 : 1 ratio
		}

		// account for mip maps
		if (this.generateMipmaps) {
			size = Math.ceil(size * 4 / 3);
		}

		return size;
	};

	/**
	 * Returns a clone of this plane
	 * @returns {Texture}
	 */
	Texture.prototype.clone = function () {
		// reconstructing original settings object passed to the constructor
		var settings = {
			wrapS: this.wrapS,
			wrapT: this.wrapT,
			magFilter: this.magFilter,
			minFilter: this.minFilter,
			anisotropy: this.anisotropy,
			format: this.format,
			type: this.type,
			offset: this.offset,
			repeat: this.repeat,
			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment,
			flipY: this.flipY
		};

		var clone = new Texture(this._originalImage, settings, this._originalWidth, this._originalHeight);
		clone.variant = this.variant;
		clone.lodBias = this.lodBias;
		clone.hasBorder = this.hasBorder;
		return clone;
	};

	Texture.CUBE_FACES = ['PositiveX', 'NegativeX', 'PositiveY', 'NegativeY', 'PositiveZ', 'NegativeZ'];

	return Texture;
});
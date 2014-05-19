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
	 * @param {number} [settings.anisotropy=1] Amount of anisotropic filtering (1=1x, 4=4x etc, max usually 4 or 16. Card max in renderer.capabilities.maxAnisotropy)
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
	 */
	function Texture(image, settings, width, height) {
		this.glTexture = null;

		settings = settings || {};

		this.wrapS = settings.wrapS || 'Repeat';
		this.wrapT = settings.wrapT || 'Repeat';

		this.magFilter = settings.magFilter || 'Bilinear';
		this.minFilter = settings.minFilter || 'Trilinear';

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

		if (image) {
			this.setImage(image, width, height, settings);
		}
	}

	Texture.prototype.checkDataReady = function () {
		return this.image && (this.image.dataReady || this.image instanceof HTMLImageElement) || this.readyCallback !== null && this.readyCallback();
	};

	Texture.prototype.checkNeedsUpdate = function () {
		return this.needsUpdate || this.updateCallback !== null && this.updateCallback();
	};

	/**
	 * Marks the texture as needing to be updated by the engine.
	 */
	Texture.prototype.setNeedsUpdate = function () {
		this.needsUpdate = true;
	};

	/**
	 * Sets an image on the texture object.
	 *
	 * @param {Image} image The image to set. Can be an Image, TypedArray or an array of Images (for cubemaps)
	 * @param {Number} [width]
	 * @param {Number} [height]
	 */
	Texture.prototype.setImage = function (image, width, height, settings) {
		this.image = image;

		var data = image instanceof Array ? image[0] : image;
		if (data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Uint16Array || data instanceof Float32Array) {
			width = width || image.width;
			height = height || image.height;
			if (width !== undefined && height !== undefined) {
				this.image = {
					data: image
				};
				this.image.width = width;
				this.image.height = height;
				this.image.isData = true;
				this.image.dataReady = true;
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
				throw 'Data textures need width and height';
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
	};

	/**
	 * Releases the allocated texture
	 * @param {WebGLRenderingContext} context
	 */
	Texture.prototype.destroy = function (context) {
		context.deleteTexture(this.glTexture);
	};

	Texture.CUBE_FACES = ['PositiveX', 'NegativeX', 'PositiveY', 'NegativeY', 'PositiveZ', 'NegativeZ'];

	return Texture;
});
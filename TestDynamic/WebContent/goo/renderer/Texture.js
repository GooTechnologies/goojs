define(['goo/renderer/Loader', 'goo/math/Vector3', 'goo/math/Vector2'], function(Loader, Vector3, Vector2) {
	"use strict";

	/**
	 * @name Texture
	 * @class <code>Texture</code> defines a texture object to be used to display an image on a piece of geometry. The image to be displayed is
	 *        defined by the <code>Image</code> class. All attributes required for texture mapping are contained within this class. This includes
	 *        mipmapping if desired, magnificationFilter options, apply options and correction options. Default values are as follows:
	 *        minificationFilter - NearestNeighborNoMipMaps, magnificationFilter - NearestNeighbor, wrap - EdgeClamp on S,T and R, apply - Modulate,
	 *        environment - None.
	 * @param {Image} image Image to use as base for texture
	 * @param {Settings} settings Texturing settings
	 */
	function Texture(image, settings, width, height) {
		this.glTexture = null;

		settings = settings || {};

		if (image) {
			this.setImage(image, settings, width, height);
		}

		// this.mapping = settings.mapping || new THREE.UVMapping();

		this.wrapS = settings.wrapS || 'Repeat';
		this.wrapT = settings.wrapT || 'Repeat';

		this.magFilter = settings.magFilter || 'Bilinear';
		this.minFilter = settings.minFilter || 'Trilinear';

		this.anisotropy = settings.anisotropy || 1;

		this.format = settings.format || 'RGBA';
		this.type = settings.type || 'UnsignedByte';
		this.variant = '2D'; // CUBE

		this.offset = new Vector2(0, 0);
		this.repeat = new Vector2(1, 1);

		this.generateMipmaps = settings.generateMipmaps || true;
		this.premultiplyAlpha = settings.premultiplyAlpha || false;
		this.flipY = settings.flipY || true;

		this.hasBorder = false;

		this.needsUpdate = false;
	}

	Texture.prototype.setImage = function(image, settings, width, height) {
		this.image = image;

		var data = image instanceof Array ? image[0] : image;
		if (data instanceof Uint8Array || data instanceof Uint16Array) {
			if (width !== undefined && height !== undefined) {
				this.image.width = width;
				this.image.height = height;
				this.image.isData = true;
				this.image.dataReady = true;
				if (data instanceof Uint8Array) {
					settings.type = 'UnsignedByte';
				} else if (data instanceof Uint16Array) {
					settings.type = 'UnsignedShort4444';
				}
			} else {
				throw "Data textures need width and height";
			}
		}
	};

	Texture.CUBE_FACES = ['PositiveX', 'NegativeX', 'PositiveY', 'NegativeY', 'PositiveZ', 'NegativeZ'];

	return Texture;
});
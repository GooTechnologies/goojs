define(['goo/renderer/Loader'], function(Loader) {
	"use strict";

	/**
	 * Creates a new texture object
	 * 
	 * @name Texture
	 * @class <code>Texture</code> defines a texture object to be used to display an image on a piece of geometry. The
	 *        image to be displayed is defined by the <code>Image</code> class. All attributes required for texture
	 *        mapping are contained within this class. This includes mipmapping if desired, magnificationFilter options,
	 *        apply options and correction options. Default values are as follows: minificationFilter -
	 *        NearestNeighborNoMipMaps, magnificationFilter - NearestNeighbor, wrap - EdgeClamp on S,T and R, apply -
	 *        Modulate, environment - None.
	 * @param {Image} image Image to use as base for texture
	 * @param {Settings} settings Texturing settings
	 */
	function Texture(image, settings) {
		this.image = image;

		this.glTexture = null;

		settings = settings || {};

		this.mapping = settings.mapping || new THREE.UVMapping();

		this.wrapS = settings.wrapS || 'EdgeClamp';
		this.wrapT = settings.wrapT || 'EdgeClamp';

		this.magFilter = settings.magFilter || 'Bilinear';
		this.minFilter = settings.minFilter || 'Trilinear';

		this.anisotropy = settings.anisotropy || 1;

		this.format = settings.format || 'RGBA';
		this.type = settings.type || 'UnsignedByte';
		this.variant = '2D'; // CUBE

		this.offset = new THREE.Vector2(0, 0);
		this.repeat = new THREE.Vector2(1, 1);

		this.generateMipmaps = settings.generateMipmaps || true;
		this.premultiplyAlpha = settings.premultiplyAlpha || false;
		this.flipY = settings.flipY || true;

		this.needsUpdate = false;
	}

	return Texture;
});
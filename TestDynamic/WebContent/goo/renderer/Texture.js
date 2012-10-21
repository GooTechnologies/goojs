"use strict";

define([ 'goo/renderer/Loader' ], function(Loader) {
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

	Texture.prototype.loadTexture2D = function(imageURL) {
	};

	return Texture;
});
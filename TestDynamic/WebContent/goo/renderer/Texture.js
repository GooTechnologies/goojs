define([ 'goo/renderer/Loader' ], function(Loader) {
	function Texture(image, settings) {
		this.image = image;

		this.glTexture = null;

		settings = settings || {};

		this.mapping = settings.mapping || new THREE.UVMapping();

		this.wrapS = settings.wrapS || 'ClampToEdgeWrapping';
		this.wrapT = settings.wrapT || 'ClampToEdgeWrapping';

		this.magFilter = settings.magFilter || 'LinearFilter';
		this.minFilter = settings.minFilter || 'LinearMipMapLinearFilter';

		this.anisotropy = settings.anisotropy || 1;

		this.format = settings.format || 'RGBA';
		this.type = settings.type || 'UnsignedByte';

		this.offset = new THREE.Vector2(0, 0);
		this.repeat = new THREE.Vector2(1, 1);

		this.generateMipmaps = true;
		this.premultiplyAlpha = false;
		this.flipY = true;

		this.needsUpdate = false;
	}

	Texture.prototype.loadTexture2D = function(imageURL) {
	};

	return Texture;
});
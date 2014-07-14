define([
	'goo/entities/World',
	'goo/renderer/Texture',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	Texture,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('TextureHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});

		it('loads a texture with an image', function (done) {
			var config = Configs.texture();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (texture) {
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));
				done();
			});
		});

		it('loads a texture with an SVG', function (done) {
			var config = Configs.textureSVG();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (texture) {
				expect(texture).toEqual(jasmine.any(Texture));
				done();
			});
		});
	});
});
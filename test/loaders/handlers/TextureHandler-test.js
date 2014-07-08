define([
	'goo/entities/World',
	'goo/renderer/Texture',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function(
	World,
	Texture,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('TextureHandler', function() {

		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});

		it('loads a texture with an image', function() {
			var config = Configs.texture();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(texture) {
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));
			});
			wait(p, 1000);
		});

		it('loads a texture with an SVG', function() {
			var config = Configs.textureSVG();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(texture) {
				expect(texture).toEqual(jasmine.any(Texture));
			});
			wait(p, 1000);
		});
	});
});
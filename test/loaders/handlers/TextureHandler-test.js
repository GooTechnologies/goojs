define([
	'goo/entities/World',
	'goo/entities/GooRunner',
	'goo/renderer/Texture',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function (
	World,
	GooRunner,
	Texture,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function () { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('TextureHandler', function () {

		var loader;
		var world;
		var gooRunner;
		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false
			});
			world = gooRunner.world;
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});
		afterEach(function () {
			gooRunner.clear();
		});

		it('loads a texture with an image', function () {
			var config = Configs.texture();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function (texture) {
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));
			});
			wait(p, 1000);
		});

		it('loads a texture with an SVG', function () {
			var config = Configs.textureSVG();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function (texture) {
				expect(texture).toEqual(jasmine.any(Texture));
			});
			wait(p, 1000);
		});

		it('clears a texture from the context', function () {
			var config = Configs.texture();
			loader.preload(Configs.get());
			var t;
			var p = loader.load(config.id).then(function (texture) {
				t = texture;
				// Allocate a dummy texture on the context
				texture.glTexture = gooRunner.renderer.context.createTexture();
				gooRunner.renderer.preloadTexture(gooRunner.renderer.context, texture);
				return loader.clear();
			}).then(function () {
				expect(t.glTexture).toBeFalsy();
			});
			wait(p, 1000);
		});
	});
});
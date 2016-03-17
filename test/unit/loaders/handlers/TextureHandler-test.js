	describe('TextureHandler', function () {

		var GooRunner = require('src/goo/entities/GooRunner');
		var DynamicLoader = require('src/goo/loaders/DynamicLoader');
		var Texture = require('src/goo/renderer/Texture');
		var Configs = require('test/unit/loaders/Configs');

		var gooRunner, loader;

		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false,
				manuallyStartGameLoop: true
			});
			loader = new DynamicLoader({
				world: gooRunner.world,
				rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res/'
			});
		});

		afterEach(function () {
			gooRunner.clear();
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

		it('clears a texture from the context', function (done) {
			var config = Configs.texture();
			loader.preload(Configs.get());
			var t;
			loader.load(config.id).then(function (texture) {
				t = texture;
				// Allocate a dummy texture on the context
				texture.glTexture = gooRunner.renderer.context.createTexture();
				gooRunner.renderer.preloadTexture(gooRunner.renderer.context, texture);
				return loader.clear();
			}).then(function () {
				expect(t.glTexture).toBeFalsy();
				done();
			});
		});
	});

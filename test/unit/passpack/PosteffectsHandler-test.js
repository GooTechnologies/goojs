import Configs from 'test/unit/loaders/Configs';
import GooRunner from 'src/goo/entities/GooRunner';
import DynamicLoader from 'src/goo/loaders/DynamicLoader';
require('src/goo/passpack/PosteffectsHandler');

	describe('PosteffectsHandler', function () {

		var gooRunner, loader;

		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false,
				manuallyStartGameLoop: true
			});
			loader = new DynamicLoader({
				world: gooRunner.world,
				rootPath: 'loaders/res/'
			});
		});

		afterEach(function () {
			if (gooRunner) {
				gooRunner.clear();
			}
		});

		it('loads a post effect', function (done) {
			var config = Configs.posteffects();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (/*posteffects*/) {
				expect(gooRunner.renderSystem.composers.length).toEqual(1);
				done();
			});
		});

		it('clears posteffect buffers from the GPU', function (done) {
			var config = Configs.posteffects();
			loader.preload(Configs.get());
			var composer;
			loader.load(config.id).then(function (/*posteffects*/) {
				expect(gooRunner.renderSystem.composers.length).toEqual(1);
				composer = gooRunner.renderSystem.composers[0];

				// Allocate buffers manually
				composer.readBuffer.glTexture = gooRunner.renderer.context.createTexture();
				composer.readBuffer._glFrameBuffer = gooRunner.renderer.context.createFramebuffer();
				composer.readBuffer._glRenderBuffer = gooRunner.renderer.context.createRenderbuffer();

				composer.writeBuffer.glTexture = gooRunner.renderer.context.createTexture();
				composer.writeBuffer._glFrameBuffer = gooRunner.renderer.context.createFramebuffer();
				composer.writeBuffer._glRenderBuffer = gooRunner.renderer.context.createRenderbuffer();

				return loader.clear();
			}).then(function () {
				expect(gooRunner.renderSystem.composers.length).toEqual(0);

				// Check destroyed
				expect(composer.writeBuffer.glTexture).toBeFalsy();
				expect(composer.writeBuffer._glRenderBuffer).toBeFalsy();
				expect(composer.writeBuffer._glFrameBuffer).toBeFalsy();

				expect(composer.readBuffer.glTexture).toBeFalsy();
				expect(composer.readBuffer._glRenderBuffer).toBeFalsy();
				expect(composer.readBuffer._glFrameBuffer).toBeFalsy();
				done();
			});
		});
	});
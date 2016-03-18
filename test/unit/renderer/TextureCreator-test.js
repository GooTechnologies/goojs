import TextureCreator from 'src/goo/renderer/TextureCreator';

	describe('TextureCreator', function () {
		var textureCreator;
		var callbacks;

		beforeEach(function () {
			textureCreator = new TextureCreator();
			callbacks = {
				rejectCallback: function () {}
			};
			spyOn(callbacks, 'rejectCallback');
		});

		afterEach(function () {
			expect(callbacks.rejectCallback).not.toHaveBeenCalled();
		});

		describe('loadTexture2D', function () {
			it('loads a texture', function (done) {
				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
				var image = prefix + 'check.png';

				textureCreator.loadTexture2D(image, null).then(function (texture) {
					expect(texture.image).toEqual(jasmine.any(Image));
					done();
				}, callbacks.rejectCallback);
			});
		});

		describe('loadTextureVideo', function () {
			it('loads a video texture', function (done) {
				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
				var image = prefix + 'small.mp4';

				textureCreator.loadTextureVideo(image, {
					loop: true,
					autoPlay: false,
					texture: { dontwait: false }
				}).then(function (texture) {
					expect(texture.image).toEqual(jasmine.any(HTMLVideoElement));
					done();
				}, callbacks.rejectCallback);
			});
		});

		describe('loadTextureCube', function () {
			it('loads a texture with 6 data elements', function (done) {
				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';

				var images = [
					'check.png',
					'check-alt.png',
					'check.png',
					'check-alt.png',
					'check.png',
					'check-alt.png'
				].map(function (path) { return prefix + path; });

				textureCreator.loadTextureCube(images, null).then(function (texture) {
					expect(texture.image.data.length).toEqual(6);
					done();
				}, callbacks.rejectCallback);
			});
		});
	});

define([
	'goo/renderer/TextureCreator'
], function (
	TextureCreator
) {
	'use strict';

	describe('TextureCreator', function () {
		var textureCreator;

		beforeEach(function () {
			textureCreator = new TextureCreator();
		});

		describe('loadTexture2D', function () {
			it('loads a texture', function (done) {
				var onLoaded = function () {
					expect(texture.image).toEqual(jasmine.any(Image));
					done();
				};

				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
				var image = prefix + 'check.png';

				var texture = textureCreator.loadTexture2D(image, null, onLoaded);
			});
		});

		describe('loadTextureCube', function () {
			it('loads a texture with 6 data elements', function (done) {
				var onLoaded = function () {
					expect(cubeTexture.image.data.length).toEqual(6);
					done();
				};

				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';

				var images = [
					'check.png',
					'check-alt.png',
					'check.png',
					'check-alt.png',
					'check.png',
					'check-alt.png'
				].map(function (path) { return prefix + path; });

				var cubeTexture = textureCreator.loadTextureCube(images, null, onLoaded);
				//! AT: if this method fails we will never know, there's no reject callback
			});
		});
	});
});

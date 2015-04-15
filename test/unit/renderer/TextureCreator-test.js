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
				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
				var image = prefix + 'check.png';

				textureCreator.loadTexture2D(image, null).then(function (texture) {
					expect(texture.image).toEqual(jasmine.any(Image));
					done();
				});
			});
		});

		describe('loadTextureVideo', function () {
			it('loads a video texture', function (done) {
				var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
				var image = prefix + 'sintel.mp4';

				textureCreator.loadTextureVideo(image, true, { autoPlay: false }, {
					texture: {
						dontwait: false
					}
				}).then(function (texture) {
					expect(texture.image).toEqual(jasmine.any(HTMLVideoElement));
					done();
				});
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
				});
			});
		});
	});
});

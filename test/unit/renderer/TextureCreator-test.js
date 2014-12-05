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
				//! AT: if this method fail we will never know, there's no reject callback
			});
		});
	});
});

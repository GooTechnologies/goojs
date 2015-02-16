define([
	'goo/renderer/Texture',
	'test/CustomMatchers'
], function (
	Texture,
	CustomMatchers
	) {
	'use strict';

	describe('Texture', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('clone', function () {
			var exclusionList = ['image', '_originalImage', 'needsUpdate', 'loadImage'];

			it('can clone a texture holding no image', function () {
				var original = new Texture();
				var clone = original.clone();

				expect(clone).toBeCloned({ value: original, excluded: exclusionList });
			});

			it('can clone a texture holding a typed array', function () {
				var original = new Texture(new Uint8Array([11, 22, 33, 44]), {}, 1, 1);
				var clone = original.clone();

				expect(clone).toBeCloned({ value: original, excluded: exclusionList });
			});

			it('can clone a texture holding an html element', function () {
				var images = [new Image()];
				var original = new Texture(images[0]);
				var clone = original.clone();

				expect(clone).toBeCloned({ value: original, excluded: exclusionList });
			});

			it('can clone a texture holding an 6 html elements', function () {
				var images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
				var original = new Texture(images);
				var clone = original.clone();

				expect(clone).toBeCloned({ value: original, excluded: exclusionList });
			});
		});
	});
});

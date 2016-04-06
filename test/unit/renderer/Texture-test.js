var Texture = require('../../../src/goo/renderer/Texture');
var CustomMatchers = require('../../../test/unit/CustomMatchers');

describe('Texture', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('create', function () {
		function testTypesAndFormats(data, defaultType, defaultFormat) {
			var settings = {};
			var texture = new Texture(data, settings, 1, 1);
			expect(texture.image).not.toBeNull();
			expect(texture.type).toEqual(defaultType);
			expect(texture.format).toEqual(defaultFormat);

			settings = {
				type: 'TestType',
				format: 'TestFormat'
			};
			texture = new Texture(data, settings, 1, 1);
			expect(texture.type).toEqual('TestType');
			expect(texture.format).toEqual('TestFormat');
		}

		it('can create without parameters', function () {
			var texture = new Texture();

			expect(texture.image).toBeNull();
		});

		it('can create with Uint8Array for various types/formats', function () {
			testTypesAndFormats(new Uint8Array(1), 'UnsignedByte', 'RGBA');
		});

		it('can create with Uint16Array for various types/formats', function () {
			testTypesAndFormats(new Uint16Array(1), 'UnsignedShort565', 'RGB');
		});

		it('can create with Float32Array for various types/formats', function () {
			testTypesAndFormats(new Float32Array(1), 'Float', 'RGBA');
		});
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

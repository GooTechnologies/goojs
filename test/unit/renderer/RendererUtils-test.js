import RendererUtils from 'src/goo/renderer/RendererUtils';
import CustomMatchers from 'test/unit/CustomMatchers';

	describe('RendererUtils', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('clone', function () {
			var clone = RendererUtils.clone;

			it('does not clone primitives and functions', function () {
				expect(clone(123)).toBe(123);
				expect(clone(true)).toBe(true);
				expect(clone('asd')).toBe('asd');

				var func = function () {};
				expect(clone(func)).toBe(func);
			});

			it('does not clone null or undefined', function () {
				expect(clone(null)).toBeNull();
				expect(clone(undefined)).toBeUndefined();
			});

			it('clones arrays', function () {
				var original = [1, 2, 3];
				expect(clone(original)).toBeCloned(original);
			});

			it('clones objects', function () {
				var original = { a: 123, b: 321 };
				expect(clone(original)).toBeCloned(original);
			});

			it('clones a typed array', function () {
				var original = new Uint32Array([1, 2, 3]);
				expect(clone(original)).toBeCloned(original);
			});
		});
	});

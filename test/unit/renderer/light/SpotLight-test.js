define([
	'goo/math/Vector3',
	'goo/renderer/light/SpotLight',
	'test/CustomMatchers'
], function (
	Vector3,
	SpotLight,
	CustomMatchers
) {
	'use strict';

	describe('SpotLight', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('copy', function () {
			it('can copy everything from another point light', function () {
				var original = new SpotLight(new Vector3(11, 22, 33));
				var copy = new SpotLight(new Vector3(44, 55, 66));
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});

		describe('clone', function () {
			it('can clone a point light', function () {
				var original = new SpotLight(new Vector3(11, 22, 33));
				var clone = original.clone();

				expect(clone).toBeCloned(original);
			});
		});
	});
});

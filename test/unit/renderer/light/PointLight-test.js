define([
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'test/CustomMatchers'
], function (
	Vector3,
	PointLight,
	CustomMatchers
) {
	'use strict';

	describe('PointLight', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('copy', function () {
			it('can copy everything from another point light', function () {
				var original = new PointLight(new Vector3(11, 22, 33));
				var copy = new PointLight(new Vector3(44, 55, 66));
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});

		describe('clone', function () {
			it('can clone a point light', function () {
				var original = new PointLight(new Vector3(11, 22, 33));
				var clone = original.clone();

				expect(clone).toBeCloned(original);
			});
		});
	});
});

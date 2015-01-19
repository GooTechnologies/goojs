define([
	'goo/renderer/light/DirectionalLight',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	DirectionalLight,
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('DirectionalLight', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		it('gets the color from the first parameter passed to the constructor', function () {
			var color = new Vector3(0.2, 0.3, 0.5);
			var light = new DirectionalLight(color);

			expect(light.color).toBeCloseToVector(color);
			expect(light.color).not.toBe(color);
		});
	});
});

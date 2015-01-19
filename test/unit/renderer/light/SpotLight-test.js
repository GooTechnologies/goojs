define([
	'goo/renderer/light/SpotLight',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	SpotLight,
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('SpotLight', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		it('gets the color from the first parameter passed to the constructor', function () {
			var color = new Vector3(0.2, 0.3, 0.5);
			var light = new SpotLight(color);

			expect(light.color).toBeCloseToVector(color);
			expect(light.color).not.toBe(color);
		});
	});
});

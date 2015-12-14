define([
	'goo/renderer/light/Light',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/DirectionalLight',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	Light,
	PointLight,
	SpotLight,
	DirectionalLight,
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('Light', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		it('defaults the color to (1, 1, 1)', function () {
			var defaultColor = new Vector3(1, 1, 1);
			var light = new Light();

			expect(light.color).toBeCloseToVector(defaultColor);
		});

		it('gets the color from the first parameter passed to the constructor', function () {
			var color = new Vector3(0.2, 0.3, 0.5);
			var light = new Light(color);

			expect(light.color).toBeCloseToVector(color);
			expect(light.color).not.toBe(color);
		});
	});
});

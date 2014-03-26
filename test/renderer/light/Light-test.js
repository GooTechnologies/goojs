define([
	'goo/renderer/light/Light',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/DirectionalLight',
	'goo/math/Vector3'
], function(
	Light,
	PointLight,
	SpotLight,
	DirectionalLight,
	Vector3
) {
	'use strict';

	describe('Light', function() {
		it('defaults the color to (1, 1, 1)', function() {
			var defaultColor = new Vector3(1, 1, 1);
			var light = new Light();

			expect(light.color.equals(defaultColor)).toBeTruthy();
		});

		it('gets the color from the first parameter passed to the constructor', function() {
			var color = new Vector3(0.2, 0.3, 0.5);
			var light = new Light(color);

			expect(light.color.equals(color)).toBeTruthy();
		});
	});

	describe('PointLight', function() {
		it('gets the color from the first parameter passed to the constructor', function() {
			var color = new Vector3(0.2, 0.3, 0.5);
			var pointLight = new PointLight(color);

			expect(pointLight.color.equals(color)).toBeTruthy();
		});
	});

	describe('SpotLight', function() {
		it('gets the color from the first parameter passed to the constructor', function() {
			var color = new Vector3(0.2, 0.3, 0.5);
			var spotLight = new PointLight(color);

			expect(spotLight.color.equals(color)).toBeTruthy();
		});
	});

	describe('DirectionalLight', function() {
		it('gets the color from the first parameter passed to the constructor', function() {
			var color = new Vector3(0.2, 0.3, 0.5);
			var directionalLight = new PointLight(color);

			expect(directionalLight.color.equals(color)).toBeTruthy();
		});
	});
});

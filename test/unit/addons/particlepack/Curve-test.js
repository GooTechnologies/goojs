define([
	'goo/addons/particlepack/Curve'
], function (
	Curve
) {
	'use strict';

	describe('Curve', function () {
		it('can get a value on the curve', function () {
			var curve = new Curve();
			expect(curve.getValueAt(0)).toBe(0);
		});
		it('can be converted to GLSL', function () {
			var curve = new Curve();
			expect(curve.toGLSL('t')).toBe('0.0');
		});
	});
});
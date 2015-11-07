define([
	'goo/addons/particlepack/LinearCurve'
], function (
	LinearCurve
) {
	'use strict';

	describe('LinearCurve', function () {
		it('can get a value on the curve', function () {
			var curve = new LinearCurve({
				k: 1,
				m: 0
			});
			expect(curve.getValueAt(0)).toBe(0);
			expect(curve.getValueAt(0.5)).toBe(0.5);
			expect(curve.getValueAt(1)).toBe(1);

			curve.k = 0.5;
			curve.m = 0.5;
			expect(curve.getValueAt(0)).toBe(0.5);
			expect(curve.getValueAt(1)).toBe(1);
		});

		it('can be converted to GLSL', function () {
			var curve = new LinearCurve({
				k: 1,
				m: 0
			});
			expect(curve.toGLSL('t')).toBe('(1.0*t+0.0)');
		});
	});
});
var LinearCurve = require('../../src/goo/addons/particlepack/curves/LinearCurve');

describe('LinearCurve', function () {
	it('.getValueAt', function () {
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

	it('.getIntegralValueAt', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.getIntegralValueAt(0)).toBe(0);
		expect(curve.getIntegralValueAt(0.5)).toBe(0.125); // 0.5 * 0.5^2 + 0 * 0.5
		expect(curve.getIntegralValueAt(1)).toBe(0.5);

		curve.k = 0.5;
		curve.m = 0.5;
		expect(curve.getIntegralValueAt(0)).toBe(0);
		expect(curve.getIntegralValueAt(1)).toBe(0.75); // 0.5 * 1^2 + 0.5
	});

	it('.toGLSL', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.toGLSL('t')).toBe('(1.0*t+0.0)');
	});

	it('.integralToGLSL', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.integralToGLSL('t')).toBe('(1.0*t*t*0.5+0.0*t)');
	});
});

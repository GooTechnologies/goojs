	describe('ConstantCurve', function () {

		var ConstantCurve = require('src/goo/addons/particlepack/curves/ConstantCurve');

		it('.getValueAt', function () {
			var set = new ConstantCurve({ value: 123 });
			expect(set.getValueAt(0)).toBe(123);
			expect(set.getValueAt(0.5)).toBe(123);
			expect(set.getValueAt(1)).toBe(123);
		});

		it('.getIntegralValueAt', function () {
			var set = new ConstantCurve({ value: 123 });
			expect(set.getIntegralValueAt(0)).toBe(0);
			expect(set.getIntegralValueAt(0.5)).toBe(123 * 0.5);
			expect(set.getIntegralValueAt(1)).toBe(123);
		});

		it('.toGLSL', function () {
			var set = new ConstantCurve({ value: 123 });
			expect(set.toGLSL('t')).toBe('123.0');
		});

		it('.integralToGLSL', function () {
			var set = new ConstantCurve({ value: 123 });
			expect(set.integralToGLSL('t')).toBe('(123.0*t)');
		});
	});

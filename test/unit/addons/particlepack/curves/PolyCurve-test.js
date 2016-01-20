define([
	'goo/addons/particlepack/curves/Curve',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/PolyCurve'
], function (
	Curve,
	LinearCurve,
	PolyCurve
) {
	'use strict';

	describe('PolyCurve', function () {
		it('can add a segment', function () {
			var set = new PolyCurve();
			var curve = new Curve();
			set.addSegment(curve);
			expect(set.segments.length).toBe(1);
		});

		it('.getValueAt', function () {

			it('can get a value from multiple curve types', function () {
				var set = new PolyCurve();
				var curve = new Curve();
				set.addSegment(curve);
				expect(set.getValueAt(0.5)).toBe(0);
			});

			it('can get a value from multiple curve types', function () {
				var set = new PolyCurve();
				set.addSegment(new Curve({ timeOffset: 0 }));
				set.addSegment(new LinearCurve({ timeOffset: 0.5, k: 1, m: 0 }));
				expect(set.getValueAt(0)).toBe(0);
				expect(set.getValueAt(1)).toBe(0.5);
			});
		});

		it('.getIntegralValueAt', function () {
			var set = new PolyCurve();
			var curve = new LinearCurve({ timeOffset: 0, k: 1, m: 0 });
			set.addSegment(curve);
			expect(set.getIntegralValueAt(0.5)).toBe(0.125);
		});

		it('.toGLSL', function () {
			var set = new PolyCurve();
			set.addSegment(new Curve({ timeOffset: 0 }));
			set.addSegment(new Curve({ timeOffset: 0.5 }));
			expect(set.toGLSL('t','lerp')).toBe('step(0.0,t)*step(-0.5,-t)*0.0+step(0.5,t)*step(-1.0,-t)*0.0');
		});

		it('.integralToGLSL', function () {
			var set = new PolyCurve();
			set.addSegment(new LinearCurve({ timeOffset: 0, k: 1, m: 0 }));
			expect(set.integralToGLSL('t','lerp')).toBe('(1.0*clamp(t,0.0,1.0)*clamp(t,0.0,1.0)*0.5+0.0*clamp(t,0.0,1.0))');
		});
	});
});
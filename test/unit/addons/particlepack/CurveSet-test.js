define([
	'goo/addons/particlepack/Curve',
	'goo/addons/particlepack/LinearCurve',
	'goo/addons/particlepack/CurveSet'
], function (
	Curve,
	LinearCurve,
	CurveSet
) {
	'use strict';

	describe('CurveSet', function () {
		it('can add a segment', function () {
			var set = new CurveSet();
			var curve = new Curve();
			set.addSegment(curve);
			expect(set.segments.length).toBe(1);
		});

		it('can get a value', function () {
			var set = new CurveSet();
			var curve = new Curve();
			set.addSegment(curve);
			expect(set.getValueAt(0.5)).toBe(0);
		});

		it('can get a value from multiple curve types', function () {
			var set = new CurveSet();
			set.addSegment(new Curve({ timeOffset: 0 }));
			set.addSegment(new LinearCurve({ timeOffset: 0.5, k: 1, m: 0 }));
			expect(set.getValueAt(0)).toBe(0);
			expect(set.getValueAt(1)).toBe(0.5);
		});

		it('can be converted to GLSL', function () {
			var set = new CurveSet();
			set.addSegment(new Curve({ timeOffset: 0 }));
			set.addSegment(new Curve({ timeOffset: 0.5 }));
			expect(set.toGLSL('t')).toBe('step(0.0,t)*step(-0.5,-t)*0.0+step(0.5,t)*step(-1.0,-t)*0.0');
		});
	});
});
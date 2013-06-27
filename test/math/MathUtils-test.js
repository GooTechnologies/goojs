define(["goo/math/MathUtils", "goo/math/Vector3"], function(MathUtils, Vector3) {
	"use strict";

	describe("MathUtils", function() {
		it("can convert to radians from degrees", function() {
			expect(MathUtils.radFromDeg(90)).toEqual(Math.PI*0.5);
		});

		it("can convert to degrees from radians", function() {
			expect(MathUtils.degFromRad(Math.PI*0.5)).toEqual(90);
		});

		it("can perform linear interpolation", function() {
			expect(MathUtils.lerp(-1.0, 10.0, 20.0)).toEqual( 0.0);
			expect(MathUtils.lerp( 0.0, 10.0, 20.0)).toEqual(10.0);
			expect(MathUtils.lerp( 0.5, 10.0, 20.0)).toEqual(15.0);
			expect(MathUtils.lerp( 1.0, 10.0, 20.0)).toEqual(20.0);
			expect(MathUtils.lerp( 2.0, 10.0, 20.0)).toEqual(30.0);
		});

		it("can clamp a value to a given interval", function() {
			expect(MathUtils.clamp(1.0, 2.0, 3.0)).toEqual(2.0);
			expect(MathUtils.clamp(1.0, 3.0, 2.0)).toEqual(2.0);
			expect(MathUtils.clamp(4.0, 2.0, 3.0)).toEqual(3.0);
			expect(MathUtils.clamp(4.0, 3.0, 2.0)).toEqual(3.0);
			expect(MathUtils.clamp(2.5, 2.0, 3.0)).toEqual(2.5);
		});

		it("can compute values on cubic s-curves", function() {
			expect(MathUtils.scurve3(0.00)).toEqual(0.0);
			expect(MathUtils.scurve3(0.25)).toEqual((-2.0 * 0.25 + 3.0) * 0.25 * 0.25);
			expect(MathUtils.scurve3(0.50)).toEqual(0.5);
			expect(MathUtils.scurve3(0.75)).toEqual((-2.0 * 0.75 + 3.0) * 0.75 * 0.75);
			expect(MathUtils.scurve3(1.00)).toEqual(1.0);
		});

		it("can compute values on quintic s-curves", function() {
			expect(MathUtils.scurve5(0.00)).toEqual(0.0);
			expect(MathUtils.scurve5(0.25)).toEqual(((6.0 * 0.25 - 15.0) * 0.25 + 10.0) * 0.25 * 0.25 * 0.25);
			expect(MathUtils.scurve5(0.50)).toEqual(0.5);
			expect(MathUtils.scurve5(0.75)).toEqual(((6.0 * 0.75 - 15.0) * 0.75 + 10.0) * 0.75 * 0.75 * 0.75);
			expect(MathUtils.scurve5(1.00)).toEqual(1.0);
		});

		it("can convert to cartesian coordinates from spherical coordinates", function(){
			var c = new Vector3();

			MathUtils.sphericalToCartesian(16, 0, 0, c);
			expect(c.x).toBeCloseTo(16);
			expect(c.y).toBeCloseTo(0);
			expect(c.z).toBeCloseTo(0);

			MathUtils.sphericalToCartesian(16, Math.PI/2, 0, c);
			expect(c.x).toBeCloseTo(0);
			expect(c.y).toBeCloseTo(0);
			expect(c.z).toBeCloseTo(16);

			MathUtils.sphericalToCartesian(4, Math.PI/2, Math.PI/4, c);
			expect(c.x).toBeCloseTo(0);
			expect(c.y).toBeCloseTo(Math.sqrt(8));
			expect(c.z).toBeCloseTo(Math.sqrt(8));
		});
	});
});

define([
	'goo/math/MathUtils',
	'goo/math/Vector3',
	'goo/math/Vector2'
], function (
	MathUtils,
	Vector3,
	Vector2
) {
	'use strict';

	describe('MathUtils', function () {
		it('can convert to radians from degrees', function () {
			expect(MathUtils.radFromDeg(90)).toEqual(Math.PI * 0.5);
		});

		it('can convert to degrees from radians', function () {
			expect(MathUtils.degFromRad(Math.PI * 0.5)).toEqual(90);
		});

		it('can perform linear interpolation', function () {
			expect(MathUtils.lerp(-1.0, 10.0, 20.0)).toEqual( 0.0);
			expect(MathUtils.lerp(0.0, 10.0, 20.0)).toEqual(10.0);
			expect(MathUtils.lerp(0.5, 10.0, 20.0)).toEqual(15.0);
			expect(MathUtils.lerp(1.0, 10.0, 20.0)).toEqual(20.0);
			expect(MathUtils.lerp(2.0, 10.0, 20.0)).toEqual(30.0);
			expect(MathUtils.lerp(1.0, 5.0, 5.0)).toEqual(5.0);
		});

		it('can clamp a value to a given interval', function () {
			expect(MathUtils.clamp(1.0, 2.0, 3.0)).toEqual(2.0);
			expect(MathUtils.clamp(1.0, 3.0, 2.0)).toEqual(2.0);
			expect(MathUtils.clamp(4.0, 2.0, 3.0)).toEqual(3.0);
			expect(MathUtils.clamp(4.0, 3.0, 2.0)).toEqual(3.0);
			expect(MathUtils.clamp(2.5, 2.0, 3.0)).toEqual(2.5);
		});

		it('can compute values on cubic s-curves', function () {
			expect(MathUtils.scurve3(0.00)).toEqual(0.0);
			expect(MathUtils.scurve3(0.25)).toEqual((-2.0 * 0.25 + 3.0) * 0.25 * 0.25);
			expect(MathUtils.scurve3(0.50)).toEqual(0.5);
			expect(MathUtils.scurve3(0.75)).toEqual((-2.0 * 0.75 + 3.0) * 0.75 * 0.75);
			expect(MathUtils.scurve3(1.00)).toEqual(1.0);
		});

		it('can compute values on quintic s-curves', function () {
			expect(MathUtils.scurve5(0.00)).toEqual(0.0);
			expect(MathUtils.scurve5(0.25)).toEqual(((6.0 * 0.25 - 15.0) * 0.25 + 10.0) * 0.25 * 0.25 * 0.25);
			expect(MathUtils.scurve5(0.50)).toEqual(0.5);
			expect(MathUtils.scurve5(0.75)).toEqual(((6.0 * 0.75 - 15.0) * 0.75 + 10.0) * 0.75 * 0.75 * 0.75);
			expect(MathUtils.scurve5(1.00)).toEqual(1.0);
		});

		it('can convert to cartesian coordinates from spherical coordinates', function (){
			var c = new Vector3();

			MathUtils.sphericalToCartesian(16, 0, 0, c);
			expect(c.x).toBeCloseTo(16);
			expect(c.y).toBeCloseTo(0);
			expect(c.z).toBeCloseTo(0);

			MathUtils.sphericalToCartesian(16, Math.PI / 2, 0, c);
			expect(c.x).toBeCloseTo(0);
			expect(c.y).toBeCloseTo(0);
			expect(c.z).toBeCloseTo(16);

			MathUtils.sphericalToCartesian(4, Math.PI / 2, Math.PI / 4, c);
			expect(c.x).toBeCloseTo(0);
			expect(c.y).toBeCloseTo(Math.sqrt(8));
			expect(c.z).toBeCloseTo(Math.sqrt(8));
		});

		it('can check if power of two', function () {
			expect(MathUtils.isPowerOfTwo(0)).toBeTruthy();
			expect(MathUtils.isPowerOfTwo(8)).toBeTruthy();
			expect(MathUtils.isPowerOfTwo(256)).toBeTruthy();
			expect(MathUtils.isPowerOfTwo(13)).toBeFalsy();
			expect(MathUtils.isPowerOfTwo(257)).toBeFalsy();
			expect(MathUtils.isPowerOfTwo(255)).toBeFalsy();
		});

		it('can get nearest power of two', function () {
			expect(MathUtils.nearestHigherPowerOfTwo(0)).toEqual(0);
			expect(MathUtils.nearestHigherPowerOfTwo(8)).toEqual(8);
			expect(MathUtils.nearestHigherPowerOfTwo(6)).toEqual(8);
			expect(MathUtils.nearestHigherPowerOfTwo(10)).toEqual(16);
			expect(MathUtils.nearestHigherPowerOfTwo(255)).toEqual(256);
			expect(MathUtils.nearestHigherPowerOfTwo(256)).toEqual(256);
			expect(MathUtils.nearestHigherPowerOfTwo(257)).toEqual(512);
		});

		it('can compute the area of a triangle', function () {
			expect(MathUtils.triangleArea(new Vector2(5, 5), new Vector2(5, 6), new Vector2(7, 5))).toBeCloseTo(1.0);
		});

		it('can do barycentric interpolation', function () {
			var t1 = new Vector3(2, 2, 30);
			var t2 = new Vector3(4, 2, 40);
			var t3 = new Vector3(2, 6, 50);

			expect(MathUtils.barycentricInterpolation(t1, t2, t3, new Vector3(2, 4, 123)).z).toBeCloseTo(40);
			expect(MathUtils.barycentricInterpolation(t1, t2, t3, new Vector3(3, 2, 123)).z).toBeCloseTo(35);
			expect(MathUtils.barycentricInterpolation(
				t1, t2, t3, new Vector3((t1.x + t2.x + t3.x) / 3, (t1.y + t2.y + t3.y) / 3, 123)).z
			).toBeCloseTo(40);
		});

		it('gets the correct triangle normal', function () {
			var p1 = [0, 0, 0];
			var p2 = [0, 1, 0];
			var p3 = [1, 1, 0];
			expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2])).toEqual([0, 0,-1]);

			p1 = [0, 0, 0];
			p2 = [0, 0, 1];
			p3 = [1, 0, 1];
			expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2])).toEqual([0, 1, 0]);

			p1 = [1, 0, 0];
			p2 = [0, 1, 0];
			p3 = [0, 0, 1];
			expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2])).toEqual([1, 1, 1]);

		});

		it('can do positive modulo', function () {
			expect(MathUtils.moduloPositive(-Math.PI / 2, 2 * Math.PI)).toBeCloseTo(3 * Math.PI / 2);
		});

		it('can check if a value is close to another', function () {
			expect(MathUtils.closeTo(1, 1)).toBeTruthy();
			expect(MathUtils.closeTo(1, 2)).toBeFalsy();
			expect(MathUtils.closeTo(1, 1.01, 0.02)).toBeTruthy();
			expect(MathUtils.closeTo(1, 1.02, 0.01)).toBeFalsy();
		});

		it('can get the sign of a number', function () {
			expect(MathUtils.sign(1)).toBe(1);
			expect(MathUtils.sign(-1)).toBe(-1);
			expect(MathUtils.sign(1.4)).toBe(1);
			expect(MathUtils.sign(-1.4)).toBe(-1);
			expect(MathUtils.sign(0)).toBe(0);
		});

		it('can do radial clamping', function () {
			var a = -1;
			a = MathUtils.radialClamp(a, 0, 9);
			expect(a).toBe(0);
		});
	});
});

/*jshint bitwise: false */
define([],
/** @lends */
function () {
	"use strict";

	/**
	 * @class A collection of useful math-related functions, constants and helpers.
	 * @constructor
	 * @description Only used to define the class. Should never be instantiated.
	 */
	function MathUtils() {
	}

	/** @type {number} */
	MathUtils.DEG_TO_RAD = Math.PI / 180.0;
	/** @type {number} */
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;
	/** @type {number} */
	MathUtils.HALF_PI = 0.5 * Math.PI;
	/** @type {number} */
	MathUtils.TWO_PI = 2.0 * Math.PI;
	/** @type {number} */
	MathUtils.EPSILON = 0.0000001;

	/**
	 * Converts an angle from degrees to radians.
	 * @param {Float} degrees Angle in degrees.
	 * @return {Float} Angle in radians.
	 */
	MathUtils.radFromDeg = function (degrees) {
		return degrees * MathUtils.DEG_TO_RAD;
	};

	/**
	 * Converts an angle from radians to degrees.
	 * @param {Float} radians Angle in radians.
	 * @return {Float} Angle in degrees.
	 */
	MathUtils.degFromRad = function (radians) {
		return radians * MathUtils.RAD_TO_DEG;
	};

	/**
	 * Linearly interpolates between two values. Extrapolates if factor is smaller than zero or greater than one.
	 * @param {number} factor Factor of interpolation.
	 * @param {number} start Start value.
	 * @param {number} end End value.
	 * @return {number} Interpolated value.
	 */
	MathUtils.lerp = function (factor, start, end) {
		if (start === end) {
			return start;
		} else {
			return start + (end - start) * factor;
		}
	};

	/**
	 * Clamps a value to a given interval. The interval is defined by min and max where min should be smaller than max. If min is greater
	 * than max, the two parameters are reversed.
	 * @param {number} value Input value.
	 * @param {number} min Lower bound of interval (inclusive).
	 * @param {number} max Upper bound of interval (inclusive).
	 * @return {number} Clamped value.
	 */
	MathUtils.clamp = function (value, min, max) {
		if (min < max) {
			return value < min ? min : value > max ? max : value;
		} else {
			return value < max ? max : value > min ? min : value;
		}
	};

	/**
	 * Calculates the positive modulo
	 * @param {number} value
	 * @param {number} size
	 * @returns {number} Wrapped value
	 */
	MathUtils.moduloPositive = function (value, size) {
		var wrappedValue = value % size;
		wrappedValue += wrappedValue < 0 ? size : 0;
		return wrappedValue;
	};

	/**
	 * Computes a value on the c1-continuous cubic s-curve "y = -2x^3 + 3x^2".
	 * @param {number} x Input value in the range between zero and one.
	 * @return {number} Value on curve.
	 */
	MathUtils.scurve3 = function (x) {
		return (-2.0 * x + 3.0) * x * x;
	};

	/**
	 * Computes a value on the c2-continuous quintic s-curve "y = 6x^5 - 15x^4 + 10x^3".
	 * @param {number} x Input value in the range between zero and one.
	 * @return {number} Value on curve.
	 */
	MathUtils.scurve5 = function (x) {
		return ((6.0 * x - 15.0) * x + 10.0) * x * x * x;
	};

	/**
	 * Converts a point from Spherical coordinates to Cartesian (using positive Y as up) and stores the results in the store var.
	 * @param {number} radius
	 * @param {number} azimuth
	 * @param {number} polar
	 * @param {Vector3} store
	 */
	MathUtils.sphericalToCartesian = function (radius, azimuth, polar, store) {
		var a = radius * Math.cos(polar);

		store.x = a * Math.cos(azimuth);
		store.y = radius * Math.sin(polar);
		store.z = a * Math.sin(azimuth);
	};

	/**
	 * Converts a point from Cartesian coordinates to Spherical to Cartesian (using positive Y as up) and stores the results in the store var.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {Vector3} store
	 */
	MathUtils.cartesianToSpherical = function (x,y,z, store) {
		var a = Math.sqrt(x*x + z*z);
		store.x = Math.sqrt(x*x+y*y+z*z); // radius
		store.y = Math.atan2(z,x); // azimuth
		store.z = Math.atan2(y,a); // polar
	};

	/**
	 * Computes the normal of a given triangle
	 * @param {number} P.x
	 * @param {number} P.y
	 * @param {number} P.z
	 * @param {number} Q.x
	 * @param {number} Q.y
	 * @param {number} Q.z
	 * @param {number} R.x
	 * @param {number} R.y
	 * @param {number} R.z
	 * @return {number[]} The triangle's normal
	 */
	MathUtils.getTriangleNormal = function (p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z) {
		var ux = p2x - p1x;
		var uy = p2y - p1y;
		var uz = p2z - p1z;

		var vx = p3x - p1x;
		var vy = p3y - p1y;
		var vz = p3z - p1z;

		var nx = uy * vz - uz * vy;
		var ny = uz * vx - ux * vz;
		var nz = ux * vy - uy * vx;

		return [nx, ny, nz];
	};

	/**
	 * Checks if a value is power of two
	 * @param {number} value Number to check for power of two
	 * @returns {boolean} true if value is power of two
	 */
	MathUtils.isPowerOfTwo = function (value) {
		return (value & (value - 1)) === 0;
	};

	/**
	 * Gets the nearest higher power of two for a value
	 * @param {number} value Number to get the nearest power of two from
	 * @returns {number} Nearest power of two 
	 */
	MathUtils.nearestHigherPowerOfTwo = function (value) {
		return Math.floor(Math.pow(2, Math.ceil(Math.log(value) / Math.log(2))));
	};

	/**
	 * Returns true if the 2 values supplied are approximately the same
	 * @param v1
	 * @param v2
	 * @param tolerance
	 * @returns {boolean}
	 */
	MathUtils.closeTo = function(v1, v2, tolerance) {
		tolerance = typeof tolerance !== 'undefined' ? tolerance : 0.001;
		return Math.abs(v1 - v2) <= tolerance;
	};

	/**
	 * Returns the sign of the supplied parameter
	 * @param value
	 * @returns {number}
	 */
	MathUtils.sign = function (value) {
		return value < 0 ? -1 : value > 0 ? 1 : 0;
	};

	/**
	 * Computes the area of a 2D triangle
	 * @param {Vector2} t1 First point of the triangle
	 * @param {Vector2} t2 Second point of the triangle
	 * @param {Vector2} t3 Third point of the triangle
	 * @returns {number}
	 */
	MathUtils.triangleArea = function (t1, t2, t3) {
		return Math.abs(t1.x * t2.y + t2.x * t3.y + t3.x * t1.y
			- t2.y * t3.x - t3.y * t1.x - t1.y * t2.x) / 2;
	};

	/**
	 * Computes the height of a point located inside a triangle. Height is assumed to bound to the Z axis.
	 * @param {Vector3} t1 First point of the triangle
	 * @param {Vector3} t2 Second point of the triangle
	 * @param {Vector3} t3 Third point of the triangle
	 * @param {Vector3} p The point for which to compute the height
	 * @returns {Vector3}
	 */
	MathUtils.barycentricInterpolation = function (t1, t2, t3, p) {
		var t1Area = MathUtils.triangleArea(t2, t3, p);
		var t2Area = MathUtils.triangleArea(t1, t3, p);
		var t3Area = MathUtils.triangleArea(t1, t2, p);

		// assuming the point is inside the triangle
		var totalArea = t1Area + t2Area + t3Area;

		p.z = (t1Area * t1.z + t2Area * t2.z + t3Area * t3.z) / totalArea;
		return p;
	};

	return MathUtils;
});

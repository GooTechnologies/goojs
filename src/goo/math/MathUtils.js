define([], function () {
	"use strict";

	/* ====================================================================== */

	/**
	 * @name MathUtils
	 * @class A collection of useful math-related functions, constants and helpers.
	 * @constructor
	 * @description Only used to define the class. Should never be instantiated.
	 */

	function MathUtils() {
	}

	/* ====================================================================== */

	MathUtils.DEG_TO_RAD = Math.PI / 180.0;
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;
	MathUtils.HALF_PI = 0.5 * Math.PI;
	MathUtils.TWO_PI = 2.0 * Math.PI;
	MathUtils.EPSILON = 0.0001;

	/* ====================================================================== */

	/**
	 * @static
	 * @description Converts an angle from degrees to radians.
	 * @param {Float} degrees Angle in degrees.
	 * @return {Float} Angle in radians.
	 */

	MathUtils.radFromDeg = function (degrees) {
		return degrees * MathUtils.DEG_TO_RAD;
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Converts an angle from radians to degrees.
	 * @param {Float} radians Angle in radians.
	 * @return {Float} Angle in degrees.
	 */

	MathUtils.degFromRad = function (radians) {
		return radians * MathUtils.RAD_TO_DEG;
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Linearly interpolates between two values. Extrapolates if factor is smaller than zero or greater than one.
	 * @param {Float} factor Factor of interpolation.
	 * @param {Integer|Float} start Start value.
	 * @param {Integer|Float} end End value.
	 * @return {Integer|Float} Interpolated value.
	 */

	MathUtils.lerp = function (factor, start, end) {
		if (start === end) {
			return start;
		} else {
			return start + (end - start) * factor;
		}
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Clamps a value to a given interval. The interval is defined by min and max where min should be smaller than max. If min is greater than max, the two parameters are reversed.
	 * @param {Integer|Float} value Input value.
	 * @param {Integer|Float} min Lower bound of interval (inclusive).
	 * @param {Integer|Float} max Upper bound of interval (inclusive).
	 * @return {Integer|Float} Clamped value.
	 */

	MathUtils.clamp = function (value, min, max) {
		if (min < max) {
			return value < min ? min : value > max ? max : value;
		} else {
			return value < max ? max : value > min ? min : value;
		}
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes a value on the c1-continuous cubic s-curve "y = -2x^3 + 3x^2".
	 * @param {Float} x Input value in the range between zero and one.
	 * @return {Float} Value on curve.
	 */

	MathUtils.scurve3 = function (x) {
		return (-2.0 * x + 3.0) * x * x;
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes a value on the c2-continuous quintic s-curve "y = 6x^5 - 15x^4 + 10x^3".
	 * @param {Float} x Input value in the range between zero and one.
	 * @return {Float} Value on curve.
	 */

	MathUtils.scurve5 = function (x) {
		return ((6.0 * x - 15.0) * x + 10.0) * x * x * x;
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Converts a point from Spherical coordinates to Cartesian (using positive Y as up) and stores the results in the store var.
	 * @param {Float} radius
	 * @param {Float} azimuth
	 * @param {Float} polar
	 * @param {Vector3} store
	 */
	
	MathUtils.sphericalToCartesian = function (radius, azimuth, polar, store) {
		var a = radius * Math.cos(polar);

		store.x = a * Math.cos(azimuth);
		store.y = radius * Math.sin(polar);
		store.z = a * Math.sin(azimuth);
	};
	
	return MathUtils;
});

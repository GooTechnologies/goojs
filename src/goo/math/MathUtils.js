define([],
/** @lends */
function () {
	"use strict";

	/* ====================================================================== */

	/**
	 * @class A collection of useful math-related functions, constants and helpers.
	 * @constructor
	 * @description Only used to define the class. Should never be instantiated.
	 */

	function MathUtils() {
	}

	/* ====================================================================== */

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

	/* ====================================================================== */

	/**
	 * Converts an angle from degrees to radians.
	 * @param {Float} degrees Angle in degrees.
	 * @return {Float} Angle in radians.
	 */

	MathUtils.radFromDeg = function (degrees) {
		return degrees * MathUtils.DEG_TO_RAD;
	};

	/* ====================================================================== */

	/**
	 * Converts an angle from radians to degrees.
	 * @param {Float} radians Angle in radians.
	 * @return {Float} Angle in degrees.
	 */

	MathUtils.degFromRad = function (radians) {
		return radians * MathUtils.RAD_TO_DEG;
	};

	/* ====================================================================== */

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

	/* ====================================================================== */

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

	/* ====================================================================== */

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

	/* ====================================================================== */

	/**
	 * Computes a value on the c1-continuous cubic s-curve "y = -2x^3 + 3x^2".
	 * @param {number} x Input value in the range between zero and one.
	 * @return {number} Value on curve.
	 */

	MathUtils.scurve3 = function (x) {
		return (-2.0 * x + 3.0) * x * x;
	};

	/* ====================================================================== */

	/**
	 * @description Computes a value on the c2-continuous quintic s-curve "y = 6x^5 - 15x^4 + 10x^3".
	 * @param {number} x Input value in the range between zero and one.
	 * @return {number} Value on curve.
	 */

	MathUtils.scurve5 = function (x) {
		return ((6.0 * x - 15.0) * x + 10.0) * x * x * x;
	};

	/* ====================================================================== */

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
	 * @static
	 * @description Converts a point from Cartesian coordinates to Spherical to Cartesian (using positive Y as up) and stores the results in the store var.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {Vector3} store
	 */
	MathUtils.cartesianToSpherical = function(x,y,z, store) {
		var a = Math.sqrt(x*x + z*z);
		store.x = Math.sqrt(x*x+y*y+z*z); // radius
		store.y = Math.atan2(z,x); // azimuth
		store.z = Math.atan2(y,a); // polar
	};

	return MathUtils;
});

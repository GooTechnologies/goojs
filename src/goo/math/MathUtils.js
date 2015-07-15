/*jshint bitwise: false */
define(function () {
	'use strict';

	/**
	 * A collection of useful math-related functions, constants and helpers.
	 * Only used to define the class. Should never be instantiated.
	 */
	function MathUtils() {}

	/** @type {number}
	 * @example
	 * // converts 75 degrees to radians
	 * var rot = 75 * MathUtils.DEG_TO_RAD;
	 */
	MathUtils.DEG_TO_RAD = Math.PI / 180.0;

	/** @type {number}
	 * @example
	 * // converts Math.PI to 180 degrees
	 * var rot = Math.PI  MathUtils.RAD_TO_DEG;
	 */
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;

	/** @type {number}
	 * @example
	 * // uses HALF_PI and converts it to degress
	 * var rot = MathUtils.HALF_PI * MathUtils.RAD_TO_DEG; // rot == 90
	 */
	MathUtils.HALF_PI = 0.5 * Math.PI;

	/** @type {number}
	 * @example
	 * // uses TWO_PI and converts it to degrees
	 * var rot = MathUtils.TWO_PI * RAD_TO_DEG; // rot == 360
	 */
	MathUtils.TWO_PI = 2.0 * Math.PI;

	/** @type {number}
	 * @example
	 * // uses EPSILON to approximate floating point equality
	 * if (Math.abs(a - b) > MathUtils.EPSILON) {
	 * 		// not equal
	 * }
	 */
	MathUtils.EPSILON = 0.00001; //! AT: unfortunately Matrix.invert is too unstable to use a smaller epsilon

	//! AT: why do we have both these functions and the constant above?
	// why are the constants named x_TO_y and and the functions y_FROM_x ?
	/**
	 * Converts an angle from degrees to radians.
	 * @param {Float} degrees Angle in degrees.
	 * @returns {Float} Angle in radians.
	 * @example
	 * // converts 70 degrees to a radian
	 * var a = MathUtils.radFromDeg(70);
	 */
	MathUtils.radFromDeg = function (degrees) {
		return degrees * MathUtils.DEG_TO_RAD;
	};

	/**
	 * Converts an angle from radians to degrees.
	 * @param {Float} radians Angle in radians.
	 * @returns {Float} Angle in degrees.
	 * @example
	 * // converts Math.PI to 180 degrees
	 * var a = MathUtils.degFromRad(Math.PI);
	 */
	MathUtils.degFromRad = function (radians) {
		return radians * MathUtils.RAD_TO_DEG;
	};

	/**
	 * Linearly interpolates between two values. Extrapolates if factor is smaller than zero or greater than one.
	 * @param {number} factor Factor of interpolation.
	 * @param {number} start Start value.
	 * @param {number} end End value.
	 * @returns {number} Interpolated value.
	 * @example
	 * // earlier in code (outside of the update loop)
	 * var x = 0;
	 * // inside the update loop
	 * x = MathUtils.lerp(tpf, x, 5);
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
	 * @returns {number} Clamped value.
	 * @example
	 * var a = -1;
	 * a = Math.clamp(a, 0, 9); // a == 0
	 */
	MathUtils.clamp = function (value, min, max) {
		if (min < max) {
			return value < min ? min : value > max ? max : value;
		} else {
			return value < max ? max : value > min ? min : value;
		}
	};

	/**
	 * Clamps an angle to a given interval. The interval is defined by min and max. If min is larger than max, the clamp will wrap around.
	 * @param {number} value Input value.
	 * @param {number} min Lower bound of interval (inclusive).
	 * @param {number} max Upper bound of interval (inclusive).
	 * @returns {number} Clamped value.
	 * @example
	 * var a = -1;
	 * a = Math.radialClamp(a, 0, 9); // a == 0
	 */
	MathUtils.radialClamp = function (value, min, max) {
		// Rotating coordinates to be mirrored
		var zero = (min + max) / 2 + ((max > min) ? Math.PI : 0);
		var _value = MathUtils.moduloPositive(value - zero, MathUtils.TWO_PI);
		var _min = MathUtils.moduloPositive(min - zero, MathUtils.TWO_PI);
		var _max = MathUtils.moduloPositive(max - zero, MathUtils.TWO_PI);

		// Putting min, max and value on the same circle
		if (value < 0 && min > 0) { min -= MathUtils.TWO_PI; }
		else if (value > 0 && min < 0) { min += MathUtils.TWO_PI; }
		if (value > MathUtils.TWO_PI && max < MathUtils.TWO_PI) { max += MathUtils.TWO_PI; }

		return _value < _min ? min : _value > _max ? max : value;
	};


	/**
	 * Calculates the positive modulo
	 * @param {number} value
	 * @param {number} size
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
	 * @returns {number} Value on curve.
	 */
	MathUtils.scurve3 = function (x) {
		return (-2.0 * x + 3.0) * x * x;
	};

	/**
	 * Computes a value on the c2-continuous quintic s-curve "y = 6x^5 - 15x^4 + 10x^3".
	 * @param {number} x Input value in the range between zero and one.
	 * @returns {number} Value on curve.
	 */
	MathUtils.scurve5 = function (x) {
		return ((6.0 * x - 15.0) * x + 10.0) * x * x * x;
	};

	/**
	 * Converts Spherical coordinates in radians to a Vector3 Cartesian point (using positive Y as up) and stores the results in the store var.
	 * @param {number} radius (distance)
	 * @param {number} azimuth (heading)
	 * @param {number} polar (elevation)
	 * @param {Vector3} store
	 * @example
	 * var distance = 5;
	 * var heading = 180;
	 * var elevation = 30;
	 * var position = new Vector3();
	 * MathUtils.sphericalToCartesian(distance, heading, elevation, position);
	 */
	MathUtils.sphericalToCartesian = function (radius, azimuth, polar, store) {
		var a = radius * Math.cos(polar);

		store.x = a * Math.cos(azimuth);
		store.y = radius * Math.sin(polar);
		store.z = a * Math.sin(azimuth);
	};

	/**
	 * Converts a point from Cartesian coordinates to Spherical radian coordinates (using positive Y as up) and stores the results in the store var.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {Vector3} store
	 * var sphericalCoord = new Vector3();
	 * var pos = entity.transformComponent.transform.translation.
	 * MathUtils.cartesianToSpherical(pos.x, pos.y, pos.z, sphericalCoord);
	 */
	MathUtils.cartesianToSpherical = function (x, y, z, store) {
		var a = Math.sqrt(x * x + z * z);
		store.x = Math.sqrt(x * x + y * y + z * z); // radius
		store.y = Math.atan2(z, x); // azimuth
		store.z = Math.atan2(y, a); // polar
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
	 * @returns {number[]} The triangle's normal
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
	MathUtils.nearestPowerOfTwo = function (value) {
		value--;
		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		value++;
		return value;
	};

	/**
	 * Gets the nearest higher power of two for a value
	 * @deprecated Deprecated as of v0.14.x and scheduled for removal in v0.16.0;
	 * Consider using MathUtils.nearestPowerOfTwo instead
	 * @param {number} value Number to get the nearest power of two from
	 * @returns {number} Nearest power of two
	 */
	MathUtils.nearestHigherPowerOfTwo = MathUtils.nearestPowerOfTwo;

	/**
	 * Returns true if the 2 values supplied are approximately the same
	 * @param v1
	 * @param v2
	 * @param tolerance
	 * @returns {boolean}
	 */
	MathUtils.closeTo = function (v1, v2, tolerance) {
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
		if (!totalArea) {
			if (p[0] === t1[0] && p[2] === t1[2]) {
				return t1;
			} else if (p[0] === t2[0] && p[2] === t2[2]) {
				return t2;
			} else if (p[0] === t3[0] && p[2] === t3[2]) {
				return t3;
			}
		}

		p.z = (t1Area * t1.z + t2Area * t2.z + t3Area * t3.z) / totalArea;
		return p;
	};

	/**
	 * Performs smooth Hermite interpolation between 0 and 1 when edge0 < x < edge1.
	 * This is useful in cases where a threshold function with a smooth transition is desired.
	 * @param {number} edge0 Specifies the value of the lower edge of the Hermite function.
	 * @param {number} edge1 Specifies the value of the upper edge of the Hermite function.
	 * @param {number} x Specifies the source value for interpolation.
	 * @returns {number}
	 */
	MathUtils.smoothstep = function (edge0, edge1, x) {
		x = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
		return x * x * (3 - 2 * x);
	};

	/** @type {number}
	* @example
	* // sets random seed to use with MathUtils.fastRandom()
	* MathUtils.randomSeed = 1337;
	*/
	MathUtils.randomSeed = 1337;

	/**
	 * Rough random generation with seeding. Set random seed through MathUtils.randomSeed = {new seed value}
	 * @returns {number} Random number between 0 and 1.
	 */
	MathUtils.fastRandom = function () {
		MathUtils.randomSeed = (MathUtils.randomSeed * 9301 + 49297) % 233280;
		return MathUtils.randomSeed / 233280;
	};

	return MathUtils;
});

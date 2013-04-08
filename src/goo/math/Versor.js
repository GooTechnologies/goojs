define([
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/Vector'
],
/** @lends Versor */
function (
	Matrix3x3,
	Matrix4x4,
	Vector
) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @class Versors are used to represent rotations. They are equivalent of unit quaternions.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new versor.
	 * @param {Versor|Float[]|Float...} arguments Initial values for the components.
	 */

	function Versor() {
		Vector.call(this, 4);
		var init = arguments.length !== 0 ? arguments : [0, 0, 0, 1];
		this.set(init);
	}

	Versor.prototype = Object.create(Vector.prototype);
	Versor.prototype.setupAliases([['x'], ['y'], ['z'], ['w']]);

	/* ====================================================================== */

	Versor.IDENTITY = new Versor(0, 0, 0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Combines two versors (combines the represented rotation) and stores the result in a separate versor.
	 * @param {Versor} lhs Versor on the left-hand side.
	 * @param {Versor} rhs Versor on the right-hand side.
	 * @param {Versor} [target] Target versor for storage.
	 * @return {Versor} A new versor if the target versor is omitted, else the target versor.
	 */

	Versor.combine = function (lhs, rhs, target) {
		if (!target) {
			target = new Versor();
		}

		if (target === lhs || target === rhs) {
			return Vector.copy(Versor.combine(lhs, rhs), target);
		}

		target.data[0] = lhs.data[3] * rhs.data[0] + rhs.data[3] * lhs.data[0] + rhs.data[2] * lhs.data[1] - rhs.data[1] * lhs.data[2];
		target.data[1] = lhs.data[3] * rhs.data[1] + rhs.data[3] * lhs.data[1] + rhs.data[0] * lhs.data[2] - rhs.data[2] * lhs.data[0];
		target.data[2] = lhs.data[3] * rhs.data[2] + rhs.data[3] * lhs.data[2] + rhs.data[1] * lhs.data[0] - rhs.data[0] * lhs.data[1];
		target.data[3] = lhs.data[3] * rhs.data[3] - (lhs.data[0] * rhs.data[0] + lhs.data[1] * rhs.data[1] + lhs.data[2] * rhs.data[2]);

		return target;
	};

	/**
	 * @description Combines two versors (combines the represented rotation) and stores the result locally.
	 * @param {Versor} rhs Versor on the right-hand side.
	 * @return {Versor} Self for chaining.
	 */

	Versor.prototype.combine = function (rhs) {
		return Versor.combine(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Inverts a versor (inverts the represented rotation) and stores the result in a separate versor.
	 * @param {Versor} source Source versor.
	 * @param {Versor} [target] Target versor for storage.
	 * @return {Versor} A new versor if the target versor is omitted, else the target versor.
	 */

	Versor.invert = function (source, target) {
		if (!target) {
			target = new Versor();
		}

		target.data[0] = 0.0 - source.data[0];
		target.data[1] = 0.0 - source.data[1];
		target.data[2] = 0.0 - source.data[2];
		target.data[3] = source.data[3];

		return target;
	};

	/**
	 * @description Inverts a versor (inverts the represented rotation) and stores the result locally.
	 * @return {Versor} Self for chaining.
	 */

	Versor.prototype.invert = function () {
		return Versor.invert(this, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Constructs a versor from an angle and a rotational axis.
	 * @param {Float} angle The angle in radians.
	 * @param {Vector3} axis The rotational axis.
	 * @param {Versor} [target] Target versor for storage.
	 * @return {Versor} A new versor if the target versor is omitted, else the target versor.
	 */

	Versor.fromAngleAxis = function (angle, axis, target) {
		var sin = Math.sin(angle * 0.5);
		var cos = Math.cos(angle * 0.5);

		if (!target) {
			target = new Versor();
		}

		axis.normalize();

		target.data[0] = axis.data[0] * sin;
		target.data[1] = axis.data[1] * sin;
		target.data[2] = axis.data[2] * sin;
		target.data[3] = cos;

		return target;
	};

	/**
	 * @description Constructs a versor from an angle and a rotational axis.
	 * @param {Float} angle The angle in radians.
	 * @param {Vector3} axis The rotational axis.
	 * @return {Versor} Self for chaining.
	 */

	Versor.prototype.fromAngleAxis = function (angle, axis) {
		return Versor.fromAngleAxis(angle, axis, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Constructs a versor from an angle and a normalized rotational axis.
	 * @param {Float} angle The angle in radians.
	 * @param {Vector3} axis The normalized rotational axis.
	 * @param {Versor} [target] Target versor for storage.
	 * @return {Versor} A new versor if the target versor is omitted, else the target versor.
	 */

	Versor.fromAngleNormalAxis = function (angle, axis, target) {
		var sin = Math.sin(angle * 0.5);
		var cos = Math.cos(angle * 0.5);

		if (!target) {
			target = new Versor();
		}

		target.data[0] = axis.data[0] * sin;
		target.data[1] = axis.data[1] * sin;
		target.data[2] = axis.data[2] * sin;
		target.data[3] = cos;

		return target;
	};

	/**
	 * @description Constructs a versor from an angle and a normalized rotational axis
	 * @param {Float} angle The angle in radians.
	 * @param {Vector3} axis The normalized rotational axis.
	 * @return {Versor} Self for chaining.
	 */

	Versor.prototype.fromAngleNormalAxis = function (angle, axis) {
		return Versor.fromAngleNormalAxis(angle, axis, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Converts a versor into a matrix.
	 * @param {Versor} source Source versor.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Versor.toMatrix3x3 = function (source, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var xx = 2.0 * source.data[0] * source.data[0];
		var yy = 2.0 * source.data[1] * source.data[1];
		var zz = 2.0 * source.data[2] * source.data[2];
		var xy = 2.0 * source.data[0] * source.data[1];
		var xz = 2.0 * source.data[0] * source.data[2];
		var yz = 2.0 * source.data[1] * source.data[2];
		var xw = 2.0 * source.data[0] * source.data[3];
		var yw = 2.0 * source.data[1] * source.data[3];
		var zw = 2.0 * source.data[2] * source.data[3];

		target.e00 = 1.0 - (yy + zz);
		target.e10 = xy + zw;
		target.e20 = xz - yw;

		target.e01 = xy - zw;
		target.e11 = 1.0 - (xx + zz);
		target.e21 = yz + xw;

		target.e02 = xz + yw;
		target.e12 = yz - xw;
		target.e22 = 1.0 - (xx + yy);

		return target;
	};

	/**
	 * @description Converts a versor into a matrix.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Versor.prototype.toMatrix3x3 = function (target) {
		return Versor.toMatrix3x3(this, target);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Converts a versor into a matrix.
	 * @param {Versor} source Source versor.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @return {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Versor.toMatrix4x4 = function (source, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var xx = 2.0 * source.data[0] * source.data[0];
		var yy = 2.0 * source.data[1] * source.data[1];
		var zz = 2.0 * source.data[2] * source.data[2];
		var xy = 2.0 * source.data[0] * source.data[1];
		var xz = 2.0 * source.data[0] * source.data[2];
		var yz = 2.0 * source.data[1] * source.data[2];
		var xw = 2.0 * source.data[0] * source.data[3];
		var yw = 2.0 * source.data[1] * source.data[3];
		var zw = 2.0 * source.data[2] * source.data[3];

		target.e00 = 1.0 - (yy + zz);
		target.e10 = xy + zw;
		target.e20 = xz - yw;
		target.e30 = 0.0;

		target.e01 = xy - zw;
		target.e11 = 1.0 - (xx + zz);
		target.e21 = yz + xw;
		target.e31 = 0.0;

		target.e02 = xz + yw;
		target.e12 = yz - xw;
		target.e22 = 1.0 - (xx + yy);
		target.e32 = 0.0;

		target.e03 = 0.0;
		target.e13 = 0.0;
		target.e23 = 0.0;
		target.e33 = 1.0;

		return target;
	};

	/**
	 * @description Converts a versor into a matrix.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @return {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Versor.prototype.toMatrix4x4 = function (target) {
		return Versor.toMatrix4x4(this, target);
	};

	/* ====================================================================== */

	return Versor;
});

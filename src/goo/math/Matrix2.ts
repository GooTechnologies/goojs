var MathUtils = require('./MathUtils');
import Matrix = require('./Matrix');
var ObjectUtils = require('../util/ObjectUtils');

/**
 * Matrix with 2x2 components.
 * @extends Matrix
 * @param {number...} arguments Initial values for the matrix components.
 */
class Matrix2 extends Matrix {
	constructor(a?, b?, c?, d?){
		super(2, 2);

		if (arguments.length === 0) {
			this.data[0] = 1;
			this.data[3] = 1;
		} else if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Matrix2) {
				this.copy(arguments[0]);
			} else {
				this.setArray(arguments[0]);
			}
		} else {
			for (var i = 0; i < arguments.length; i++) {
				this.data[i] = arguments[i];
			}
		}

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
	}

	set e00(value){ this.data[0] = value; }
	set e10(value){ this.data[1] = value; }
	set e01(value){ this.data[2] = value; }
	set e11(value){ this.data[3] = value; }
	get e00(){ return this.data[0] }
	get e10(){ return this.data[1] }
	get e01(){ return this.data[2] }
	get e11(){ return this.data[3] }

	static IDENTITY = new Matrix2(1, 0, 0, 1);

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix2} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2} Self to allow chaining
	 */
	add(rhs) {
		var thisData = this.data;
		var rhsData = rhs.data;

		thisData[0] += rhsData[0];
		thisData[1] += rhsData[1];
		thisData[2] += rhsData[2];
		thisData[3] += rhsData[3];

		return this;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix2} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2} Self to allow chaining
	 */
	sub(rhs) {
		var thisData = this.data;
		var rhsData = rhs.data;

		thisData[0] -= rhsData[0];
		thisData[1] -= rhsData[1];
		thisData[2] -= rhsData[2];
		thisData[3] -= rhsData[3];

		return this;
	};

	/**
	 * Multiplies this matrix with a scalar
	 * @param {number} scalar
	 * @returns {Matrix2} Self to allow chaining
	 */
	scale(scalar) {
		var data = this.data;

		data[0] *= scalar;
		data[1] *= scalar;
		data[2] *= scalar;
		data[3] *= scalar;

		return this;
	};

	/**
	 * Multiplies this matrix with another matrix
	 * @param {Matrix2} rhs Matrix on the left-hand side
	 * @returns {Matrix2} Self to allow chaining
	 */
	mul(rhs) {
		var s1d = rhs.data;
		var m00 = s1d[0], m01 = s1d[2],
			m10 = s1d[1], m11 = s1d[3];

		var s2d = this.data;
		var n00 = s2d[0], n01 = s2d[2],
			n10 = s2d[1], n11 = s2d[3];

		var rd = this.data;

		rd[0] = m00 * n00 + m01 * n10;
		rd[2] = m00 * n10 + m01 * n11;

		rd[1] = m10 * n00 + m11 * n10;
		rd[3] = m10 * n01 + m11 * n11;

		return this;
	};

	/**
	 * Multiplies two matrices and stores the result in this matrix
	 * @param {Matrix2} lhs Matrix on the left-hand side
	 * @param {Matrix2} rhs Matrix on the right-hand side
	 * @returns {Matrix2} Self to allow chaining
	 */
	mul2(lhs, rhs) {
		var s1d = lhs.data;
		var m00 = s1d[0], m01 = s1d[2],
			m10 = s1d[1], m11 = s1d[3];

		var s2d = rhs.data;
		var n00 = s2d[0], n01 = s2d[2],
			n10 = s2d[1], n11 = s2d[3];

		var rd = this.data;

		rd[0] = m00 * n00 + m01 * n10;
		rd[2] = m00 * n10 + m01 * n11;

		rd[1] = m10 * n00 + m11 * n10;
		rd[3] = m10 * n01 + m11 * n11;

		return this;
	};

	/**
	 * Transposes a matrix (exchanges rows and columns).
	 * @returns {Matrix2} Self to allow chaining
	 */
	transpose() {
		var data = this.data;

		var e10 = data[1];
		data[1] = data[2];
		data[2] = e10;

		return this;
	};

	/**
	 * Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix2} source Source matrix.
	 * @param {Matrix2} [target] Target matrix.
	 * @returns {Matrix2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	static invert(source, target?) {
		if (!target) {
			target = new Matrix2();
		}

		if (target === source) {
			return target.copy(Matrix2.invert(source));
		}

		var det = source.determinant();

		if (Math.abs(det) < MathUtils.EPSILON) {
			return target;
		}

		det = 1.0 / det;

		target.e00 = source.e11 * det;
		target.e10 = 0.0 - source.e10 * det;
		target.e01 = 0.0 - source.e01 * det;
		target.e11 = source.e00 * det;

		return target;
	};

	/**
	 * Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix2} Self for chaining.
	 */
	invert() {
		return Matrix2.invert(this, this);
	};

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {boolean} True if orthogonal.
	 */
	isOrthogonal() {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is normal.
	 * @returns {boolean} True if normal.
	 */
	isNormal() {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11;

		//! AT: why wrap the condition in an if?!
		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is orthonormal.
	 * @returns {boolean} True if orthonormal.
	 */
	isOrthonormal() {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * Computes the determinant of the matrix.
	 * @returns {number} Determinant of matrix.
	 */
	determinant() {
		return this.e00 * this.e11 - this.e01 * this.e10;
	};

	/**
	 * Sets the matrix to identity.
	 * @returns {Matrix2} Self for chaining.
	 */
	setIdentity() {
		this.set(Matrix2.IDENTITY);
		return this;
	};

	/**
	 * Compares two matrices for approximate equality
	 * @param {Matrix2} rhs The matrix to compare against
	 * @returns {boolean}
	 */
	equals(rhs) {
		var thisData = this.data;
		var rhsData = rhs.data;

		return (Math.abs(thisData[0] - rhsData[0]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[1] - rhsData[1]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[2] - rhsData[2]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[3] - rhsData[3]) <= MathUtils.EPSILON);
	};

	/**
	 * Copies component values from another matrix to this matrix
	 * @param {Matrix2} rhs Source matrix
	 * @returns {Matrix2} Self to allow chaining
	 */
	copy(rhs) {
		var thisData = this.data;
		var rhsData = rhs.data;

		thisData[0] = rhsData[0];
		thisData[1] = rhsData[1];
		thisData[2] = rhsData[2];
		thisData[3] = rhsData[3];

		return this;
	};

	/**
	 * Sets matrix values from an array.
	 * @param {Array<number>} rhsData Array source
	 * @returns {Matrix2} Self for chaining.
	 */
	setArray(rhsData) {
		var thisData = this.data;

		thisData[0] = rhsData[0];
		thisData[1] = rhsData[1];
		thisData[2] = rhsData[2];
		thisData[3] = rhsData[3];

		return this;
	};

	/**
	 * Sets the matrix's values from another matrix's values; an alias for .copy
	 * @param {Matrix2} source Source matrix
	 * @returns {Matrix2} Self to allow chaining
	 */
	set(m){
		this.copy(m);
	}

	/**
	 * Returns a new matrix with the same values as the existing one
	 * @returns {Matrix2} The new matrix
	 */
	clone() {
		return new Matrix2().copy(this);
	};

	/*
	// @ifdef DEBUG
	Matrix.addPostChecks(Matrix2.prototype, [
		'add', 'sub', 'scale', 'transpose', 'invert',
		'isOrthogonal', 'determinant',
		'copy'
	]);
	// @endif
	*/
}

export = Matrix2;

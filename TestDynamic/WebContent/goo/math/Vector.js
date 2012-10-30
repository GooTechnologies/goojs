define(function() {
	"use strict";

	/**
	 * Creates a new N-dimensional vector.
	 * 
	 * @name Vector
	 * @class N-dimensional vector class
	 * @param size {Integer} Number of vector components
	 * @property data {Float[]} data Storage for vector components
	 */

	function Vector(size) {
		this.data = new Float32Array(size || 0);
	}

	/**
	 * Add two N-dimensional vectors and store the result in a new vector.
	 * 
	 * @param lhs {@link Vector} Left-hand side
	 * @param rhs {@link Vector} Right-hand side
	 * @param target {@link Vector} Target vector (optional)
	 */

	Vector.add = function(lhs, rhs, target) {
		var size = Math.min(lhs.data.length, rhs.data.length);

		if (!target) {
			target = new Vector(size);
		}

		for ( var i = 0; i < size; i++) {
			target.data[i] = lhs.data[i] + rhs.data[i];
		}

		return target;
	};

	/**
	 * Subtract two N-dimensional vectors and store the result in a new vector.
	 * 
	 * @param lhs {@link Vector} Left-hand side
	 * @param rhs {@link Vector} Right-hand side
	 * @param target {@link Vector} Target vector (optional)
	 */

	Vector.sub = function(lhs, rhs, target) {
		var size = Math.min(lhs.data.length, rhs.data.length);

		if (!target) {
			target = new Vector(size);
		}

		for ( var i = 0; i < size; i++) {
			target.data[i] = lhs.data[i] - rhs.data[i];
		}

		return target;
	};

	/**
	 * Add an N-dimensional vector and store the result locally.
	 * 
	 * @param rhs {@link Vector} Right-hand side
	 */

	Vector.prototype.add = function(rhs) {
		var size = Math.min(this.data.length, rhs.data.length);

		for ( var i = 0; i < size; i++) {
			this.data[i] += b.data[i];
		}

		return this;
	};

	/**
	 * Subtract an N-dimensional vector and store the result locally.
	 * 
	 * @param rhs {@link Vector} Right-hand side
	 */

	Vector.prototype.sub = function(rhs) {
		var size = Math.min(this.data.length, rhs.data.length);

		for ( var i = 0; i < size; i++) {
			this.data[i] -= b.data[i];
		}

		return this;
	};

	/**
	 * Subtract an N-dimensional vector and store the result locally.
	 * 
	 * @param rhs {@link Vector} Right-hand side
	 */

	Vector.prototype.dot = function() {
		var result = 0.0;

		for ( var i = 0; i < this.data.length; i++) {
			result += this.data[i] * this.data[i];
		}

		return result;
	};

	Vector.prototype.length = function() {
		return Math.sqrt(this.dot());
	};

	return Vector;
});

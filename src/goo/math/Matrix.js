define([
	'goo/math/MathUtils'
], function (
	MathUtils
) {
	'use strict';

	/**
	 * Matrix with RxC components.
	 * @param {number} rows Number of rows.
	 * @param {number} cols Number of columns.
	 */
	function Matrix(rows, cols) {
		this.rows = rows || 0;
		this.cols = cols || 0;
		/** Column-major storage for the matrix components.
		 * @type {Float32Array}
		 */
		this.data = new Float32Array(this.rows * this.cols);
	}

	/**
	 * Binds aliases to the different matrix components.
	 * @hidden
	 * @param {Object} prototype The prototype to bind to.
	 * @param {string[][]} aliases Array of component aliases for each component index.
	 */
	Matrix.setupAliases = function (prototype, aliases) {
		aliases.forEach(function (aliasesPerComponent, index) {
			aliasesPerComponent.forEach(function (alias) {
				Object.defineProperty(prototype, alias, {
					get: function () {
						return this.data[index];
					},
					set: function (value) {
						this.data[index] = value;
						// #ifdef DEBUG
						if (isNaN(this.data[index])) {
							throw new Error('Tried setting NaN to matrix component ' + alias);
						}
						// #endif
					}
				});
			});

			Object.defineProperty(prototype, index, {
				get: function () {
					return this.data[index];
				},
				set: function (value) {
					this.data[index] = value;
					// #ifdef DEBUG
					if (isNaN(this.data[index])) {
						throw new Error('Tried setting NaN to matrix component ' + index);
					}
					// #endif
				}
			});
		});
	};

	// #ifdef DEBUG
	/**
	 * Throws an error if any of the matrix's components are NaN
	 * @hidden
	 */
	Matrix.prototype.checkIntegrity = function () {
		for (var i = 0; i < this.data.length; i++) {
			if (isNaN(this.data[i])) {
				throw new Error('Matrix contains NaN at index ' + i);
			}
		}
	};

	/**
	 * Replaces the supplied method of object and wraps it in a integrity check
	 * @hidden
	 * @param {object} object The object to attach the post-check to
	 * @param {string} methodName The name of the original method the check is attached to
	 */
	Matrix.addPostCheck = function (object, methodName) {
		var originalMethod = object[methodName];
		object[methodName] = function () {
			var ret = originalMethod.apply(this, arguments);
			if (typeof ret === 'number') {
				if (isNaN(ret)) {
					throw new Error('Matrix method ' + methodName + ' returned NaN');
				}
			}

			this.checkIntegrity();
			return ret;
		};
	};

	/**
	 * Adds more validators at once
	 * @hidden
	 * @param object
	 * @param {string[]} methodNames
	 */
	Matrix.addPostChecks = function (object, methodNames) {
		methodNames.forEach(Matrix.addPostCheck.bind(null, object));
	};
	// #endif

	/**
	 * Sets the components of the matrix.
	 * @param {Matrix|number[]|...number} arguments Component values.
	 * @returns {Matrix} Self for chaining.
	 */
	Matrix.prototype.set = function () {
		if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Matrix) {
				this.copy(arguments[0]);
			} else {
				for (var i = 0; i < arguments[0].length; i++) {
					this.data[i] = arguments[0][i];
				}
			}
		} else {
			for (var i = 0; i < arguments.length; i++) {
				this.data[i] = arguments[i];
			}
		}

		return this;
	};

	return Matrix;
});

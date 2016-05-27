/**
 * Matrix with RxC components.
 * @param {number} rows Number of rows.
 * @param {number} cols Number of columns.
 */
class Matrix {
	rows: number;
	cols: number;
	data: Float32Array;
	constructor(rows, cols) {
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
	 * @param {Array<Array<string>>} aliases Array of component aliases for each component index.
	 */
	static setupAliases(prototype, aliases) {
		aliases.forEach(function (aliasesPerComponent, index) {
			aliasesPerComponent.forEach(function (alias) {
				Object.defineProperty(prototype, alias, {
					get: function () {
						return this.data[index];
					},
					set: function (value) {
						this.data[index] = value;
						// @ifdef DEBUG
						if (isNaN(this.data[index])) {
							throw new Error('Tried setting NaN to matrix component ' + alias);
						}
						// @endif
					}
				});
			});

			Object.defineProperty(prototype, index, {
				get: function () {
					return this.data[index];
				},
				set: function (value) {
					this.data[index] = value;
					// @ifdef DEBUG
					if (isNaN(this.data[index])) {
						throw new Error('Tried setting NaN to matrix component ' + index);
					}
					// @endif
				}
			});
		});
	};

	// @ifdef DEBUG
	/**
	 * Throws an error if any of the matrix's components are NaN
	 * @hidden
	 */
	checkIntegrity() {
		for (var i = 0; i < this.data.length; i++) {
			if (isNaN(this.data[i])) {
				throw new Error('Matrix contains NaN at index ' + i);
			}
		}
	};

	/**
	 * Replaces the supplied method of object and wraps it in a integrity check
	 * @hidden
	 * @param {Object} object The object to attach the post-check to
	 * @param {string} methodName The name of the original method the check is attached to
	 */
	static addPostCheck(object, methodName) {
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
	 * @param {Array<string>} methodNames
	 */
	static addPostChecks(object, methodNames) {
		methodNames.forEach(Matrix.addPostCheck.bind(null, object));
	};
	// @endif
}

export = Matrix;
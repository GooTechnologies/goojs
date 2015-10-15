define([
	'goo/math/MathUtils'
], function (
	MathUtils
	) {
	'use strict';

	/**
	 * Abstract vector class
	 */
	function Vector(size) {

		/**
		 * @hidden
		 * @deprecated
		 */
		this._size = size;
	}

	var COMPONENT_NAMES = ['x', 'y', 'z', 'w'];
	// #ifdef DEBUG
	var COMPONENT_NAMES = ['_x', '_y', '_z', '_w'];
	// #endif

	/**
	 * Binds aliases to the different vector components.
	 * @hidden
	 * @param {Object} prototype The prototype to bind to.
	 * @param {Array<Array<string>>} aliases Array of component aliases for each component index.
	 */
	Vector.setupAliases = function (prototype, aliases) {
		aliases.forEach(function (aliasesPerComponent, index) {
			var componentName = COMPONENT_NAMES[index];

			aliasesPerComponent.forEach(function (alias) {
				Object.defineProperty(prototype, alias, {
					get: function () {
						return this[componentName];
					},
					set: function (value) {
						this[componentName] = value;

						// #ifdef DEBUG
						if (isNaN(this[componentName])) {
							throw new Error('Tried setting NaN to vector component ' + alias);
						}
						// #endif
					}
				});
			});
		});
	};

	// #ifdef DEBUG
	Vector.setupIndices = function (prototype, count) {
		var raise = function () {
			throw new Error('Vector component access through indices is not supported anymore');
		};

		for (var i = 0; i < count; i++) {
			Object.defineProperty(prototype, i, {
				get: raise,
				set: raise
			});
		}
	};

	/**
	 * Replaces the supplied method of object and wraps it in a integrity check
	 * @hidden
	 * @param {Object} object The object to attach the post-check to
	 * @param {string} methodName The name of the original method the check is attached to
	 */
	Vector.addReturnCheck = function (object, methodName) {
		var originalMethod = object[methodName];
		object[methodName] = function () {
			var ret = originalMethod.apply(this, arguments);
			if (isNaN(ret)) {
				throw new Error('Vector method ' + methodName + ' returned NaN');
			}

			return ret;
		};
	};

	/**
	 * Adds more validators at once
	 * @hidden
	 * @param {Object} object
	 * @param {Array<string>} methodNames
	 */
	Vector.addReturnChecks = function (object, methodNames) {
		methodNames.forEach(Vector.addReturnCheck.bind(null, object));
	};
	// #endif

	// SHIM START
	Object.defineProperty(Vector.prototype, 'data', {
		get: function () {
			var data = [];
			var that = this;
			console.warn('The .data property of Vector was removed, please use the .x, .y, .z, .w properties instead.');
			Object.defineProperties(data, {
				'0': {
					get: function () {
						return that.x;
					},
					set: function (value) {
						that.x = value;
					}
				},
				'1': {
					get: function () {
						return that.y;
					},
					set: function (value) {
						that.y = value;
					}
				},
				'2': {
					get: function () {
						return that.z;
					},
					set: function (value) {
						that.z = value;
					}
				},
				'3': {
					get: function () {
						return that.w;
					},
					set: function (value) {
						that.w = value;
					}
				}
			});
			return data;
		}
	});

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.add = function (lhs, rhs, target) {
		console.warn('Vector.add is deprecated.');
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = lhs._size;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] + rdata[i];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.add = function (rhs) {
		console.warn('Vector.prototype.add is deprecated.');
		return Vector.add(this, rhs, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.sub = function (lhs, rhs, target) {
		console.warn('Vector.sub is deprecated.');
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = lhs._size;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] - rdata[i];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.sub = function (rhs) {
		console.warn('Vector.prototype.sub is deprecated.');
		return Vector.sub(this, rhs, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.mul = function (lhs, rhs, target) {
		console.warn('Vector.mul is deprecated.');
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = lhs._size;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] * rdata[i];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.mul = function (rhs) {
		console.warn('Vector.prototype.mul is deprecated.');
		return Vector.mul(this, rhs, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.div = function (lhs, rhs, target) {
		console.warn('Vector.div is deprecated.');
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = lhs._size;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] / rdata[i];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.div = function (rhs) {
		console.warn('Vector.prototype.div is deprecated.');
		return Vector.div(this, rhs, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.copy = function (source, target) {
		console.warn('Vector.copy is deprecated.');
		var size = source._size;

		if (!target) {
			target = new Vector(size);
		}

		for(var i=0; i<size; i++){
			target.data[i] = source.data[i];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.copy = function (source) {
		console.warn('Vector.prototype.copy  is deprecated.');
		var size = source._size;
		for(var i=0; i<size; i++){
			this.data[i] = source.data[i];
		}
		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.dot = function (lhs, rhs) {
		console.warn('Vector.dot is deprecated.');
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = lhs._size;

		var sum = 0;

		for (var i = 0; i < size; i++) {
			sum += ldata[i] * rdata[i];
		}

		return sum;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.dot = function (rhs) {
		console.warn('Vector.prototype.dot is deprecated.');
		return Vector.dot(this, rhs);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.apply = function (lhs, rhs, target) {
		console.warn('Vector.apply is deprecated.');
		var rows = lhs.rows;
		var cols = lhs.cols;
		var size = rhs._size;

		if (!target) {
			target = new Vector(rows);
		}

		if (target === rhs) {
			return Vector.copy(Vector.apply(lhs, rhs), target);
		}

		for (var c = 0; c < cols; c++) {
			var o = c * rows;

			for (var r = 0; r < rows; r++) {
				var sum = 0.0;

				for (var i = 0; i < size; i++) {
					sum += lhs.data[i * lhs.rows + r] * rhs.data[i];
				}

				target.data[o + r] = sum;
			}
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.apply = function (lhs) {
		console.warn('Vector.prototype.apply is deprecated.');
		return Vector.apply(lhs, this, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.equals = function (lhs, rhs) {
		console.warn('Vector.equals is deprecated.');
		var lhsLength = lhs._size;
		if (lhsLength !== rhs._size) {
			return false;
		}

		for (var i = 0; i < lhsLength; i++) {
			// why the backwards check? because otherwise if NaN is present in either lhs or rhs
			// then Math.abs(NaN) is NaN which is neither bigger or smaller than EPSILON
			// which never satisfies the condition
			// NaN is not close to to NaN and we want to preserve that for vectors as well
			if (!(Math.abs(lhs.data[i] - rhs.data[i]) <= MathUtils.EPSILON)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.equals = function (rhs) {
		console.warn('Vector.prototype.equals is deprecated.');
		return Vector.equals(this, rhs);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.distanceSquared = function (lhs, rhs) {
		console.warn('Vector.distanceSquared is deprecated.');
		return Vector.sub(lhs, rhs).lengthSquared();
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.distanceSquared = function (rhs) {
		console.warn('Vector.prototype.distanceSquared is deprecated.');
		return Vector.sub(this, rhs).lengthSquared();
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.distance = function (lhs, rhs) {
		console.warn('Vector.distance is deprecated.');
		return Vector.sub(lhs, rhs).length();
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.distance = function (rhs) {
		console.warn('Vector.prototype.distance is deprecated.');
		return Vector.sub(this, rhs).length();
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.lengthSquared = function () {
		console.warn('Vector.prototype.lengthSquared is deprecated.');
		return Vector.dot(this, this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.length = function () {
		console.warn('Vector.prototype.length is deprecated.');
		return Math.sqrt(Vector.dot(this, this));
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.scale = function(factor) {
		console.warn('Vector.prototype.scale is deprecated.');
		for (var i = this._size - 1; i >= 0; i--) {
			this.data[i] *= factor;
		}
		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.invert = function () {
		console.warn('Vector.prototype.invert is deprecated.');
		for (var i = 0; i < this._size; i++) {
			this.data[i] = 0.0 - this.data[i];
		}

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.normalize = function () {
		console.warn('Vector.prototype.normalize is deprecated.');
		var l = this.length();
		var dataLength = this._size;

		if (l < MathUtils.EPSILON) {
			for (var i = 0; i < dataLength; i++) {
				this.data[i] = 0;
			}
		} else {
			l = 1.0 / l;
			for (var i = 0; i < dataLength; i++) {
				this.data[i] *= l;
			}
		}

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.clone = function () {
		console.warn('Vector.prototype.clone is deprecated.');
		return Vector.copy(this);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.set = function () {
		console.warn('Vector.prototype.set is deprecated.');
		if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Vector) {
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

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector.prototype.toString = function () {
		console.warn('Vector.prototype.toString is deprecated.');
		var string = '';

		string += '[';

		for (var i = 0; i < this._size; i++) {
			string += this.data[i];
			string += i !== this._size - 1 ? ', ' : '';
		}

		string += ']';

		return string;
	};
	// SHIM END

	return Vector;
});

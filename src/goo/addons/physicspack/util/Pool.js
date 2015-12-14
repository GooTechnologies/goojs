define([
],
function (
) {
	'use strict';

	/**
	 * Abstract pool class for object pooling.
	 * @param {Object} [settings]
	 * @param {Function} [settings.init]
	 * @param {Function} [settings.create]
	 * @param {Function} [settings.destroy]
	 * @example
	 * var vectorPool = new Pool({
	 *     create: function () {
	 *         return new Vector3();
	 *     },
	 *     init: function (x, y, z){
	 *         this.set(x, y, z);
	 *     },
	 *     destroy: function (vector) {
	 *         vector.set(0, 0, 0);
	 *     }
	 * });
	 * var vector = vectorPool.get(1, 2, 3);
	 * vectorPool.release(vector);
	 */
	function Pool(settings) {
		settings = settings || {};

		/**
		 * @private
		 * @type {Array}
		 */
		this._objects = [];

		/**
		 * @private
		 * @type {Function}
		 */
		this._init = settings.init || function () {};

		/**
		 * @private
		 * @type {Function}
		 */
		this._create = settings.create || function () {};

		/**
		 * @private
		 * @type {Function}
		 */
		this._destroy = settings.destroy || function () {};
	}

	/**
	 * Fill the pool so it has exactly "size" objects. If the current number of objects is larger than the requested size, the excess objects are destroyed.
	 * @param {number} size
	 */
	Pool.prototype.resize = function (size) {
		var objects = this._objects;

		// Destroy excess objects
		while (objects.length > size) {
			this._destroy(objects.pop());
		}

		// Allocate new objects
		while (objects.length < size) {
			objects.push(this._create());
		}

		return this;
	};

	/**
	 * Get an object from the pool if there are free ones, or create a new object.
	 * @returns {Object}
	 */
	Pool.prototype.get = function () {
		var objects = this._objects;
		var object = objects.length ? objects.pop() : this._create();
		this._init.apply(object, arguments);
		return object;
	};

	/**
	 * Put an object back into the pool.
	 * @param {Object} object
	 */
	Pool.prototype.release = function (object) {
		this._destroy(object);
		this._objects.push(object);
		return this;
	};

	return Pool;
});
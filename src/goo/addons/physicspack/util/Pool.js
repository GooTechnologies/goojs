define([
],
function (
) {
	'use strict';

	/**
	 * Abstract pool class for object pooling.
	 */
	function Pool() {
		/**
		 * @private
		 * @type {Array}
		 */
		this.objects = [];
	}

	/**
	 * Fill the pool so it has exactly "size" objects. If the current number of objects is larger than the requested size, the excess objects will be destroyed.
	 * @param {number} size
	 * @param {array} args An argument list that should be used when executing each .create()
	 */
	Pool.prototype.fill = function (size, args) {
		var objects = this.objects;

		// Destroy excess objects
		while (objects.length > size) {
			this.destroy(objects.pop());
		}

		// Allocate new objects
		while (objects.length < size) {
			objects.push(this.create.apply(this, args));
		}
	};

	/**
	 * Get an object from the pool if there are free ones, or create a new object.
	 * @returns {Object}
	 */
	Pool.prototype.get = function () {
		var objects = this.objects;
		return objects.length ? objects.pop() : this.create.apply(this, arguments);
	};

	/**
	 * Put an object back into the pool.
	 * @param {Object} object
	 */
	Pool.prototype.release = function (object) {
		this.destroy(object);
		this.objects.push(object);
	};

	/**
	 * Construct a new object. Should be implemented by subclasses.
	 * @virtual
	 * @target-class Pool create method
	 * @returns {Object}
	 */

	/**
	 * Clean the object so it can be put back into the pool. Should be implemented by subclasses.
	 * @virtual
	 * @target-class Pool destroy method
	 */

	return Pool;
});
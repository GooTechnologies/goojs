define(function () {
	'use strict';

	/**
	 * Underscore-like utilities
	 */
	function ObjectUtil() {}

	/**
	 * Copies properties from an object onto another object if they're not already present
	 * @param {Object} destination Destination object to copy to
	 * @param {Object} source Source object to copy from
	 * @returns {Object} Returns the destination object
	 */
	ObjectUtil.defaults = function (destination, source) {
		var keys = Object.keys(source);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (typeof destination[key] === 'undefined' || destination[key] === null) {
				destination[key] = source[key];
			}
		}

		return destination;
	};

	/**
	 * Copies properties from an object onto another object; overwrites existing properties
	 * @param {Object} destination Destination object to copy to
	 * @param {Object} source Source object to copy from
	 * @returns {Object} Returns the destination object
	 */
	ObjectUtil.extend = function (destination, source) {
		var keys = Object.keys(source);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			destination[key] = source[key];
		}

		return destination;
	};

	ObjectUtil.isObject = function (obj) {
		return obj === Object(obj);
	};

	// Create a (shallow-cloned) duplicate of an object.
	ObjectUtil.clone = function (obj) {
		if (!ObjectUtil.isObject(obj)) { return obj; }
		return Array.isArray(obj) ? obj.slice() : ObjectUtil.extend({}, obj);
	};

	// Save bytes in the minified (but not gzipped) version:
	var nativeForEach = Array.prototype.forEach;

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	ObjectUtil.each = ObjectUtil.forEach = function (obj, iterator, context, sortProp) {
		if (typeof obj === 'undefined' || obj === null) { return; }
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				iterator.call(context, obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			if (sortProp !== undefined) {
				keys.sort(function (a, b) {
					return obj[a][sortProp] - obj[b][sortProp];
				});
			}
			for (var i = 0, length = keys.length; i < length; i++) {
				iterator.call(context, obj[keys[i]], keys[i], obj);
			}
		}
	};

	/**
	 * Performs a deep clone. Can handle primitive types, arrays, generic objects, typed arrays and html nodes. Functions are shared. Does not handle circular references - also does not preserve original constructors/prototypes.
	 * @param {*} object Object to clone
	 * @returns {*}
	 */
	ObjectUtil.deepClone = function (object) {
		// handle primitive types, functions, null and undefined
		if (object === null || typeof object !== 'object') {
			return object;
		}

		// handle typed arrays
		if (Object.prototype.toString.call(object.buffer) === '[object ArrayBuffer]') {
			return new object.constructor(object);
		}

		// handle arrays (even sparse ones)
		if (object instanceof Array) {
			return object.map(ObjectUtil.deepClone);
		}

		// handle html nodes
		if (object.nodeType && typeof object.cloneNode === 'function') {
			return object.cloneNode(true);
		}

		// handle generic objects
		// prototypes and constructors will not match in the clone
		var copy = {};
		var keys = Object.keys(object);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			copy[key] = ObjectUtil.deepClone(object[key]);
		}
		return copy;
	};

	ObjectUtil.shallowSelectiveClone = function (source, keys) {
		var clone = {};

		keys.forEach(function (key) {
			clone[key] = source[key];
		});

		return clone;
	};

	// probably not the best way to copy maps and sets
	ObjectUtil.cloneMap = function (source) {
		var clone = new Map();
		source.forEach(function (value, key) {
			clone.set(key, value);
		});
		return clone;
	};

	ObjectUtil.cloneSet = function (source) {
		var clone = new Set();
		source.forEach(function (value) {
			clone.add(value);
		});
		return clone;
	};

	return ObjectUtil;
});
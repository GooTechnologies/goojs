/**
 * Everything we need from underscore.js. Convenience stuff, copied straight off.
 * For documentation, see http://underscorejs.org. Gotta love open source.
 */
define([],
	/** @lends */
	function () {
	'use strict';

	var _ = {};

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var slice = ArrayProto.slice;

	var nativeForEach = ArrayProto.forEach;

	_.defaults = function (obj) {
		each(slice.call(arguments, 1), function (source) {
			if (source) {
				//! AT: apparently for in loops are the source of all evil (function can't be optimised, yadayada)
				// write a unit test before refactoring to ensure the semantics are the same
				for (var prop in source) {
					if (typeof obj[prop] === 'undefined' || obj[prop] === null) { obj[prop] = source[prop]; }
				}
			}
		});
		return obj;
	};

	_.extend = function (obj) {
		each(slice.call(arguments, 1), function (source) {
			if (source) {
				//! AT: apparently for in loops are the source of all evil (function can't be optimised, yadayada)
				// write a unit test before refactoring to ensure the semantics are the same
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};

	_.isObject = function(obj) {
		return obj === Object(obj);
	};

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) {
		if (!_.isObject(obj)) { return obj; }
		return Array.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = _.each = _.forEach = function (obj, iterator, context, sortProp) {
		if (typeof obj === 'undefined' || obj === null) {return;}
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				iterator.call(context, obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			if (sortProp !== undefined) {
				keys.sort(function(a, b) {
					return obj[a][sortProp] - obj[b][sortProp];
				});
			}
			for (var i = 0, length = keys.length; i < length; i++) {
				iterator.call(context, obj[keys[i]], keys[i], obj);
			}
		}
	};

	/**
	 * from http://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
	 */
	_.deepClone = function (item) {
		if (!item) { return item; } // null, undefined values check

		var types = [Number, String, Boolean];
		var result;

		// normalizing primitives if someone did new String('aaa'), or new Number('444');
		types.forEach(function (type) {
			if (item instanceof type) {
				result = type(item);
			}
		});

		if (typeof result === 'undefined') {
			if (Object.prototype.toString.call(item) === '[object Array]') {
				result = [];
				item.forEach(function (child, index) {
					result[index] = _.deepClone(child);
				});
			} else if (typeof item === 'object') {
				// testing that this is DOM
				if (item.nodeType && typeof item.cloneNode === 'function') {
					var result = item.cloneNode(true); // unused result?
				} else if (!item.prototype) { // check that this is a literal
					if (item instanceof Date) {
						result = new Date(item);
					} else {
						// it is an object literal
						result = {};
						//! AT: apparently for in loops are the source of all evil (function can't be optimised, yadayada)
						// write a unit test before refactoring to ensure the semantics are the same
						for (var i in item) {
							result[i] = _.deepClone(item[i]);
						}
					}
				} else {
					// depending what you would like here,
					// just keep the reference, or create new object
					if (false && item.constructor) {
						// would not advice to do that, reason? Read below
						result = new item.constructor();
					} else {
						result = item;
					}
				}
			} else {
				result = item;
			}
		}

		return result;
	};

	_.shallowSelectiveClone = function (source, keys) {
		var clone = {};

		keys.forEach(function (key) {
			clone[key] = source[key];
		});

		return clone;
	};

	// probably not the best way to copy maps and sets
	_.cloneMap = function (source) {
		var clone = new Map();
		source.forEach(function (value, key) {
			clone.set(key, value);
		});
		return clone;
	};

	_.cloneSet = function (source) {
		var clone = new Set();
		source.forEach(function (value) {
			clone.add(value);
		});
		return clone;
	};

	return _;
});
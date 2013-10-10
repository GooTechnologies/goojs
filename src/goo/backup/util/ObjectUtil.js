/** 
 * Everything we need from underscore.js. Convenience stuff, copied straight off. 
 * For documentation, see http://underscorejs.org. Gotta love open source.
 */
define([], function() {
	var _ = {};


	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype,
//			FuncProto = Function.prototype
			ObjProto = Object.prototype;

	var breaker = {};

	// Create quick reference variables for speed access to core prototypes.
	var slice						 = ArrayProto.slice,
//			push						 = ArrayProto.push,
//			concat					 = ArrayProto.concat,
			toString				 = ObjProto.toString,
			hasOwnProperty	 = ObjProto.hasOwnProperty;

	// Maybe there is an Array.isArray
	var nativeIsArray		 = Array.isArray,
			nativeKeys			 = Object.keys,
			nativeForEach		 = ArrayProto.forEach;

	_.has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	_.defaults = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					if (typeof obj[prop] === 'undefined' || obj[prop] === null) { obj[prop] = source[prop]; }
				}
			}
		});
		return obj;
	};

	_.extend = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			if (source) {
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
		if (!_.isObject(obj)) {return obj;}
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};

	_.keys = nativeKeys || function(obj) {
		if (obj !== Object(obj)) {throw new TypeError('Invalid object');}
		var keys = [];
		for (var key in obj) {
			if (_.has(obj, key)) {
				keys[keys.length] = key;
			}
		}
		return keys;
	};



	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = _.each = _.forEach = function(obj, iterator, context) {
		if (typeof obj === 'undefined' || obj === null) {return;}
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) {return;}
			}
		} else {
			for (var key in obj) {
				if (_.has(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) {return;}
				}
			}
		}
	};



	/**
	 * from http://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
	 */
	_.deepClone = function(item) {
		if (!item) { return item; } // null, undefined values check

		var types = [ Number, String, Boolean ],
			result;

		// normalizing primitives if someone did new String('aaa'), or new Number('444');
		types.forEach(function(type) {
			if (item instanceof type) {
				result = type( item );
			}
		});

		if (typeof result == "undefined") {
			if (Object.prototype.toString.call( item ) === "[object Array]") {
				result = [];
				item.forEach(function(child, index, array) {
					result[index] = _.deepClone( child );
				});
			} else if (typeof item == "object") {
				// testing that this is DOM
				if (item.nodeType && typeof item.cloneNode == "function") {
					var result = item.cloneNode( true );
				} else if (!item.prototype) { // check that this is a literal
					if (item instanceof Date) {
						result = new Date(item);
					} else {
						// it is an object literal
						result = {};
						for (var i in item) {
							result[i] = _.deepClone( item[i] );
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

	_.indexOf = function(array, item) {
		for (var i = 0; i < array.length; i++) {
			if (i in array && array[i] === item) {
				return i;
			}
		}
		return -1;
	};

	return _;
});
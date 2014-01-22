define([], function () {
	'use strict';

	/**
	 * Generic Selection object
	 * @constructor
	 */
	function Selection() {
		this.stack = [];

		//! AT: may rather use toArray
		if (arguments.length === 1) {
			var argument = arguments[0];
			if (argument instanceof Selection) {
				if (argument.top) {
					this.stack.push(argument.top);
				}
			} else if (Array.isArray(argument)) {
				this.stack.push(argument);
			} else {
				this.stack.push([argument]);
			}
		} else if (arguments.length > 1) {
			this.stack.push(Array.prototype.slice.call(arguments, 0));
		}

		if (this.stack.length > 0) {
			this.stack[0] = removeDuplicates(this.stack[0]);
		}

		this.top = this.stack.length === 0 ? null : this.stack[0];
	}

	/**
	 * Empty selection
	 * @type {Selection}
	 */
	Selection.EMPTY = new Selection();

	/**
	 * Returns true if the selection contains a specific element
	 * @param element
	 * @returns {boolean}
	 */
	Selection.prototype.contains = function (element) {
		if (top === null) { return false; }

		return this.top.indexOf(element) !== -1;
	};

	/**
	 * Returns the size of this selection
	 * @returns {number}
	 */
	Selection.prototype.size = function () {
		if (top === null) { return 0; }

		return this.top.length;
	};

	/**
	 * Applies a function on each element until `false` is returned
	 * @param fun The function to apply
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.each = function (fun) {
		//! AT: this check should be done automatically before each method
		if (top === null) { return this; }

		//! AT: fun is already a function; can't avoid the function calls
		var top = this.top.some(fun);
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 * Applies a filter on the elements of this selection
	 * @param predicate The filter used for filtering
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.filter = function (predicate) {
		//! AT: this check should be done automatically before each method
		if (top === null) { return this; }

		var top = this.top.filter(predicate);
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 * Applies a function on the elements of this selection producing a new collection
	 * @param predicate The function to apply to each element
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.map = function (fun) {
		//! AT: this check should be done automatically before each method
		if (top === null) { return this; }

		var top = this.top.map(fun);
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 *
	 * @param fun
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.flatMap = function (fun) {
		//! AT: this check should be done automatically before each method
		if (top === null) { return this; }

		var map = this.top.map(fun);
		var flatMap = map.reduce(function (prev, cur) { return prev.concat(cur); }, []);
		this.stack.push(flatMap);
		this.top = flatMap;

		return this;
	};

	/**
	 *
	 * @param fun
	 * @param initialValue
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.reduce = function (fun, initialValue) {
		//! AT: this check should be done automatically before each method
		if (top === null) { return this; }

		var top = [this.top.reduce(fun, initialValue)];
		this.stack.push(top);
		this.top = top;

		return this;
	};


	// set ops
	/**
	 *
	 * @param that
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.and = function () {
		if (top === null) { return this; }

		var that = toArray.apply(null, arguments);

		var union = this.top.concat(that);
		union = removeDuplicates(union);
		this.stack.push(union);
		this.top = union;

		return this;
	};

	/**
	 *
	 * @param that
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.intersects = function (that) {
		if (top === null) { return this; }

		var that = toArray.apply(null, arguments);

		var intersection = [];

		//! AT: when searching for arbitrary objects in an array searching by pointer (reference) is the only way
		// hopefully, if longArray is represented as some tree/hash with fast .indexOf()
		// so that I can iterate over the shorter array and do query the long array
		// best case: short array has one element and if indexOf takes O(log(longArray.length)) (or even better) time
		// worst case scenario: both arrays are of the same length and this optimisation is useless - it takes
		// O(shortArray.length * log(longArray.length)) time
		var shortArray, longArray;
		if (that.length > this.top.length) {
			shortArray = this.top;
			longArray = that;
		} else {
			shortArray = that;
			longArray = this.top;
		}

		for (var i = 0; i < shortArray.length; i++) {
			var element = shortArray[i];
			if (longArray.indexOf(element) !== -1) {
				intersection.push(element);
			}
		}

		this.stack.push(intersection);
		this.top = intersection;

		return this;
	};

	/**
	 *
	 * @param that
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.without = function (that) {
		if (top === null) { return this; }

		var that = toArray.apply(null, arguments);

		var difference = [];

		for (var i = 0; i < this.top.length; i++) {
			var element = this.top[i];
			if (that.indexOf(element) === -1) {
				difference.push(element);
			}
		}

		this.stack.push(difference);
		this.top = difference;

		return this;
	};


	// stack ops
	/**
	 * Adds the previous selection to the current selection
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.andSelf = function () {
		if (top === null) { return this; }

		if (this.stack.length <= 1) { return this; }

		var prev = this.stack[this.stack.length - 2];

		var union = prev.concat(this.top);
		union = removeDuplicates(union);
		this.stack.push(union);
		this.top = union;

		return this;
	};

	/**
	 * Discards the last operation done on the selection
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.end = function () {
		if (top === null) { return this; }

		this.stack.pop();

		if (this.stack.length === 0) {
			this.top = null;
		} else {
			this.top = this.stack[this.stack.length - 1];
		}

		return this;
	};

	/**
	 * Returns the first object of the selection
	 * @returns {*}
	 */
	Selection.prototype.first = function () {
		return this.top === null ? null : this.top[0];
	};

	/**
	 * Returns the selection as an array
	 * @returns {Array}
	 */
	Selection.prototype.toArray = function () {
		return this.top === null ? [] : this.top.concat([]);
	};

	//! AT: slow //will be faster for EntitySelection
	function removeDuplicates(array) {
		var newArray = [];

		for (var i = 0; i < array.length; i++) {
			var element = array[i];
			// hopefully lastIndexOf is faster than O(n)
			if (array.lastIndexOf(element) === i) {
				newArray.push(element);
			}
		}

		return newArray;
	}

	/**
	 * Converts anything (nothing, a Selection, an array or more arguments) to an array
	 * @private
	 * @returns {*}
	 */
	function toArray() {
		if (arguments.length === 1) {
			var argument = arguments[0];
			if (argument instanceof Selection) {
				if (argument.top) {
					return argument.top;
				} else {
					return [];
				}
			} else if (Array.isArray(argument)) {
				return argument;
			} else {
				return [argument];
			}
		} else if (arguments.length > 1) {
			return Array.prototype.slice.call(arguments, 0);
		} else {
			return [];
		}
	}

	return Selection;
});
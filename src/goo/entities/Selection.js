define([], function () {
	'use strict';

	/**
	 * Generic selection class
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
		if (this.top === null) { return false; }

		return this.top.indexOf(element) !== -1;
	};

	/**
	 * Returns the size of this selection
	 * @returns {number}
	 */
	Selection.prototype.size = function () {
		if (this.top === null) { return 0; }

		return this.top.length;
	};

	/**
	 * Applies a function on each element until `false` is returned
	 * @param {Function} fun The function to apply
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.each = function (fun) {
		//! AT: this check should be done automatically before each method
		if (this.top === null) { return this; }

		for (var i = 0; i < this.top.length; i++) {
			if (fun(this.top[i], i) === false) {
				break;
			}
		}

		return this;
	};

	/**
	 * Alias for `each`
	 * @type {Function}
	 */
	Selection.prototype.forEach = Selection.prototype.each;

	/**
	 * Applies a filter on the elements of this selection
	 * @param predicate The filter used for filtering
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.filter = function (predicate) {
		//! AT: this check should be done automatically before each method
		if (this.top === null) { return this; }

		var top = this.top.filter(predicate);
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 * Applies a function on the elements of this selection producing a new collection
	 * @param fun The function to apply to each element
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.map = function (fun) {
		//! AT: this check should be done automatically before each method
		if (this.top === null) { return this; }

		var top = this.top.map(fun);
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 * @private
	 * @param fun
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.flatMap = function (fun) {
		//! AT: this check should be done automatically before each method
		if (this.top === null) { return this; }

		var map = this.top.map(fun);
		var flatMap = map.reduce(function (prev, cur) { return prev.concat(cur); }, []);
		this.stack.push(flatMap);
		this.top = flatMap;

		return this;
	};

	/**
	 * Reduces the entire selection to a single element by applying a function on every element and an accumulated value
	 * @param fun The function used to reduce the selection
	 * @param initialValue The value used for the first call of `fun`
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.reduce = function (fun, initialValue) {
		//! AT: this check should be done automatically before each method
		if (this.top === null) { return this; }

		var top = [this.top.reduce(fun, initialValue)];
		this.stack.push(top);
		this.top = top;

		return this;
	};

	/**
	 * Adds elements to this selection. Any resulting duplicates are removed.
	 * @param {(Element | Array<Element> | Selection)} elements The element(s) to add
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.and = function () {
		if (this.top === null) { return this; }

		var elements = toArray.apply(null, arguments);

		var union = this.top.concat(elements);
		union = removeDuplicates(union);
		this.stack.push(union);
		this.top = union;

		return this;
	};

	/**
	 * Returns the common elements between this selection and the given parameter(s)
	 * @param {(Element | Array<Element> | Selection)} elements
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.intersects = function () {
		if (this.top === null) { return this; }

		var elements = toArray.apply(null, arguments);

		var intersection = [];

		//! AT: when searching for arbitrary objects in an array searching by pointer (reference) is the only way
		// hopefully, if longArray is represented as some tree/hash with fast .indexOf()
		// so that I can iterate over the shorter array and do query the long array
		// best case: short array has one element and if indexOf takes O(log(longArray.length)) (or even better) time
		// worst case scenario: both arrays are of the same length and this optimisation is useless - it takes
		// O(shortArray.length * log(longArray.length)) time
		var shortArray, longArray;
		if (elements.length > this.top.length) {
			shortArray = this.top;
			longArray = elements;
		} else {
			shortArray = elements;
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
	 * Removes elements from the current selection
	 * @param elements {(Element | Array<Element> | Selection)} Elements to remove from the selection
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.without = function () {
		if (this.top === null) { return this; }

		var elements = toArray.apply(null, arguments);

		var difference = [];

		for (var i = 0; i < this.top.length; i++) {
			var element = this.top[i];
			if (elements.indexOf(element) === -1) {
				difference.push(element);
			}
		}

		this.stack.push(difference);
		this.top = difference;

		return this;
	};

	/**
	 * Adds the previous selection to the current selection. Resulting duplicates are removed.
	 * @returns {Selection} Returns self to allow chaining
	 */
	Selection.prototype.andSelf = function () {
		if (this.top === null) { return this; }

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
		if (this.top === null) { return this; }

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
	 * @returns {Element}
	 */
	//! AT: this may not be so crucial to have // might as well just use .get
	Selection.prototype.first = function () {
		return this.top === null ? null : this.top[0];
	};

	/**
	 * Clones the selection and its history
	 * @returns {Selection} Returns a copy of this selection object
	 */
	Selection.prototype.clone = function () {
		var clone = new Selection();

		//! AT: the array pointed by top is read only it can be shallow copied
		clone.top = this.top;

		// this array however is modified
		clone.stack = this.stack.concat([]);

		return clone;
	};

	/**
	 * Returns the element on the specified position or the whole selection as an array if position is not given
	 * @param {number} [index] Index of the desired element; can handle negative indices (Ex: -1 is the last element)
	 * @returns {Array}
	 */
	Selection.prototype.get = function (index) {
		if (typeof index !== 'number') {
			return this.top === null ? [] : this.top.concat([]);
		}
		if (index < 0) {
			return this.top === null ? undefined : this.top[this.top.length + index];
		} else {
			return this.top === null ? undefined : this.top[index];
		}
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
	 * @memberOf Selection#
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

	module.exports = Selection;
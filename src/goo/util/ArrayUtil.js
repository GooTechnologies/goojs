define([],
/** @lends */
function() {

	'use strict';

	var ArrayUtil = {};

	/**
	 * Utilities for arrays and typed arrays
	 */


	/**
	 * Create a typed array view on an ArrayBuffer, using the supplied pointer. Notice that this
	 * does not copy any elements, if you make changes to the returned array, the original
	 * ArrayBuffer will be modified.
	 *
	 * @param {ArrayBuffer} arrayBuffer
	 * @param {Array} pointer Array [start, length, format] where start is the start byte offset
	 * in the buffer, length is the number of values of the given format, and format is a string
	 * denoting the data format:
	 * 'float32' creates a Float32Array
	 * 'uint32'
	 * 'uint16'
	 * 'uint8'
	 *
	 * @return Typed array
	 */
	ArrayUtil.getTypedArray = function(arrayBuffer, pointer) {
		var start = pointer[0];
		var length = pointer[1];
		var format = pointer[2];

		if (format === 'float32') {
			return new Float32Array(arrayBuffer, start, length);
		}
		else if (format === 'uint8') {
			return new Uint8Array(arrayBuffer, start, length);
		}
		else if (format === 'uint16') {
			return new Uint16Array(arrayBuffer, start, length);
		}
		else if (format === 'uint32') {
			return new Uint32Array(arrayBuffer, start, length);
		}
		else {
			throw new Error('Binary format ' + format + ' is not supported');
		}
	};

	ArrayUtil.remove = function(array, value, equals) {
		var idx = -1;
		if (typeof equals === 'function') {
			for (var i = 0; i < array.length; i++) {
				if (equals(array[i], value)) {
					idx = i;
					break;
				}
			}
		}
		else {
			idx = array.indexOf(value);
		}
		if (idx > -1) {
			array.splice(idx, 1);
		}
	};

	/**
	 * Returns the first element in the supplied array for which the supplied predicate is true
	 * @param array
	 * @param predicate
	 * @returns {*}
	 */
	ArrayUtil.find = function(array, predicate) {
		for (var i = 0; i < array.length; i++) {
			if (predicate(array[i])) {
				return array[i];
			}
		}
		return null;
	};

	/**
	 * Returns an array of keys for the given Set or Map
	 * @param {Set|Map} collection
	 * @returns {Array}
	 */
	ArrayUtil.fromKeys = function (collection) {
		var array = [];

		var iterator = collection.keys();
		var entry = iterator.next();
		while (!entry.done) {
			array.push(entry.value);
			entry = iterator.next();
		}
		return array;
	};

	/**
	 * Returns an array of values for the given Set or Map
	 * @param {Set|Map} collection
	 * @returns {Array}
	 */
	ArrayUtil.fromValues = function (collection) {
		var array = [];

		var iterator = collection.values();
		var entry = iterator.next();
		while (!entry.done) {
			array.push(entry.value);
			entry = iterator.next();
		}
		return array;
	};

	return ArrayUtil;
});

define([
	'goo/math/Vector',
	'goo/math/Matrix',
	'goo/math/MathUtils'
], function (
	Vector,
	Matrix,
	MathUtils
	) {
	'use strict';

	var CustomMatchers = {};

	var serializeArrayBuffer = function (array) {
		return '[' + Array.prototype.join.call(array, ', ') + ']';
	};

	// in this case NaN is equal to NaN
	// you need matchers that check if a result is explicitly NaN
	var arrayEq = function (array1, array2) {
		if (array1.length !== array2.length) {
			return false;
		}

		for (var i = 0; i < array1.length; i++) {
			if (!(isNaN(array1[i]) && isNaN(array2[i]))) {
				if (!(Math.abs(array1[i] - array2[i]) <= MathUtils.EPSILON)) {
					return false;
				}
			}
		}

		return true;
	};

	CustomMatchers.toBeCloseToVector = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {};
				result.pass = actual instanceof Vector && arrayEq(actual.data, expected.data);

				if (result.pass) {
					result.message = 'Expected vectors to be different';
				} else {
					if (!(actual instanceof Vector)) {
						result.message = 'Expected an instance of Vector';
					} else if (actual.data.length !== expected.data.length) {
						result.message = 'Expected a vector of size ' + expected.data.length +
							' but got a vector of size ' + actual.data.length;
					} else {
						var expectedSerialized = serializeArrayBuffer(expected.data);
						var actualSerialized = serializeArrayBuffer(actual.data);

						result.message = 'Expected vectors to be close; expected ' + expectedSerialized +
							' but got ' + actualSerialized;
					}
				}

				return result;
			}
		};
	};

	CustomMatchers.toBeCloseToMatrix = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {};
				result.pass = actual instanceof Matrix && arrayEq(actual.data, expected.data);

				if (result.pass) {
					result.message = 'Expected matrices to be different';
				} else {
					if (!(actual instanceof Matrix)) {
						result.message = 'Expected an instance of Matrix';
					} else if (actual.rows !== expected.rows || actual.cols !== expected.cols) {
						result.message = 'Expected a matrix of size (' + expected.rows + ', ' + expected.cols + ') '+
							'but got a matrix of size (' + actual.rows + ', ' + actual.cols + ')';
					} else {
						var expectedSerialized = serializeArrayBuffer(expected.data);
						var actualSerialized = serializeArrayBuffer(actual.data);

						result.message = 'Expected matrices to be close; expected ' + expectedSerialized +
							' but got ' + actualSerialized;
					}
				}

				return result;
			}
		};
	};

	CustomMatchers.toBeCloseToArray = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {};
				result.pass = actual instanceof Array && arrayEq(actual, expected);

				if (result.pass) {
					result.message = 'Expected arrays to be different';
				} else {
					if (!(actual instanceof Array)) {
						result.message = 'Expected an instance of Array';
					} else if (actual.length !== expected.length) {
						result.message = 'Expected an array of size ' + expected.length +
							' but got an array of size ' + actual.length;
					} else {
						var expectedSerialized = expected.join(', ');
						var actualSerialized = actual.join(', ');

						result.message = 'Expected arrays to be close; expected ' + expectedSerialized +
							' but got ' + actualSerialized;
					}
				}

				return result;
			}
		};
	};

	return CustomMatchers;
});
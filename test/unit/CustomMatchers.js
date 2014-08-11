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

	CustomMatchers.toBeCloseToVector = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {};
				result.pass = actual instanceof Vector && actual.equals(expected);

				// might want a custom message for when actual is not even a vector
				if (result.pass) {
					result.message = 'Expected vectors to be close';
				} else {
					result.message = 'Expected vectors to be different';
				}

				return result;
			}
		};
	};

	CustomMatchers.toBeCloseToMatrix = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {};
				result.pass = actual instanceof Matrix && actual.equals(expected);

				// might want a custom message for when actual is not even a matrix
				if (result.pass) {
					result.message = 'Expected matrices to be close';
				} else {
					result.message = 'Expected matrices to be different';
				}

				return result;
			}
		};
	};

	CustomMatchers.toBeCloseToArray = function (util, customEqualityTesters) {
		return {
			compare: function (actual, expected) {
				var result = {
					pass: true
				};

				if (!Array.isArray(actual) || actual.length !== expected.length) {
					result.pass = false;
				}

				for (var i = 0; i < actual.length; i++) {
					if (Math.abs(actual[i] - expected[i]) > MathUtils.EPSILON) {
						result.pass = false;
						break;
					}
				}

				// might want a custom message for when actual is not even an array
				if (result.pass) {
					result.message = 'Expected arrays to be close';
				} else {
					result.message = 'Expected arrays to be different';
				}

				return result;
			}
		};
	};

	return CustomMatchers;
});
var Matrix = require('src/goo/math/Matrix');
var MathUtils = require('src/goo/math/MathUtils');

function CustomMatchers(){}

var serializeArrayBuffer = function (array) {
	return '[' + Array.prototype.join.call(array, ', ') + ']';
};

var serializeVector = function (vector) {
	var ret = '(' + vector.x + ' ' + vector.y;

	if (vector._size >= 3) { ret += ' ' + vector.z; }
	if (vector._size >= 4) { ret += ' ' + vector.w; }

	return ret + ')';
};

// in this case NaN is equal to NaN
// you need matchers that check if a result is explicitly NaN
var arrayEq = function (array1, array2) {
	//if (array1.length !== array2.length) {
	//	return false;
	//}

	var keys = Object.keys(array1);
	for (var ki = 0; ki < keys.length; ki++) {
		var i = keys[ki];

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
			result.pass = arrayEq(actual, expected);

			if (result.pass) {
				result.message = 'Expected vectors to be different';
			} else {
				//if (!(actual instanceof Vector)) {
				//	result.message = 'Expected an instance of Vector';
				//} else if (actual.data.length !== expected.data.length) {
				//	result.message = 'Expected a vector of size ' + expected.data.length +
				//		' but got a vector of size ' + actual.data.length;
				//} else {
					//var expectedSerialized = serializeArrayBuffer(expected.data);
					//var actualSerialized = serializeArrayBuffer(actual.data);

				result.message = 'Expected vectors to be close; expected ' +
					serializeVector(expected) + ' but got ' + serializeVector(actual);
				//}
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

CustomMatchers.toBeCloned = function (util, customEqualityTesters) {
	// performs a deep equal check and verifies if all corresponding references are different
	function deepEquality(obj1, obj2, path, excluded) {
		if (obj1 instanceof Array) {
			if (obj1 === obj2) {
				return {
					type: 'same-reference',
					path: path
				};
			}

			for (var i = 0; i < obj1.length; i++) {
				var partialResult = deepEquality(obj1[i], obj2[i], path + '.' + i, excluded);
				if (partialResult) { return partialResult; }
			}
		} else if (typeof obj1 === 'object') {
			if (obj1 === null && obj2 === null) { return; }

			if (obj1 === obj2) {
				return {
					type: 'same-reference',
					path: path
				};
			}

			if (obj1.constructor !== obj2.constructor) {
				return {
					type: 'different-constructors',
					path: path
				};
			}

			var keys = Object.keys(obj1);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (excluded.has(key)) { continue; }
				var partialResult = deepEquality(obj1[key], obj2[key], path + '.' + key, excluded);
				if (partialResult) { return partialResult; }
			}
		} else if (obj1 !== obj2) {
			return {
				type: 'different-value',
				path: path
			};
		}
	}

	return {
		compare: function (actual, expected) {
			var excluded, value;

			// optional parameters for custom matchers; not sure if best way but so far looks like the only way
			if (typeof expected === 'object' &&
				expected.hasOwnProperty('value') &&
				expected.hasOwnProperty('excluded')
				) {
				excluded = new Set();
				expected.excluded.forEach(function (element) {
					excluded.add(element);
				});
				value = expected.value;
			} else {
				excluded = new Set();
				value = expected;
			}

			var result = {};
			var equalityResult = deepEquality(value, actual, '', excluded);
			result.pass = !equalityResult;

			if (result.pass) {
				result.message = 'Expected objects to not be clones';
			} else {
				result.message = 'Expected objects to be clones; ' +
					equalityResult.type + ' on ' + equalityResult.path;
			}

			return result;
		}
	};
};

module.exports = CustomMatchers;
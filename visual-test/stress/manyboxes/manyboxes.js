require([], function() {
	'use strict';

	var arraySize = 5000;
	var offset = 500;
	var removalCount = arraySize - offset;
	var runs = 10;

	function shuffle(o) {
		for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}

	var origArray = [];
	for (var i = 0; i < arraySize; i++) {
		origArray[i] = i;
	}
	shuffle(origArray);

	var compareArray = origArray.slice();
	for (var i = offset; i < removalCount; i++) {
		compareArray.splice(compareArray.indexOf(i), 1);
	}

	function test(name, f) {
		var a = performance.memory.usedJSHeapSize;
		console.time(name);
		for (var k = 0; k < runs; k++) {
			var newArray = origArray.slice();
			for (var j = offset; j < removalCount; j++) {
				f(newArray, newArray.indexOf(j));
			}
		}
		console.timeEnd(name);
		console.log('Mem: ' + (performance.memory.usedJSHeapSize - a) + ' bytes');

		if (newArray.sort().join(',') !== compareArray.sort().join(',')) {
			console.warn(name + ' - not matching!');
		}
	}

	for (var i = 0; i < 20; i++) {
		console.log('---------------');

		test('splice', function(array, index) {
			array.splice(index, 1);
		});

		test('flip_pop1', function(array, index) {
			if (index < array.length - 1) {
				array[index] = array.pop();
			} else {
				array.pop();
			}
		});

		test('flip_pop2', function(array, index) {
			var el = array.pop();
			if (index < array.length) {
				array[index] = el;
			}
		});

		test('flip_length', function(array, index) {
			array[index] = array[array.length - 1];
			array.length--;
		});

		test('flip_length_pop', function(array, index) {
			array[index] = array[array.length - 1];
			array.pop();
		});

		test('flip_shift1', function(array, index) {
			var el = array.shift();
			if (index > 0) {
				array[index - 1] = el;
			}
		});

		test('flip_shift2', function(array, index) {
			if (index > 0) {
				array[index - 1] = array.shift();
			} else {
				array.shift();
			}
		});
	}
});
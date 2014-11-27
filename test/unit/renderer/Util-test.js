define([
	'goo/renderer/Util'
], function (
	Util
) {
	'use strict';

	describe('Util', function () {
		describe('insertionSort', function () {
			var comparator = function (a, b) { return a - b; };

			it('sorts an empty array', function () {
				var array = [];

				Util.insertionSort(array, comparator);
				expect(array).toEqual([]);
			});

			it('sorts a one element array', function () {
				var array = [1];

				Util.insertionSort(array, comparator);
				expect(array).toEqual([1]);
			});

			it('sorts an already sorted array', function () {
				var array = [1, 2, 3, 4, 5];

				Util.insertionSort(array, comparator);
				expect(array).toEqual([1, 2, 3, 4, 5]);
			});

			it('sorts a random-ish array', function () {
				var array = [5, 4, 2, 3, 1];

				Util.insertionSort(array, comparator);
				expect(array).toEqual([1, 2, 3, 4, 5]);
			});

			it('sorts a decreasing array', function () {
				var array = [5, 4, 3, 2, 1];

				Util.insertionSort(array, comparator);
				expect(array).toEqual([1, 2, 3, 4, 5]);
			});
		});
	});
});

define([
	'goo/entities/Selection'
], function (
	Selection
) {
	'use strict';

	describe('Selection', function () {
		function someObject() {
			return {};
		}

		function someObjects(n) {
			var objects = [];
			for (var i = 0; i < n; i++) {
				objects.push(someObject());
			}
			return objects;
		}

		describe('constructor', function () {
			it('constructs an empty selection if given no parameters', function () {
				var selection = new Selection();

				expect(selection).toEqual(Selection.EMPTY);
			});

			it('constructs a selection from an object', function () {
				var obj1 = someObject();
				var obj2 = someObject();
				var selection = new Selection(obj1);

				//! AT: cannot use jasmine's .toContain as it checks for equivalence and not equality
				expect(selection.contains(obj1)).toBeTruthy();
				expect(selection.contains(obj2)).toBeFalsy();
			});

			it('constructs a selection from a bunch of a objects', function () {
				var obj1 = someObject();
				var obj2 = someObject();
				var obj3 = someObject();
				var selection = new Selection(obj1, obj2);

				expect(selection.contains(obj1)).toBeTruthy();
				expect(selection.contains(obj2)).toBeTruthy();
				expect(selection.contains(obj3)).toBeFalsy();
			});

			it('constructs a selection from an array of objects', function () {
				var obj1 = someObject();
				var obj2 = someObject();
				var obj3 = someObject();
				var selection = new Selection([obj1, obj2]);

				expect(selection.contains(obj1)).toBeTruthy();
				expect(selection.contains(obj2)).toBeTruthy();
				expect(selection.contains(obj3)).toBeFalsy();
			});

			it('constructs a selection from another selection', function () {
				var obj1 = someObject();
				var obj2 = someObject();
				var obj3 = someObject();
				var selection1 = new Selection([obj1, obj2]);
				var selection2 = new Selection(selection1);

				expect(selection2.contains(obj1)).toBeTruthy();
				expect(selection2.contains(obj2)).toBeTruthy();
				expect(selection2.contains(obj3)).toBeFalsy();
			});
		});

		describe('each', function () {
			it('iterates over every element', function () {
				var array = [11, 22, 33];
				var selection = new Selection(array);
				var sum = 0;

				selection.each(function (element) {
					sum += element;
				});

				expect(sum).toBeCloseTo(array.reduce(function (prev, cur) { return prev + cur; }, 0));
			});

			it('iterates over every element until some condition is met', function () {
				var array = [11, 22, 33, 44, 55];
				var selection = new Selection(array);
				var sum = 0;

				selection.each(function (element) {
					if (element > 33) { return false; }
					sum += element;
				});

				expect(sum).toBeCloseTo(array.slice(0, 3).reduce(function (prev, cur) { return prev + cur; }, 0));
			});
		});

		// filter
		// map
		// reduce

		describe('and', function () {
			it('concatenates two selection with common elements', function () {
				var array1 = [11, 22, 33, 44, 55];
				var array2 = [33, 44, 55, 66, 77];

				var selection = new Selection(array1);
				selection.and(array2);

				array1.forEach(function (element) {
					expect(selection.contains(element)).toBeTruthy();
				});

				array2.forEach(function (element) {
					expect(selection.contains(element)).toBeTruthy();
				});

				expect(selection.size()).toEqual(7);
			});
		});

		describe('intersects', function () {
			it('intersects two selection with common elements', function () {
				var array1 = [11, 22, 33, 44, 55];
				var array2 = [33, 44, 55, 66, 77];

				var selection = new Selection(array1);
				selection.intersects(array2);

				expect(selection.contains(33)).toBeTruthy();
				expect(selection.contains(44)).toBeTruthy();
				expect(selection.contains(55)).toBeTruthy();

				expect(selection.size()).toEqual(3);
			});
		});

		describe('without', function () {
			it('subtracts a collection from another', function () {
				var array1 = [11, 22, 33, 44, 55];
				var array2 = [33, 44, 55, 66, 77];

				var selection = new Selection(array1);
				selection.without(array2);

				expect(selection.contains(11)).toBeTruthy();
				expect(selection.contains(22)).toBeTruthy();

				expect(selection.size()).toEqual(2);
			});
		});

		// andSelf
		// end

		// toArray
	});
});
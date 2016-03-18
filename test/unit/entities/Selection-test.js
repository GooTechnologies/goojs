	import Selection from 'src/goo/entities/Selection';

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

		describe('contains', function () {
			it('returns false when applied to an empty selection', function () {
				var selection = new Selection();
				expect(selection.contains(123)).toBeFalsy();
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
				expect(selection.toArray()).toEqual(array);
			});
		});

		describe('filter', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.filter(function (element) { return true; });
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('filters out elements', function () {
				var array = [11, 22, 33, 44, 55];
				var selection = new Selection(array);

				var predicate = function (element) { return element % 2 === 0; };
				selection.filter(predicate);

				expect(selection.toArray()).toEqual(array.filter(predicate));
			});
		});

		describe('map', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.map(function (element) { return 1; });
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('gets a new selection by applying a function over every element of the previous selection', function () {
				var array = [11, 22, 33, 44, 55];
				var selection = new Selection(array);

				var fun = function (element) { return element * 10; };
				selection.map(fun);

				expect(selection.toArray()).toEqual(array.map(fun));
			});
		});

		describe('reduce', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.reduce(function (element) { return 1; });
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('reduces the elements in a selection', function () {
				var array = [11, 22, 33, 44, 55];
				var selection = new Selection(array);

				var fun = function (prev, cur) { return prev + cur; };
				selection.reduce(fun, 123);

				expect(selection.toArray()).toEqual([array.reduce(fun, 123)]);
			});
		});

		describe('and', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.and(someObject());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

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
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.intersects(someObject());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('intersects two selections with common elements', function () {
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
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.without(someObject());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

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

		describe('andSelf', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.andSelf();
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('returns itself when applied to an selection that has only one stack entry', function () {
				var selection = new Selection(someObjects(5));
				selection.andSelf();
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('add the previous selection to the current one', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);
				selection.map(function (element) { return element * 10; });
				selection.andSelf();

				array.forEach(function (element) {
					expect(selection.contains(element)).toBeTruthy();
					expect(selection.contains(element * 10)).toBeTruthy();
				});

				expect(selection.size()).toEqual(array.length * 2);
			});
		});

		describe('end', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new Selection();
				selection.end();
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('revert back to a previous selection', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);
				selection.map(function (element) { return element * 10; });
				selection.end();

				array.forEach(function (element) {
					expect(selection.contains(element)).toBeTruthy();
				});

				expect(selection.size()).toEqual(array.length);
			});
		});

		describe('toArray', function () {
			it('converts a selection to an array', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);

				expect(selection.toArray()).toEqual(array);
			});

			it('converts an empty selection to an empty array', function () {
				var selection = new Selection();

				expect(selection.toArray()).toEqual([]);
			});
		});

		describe('get', function () {
			it('gets the whole array when called with no arguments', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);

				expect(selection.get()).toEqual(array);
			});

			it('gets an element at a specific position', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);

				expect(selection.get(1)).toEqual(22);
			});

			it('gets an element at a specific position when called with a negative index', function () {
				var array = [11, 22, 33, 44, 55];

				var selection = new Selection(array);

				expect(selection.get(-1)).toEqual(55);
			});
		});
	});

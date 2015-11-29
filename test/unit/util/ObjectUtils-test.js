	describe('ObjectUtils', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('defaults', function () {
			it('copies defaults onto an empty object', function () {
				var destination = {};
				var source = { a: 1, b: 2 };

				ObjectUtils.defaults(destination, source);

				expect(destination).toEqual(source);
			});

			it('ignores existing properties on the destination object', function () {
				var destination = { a: 123, b: 456 };
				var source = { a: 1, b: 2 };

				ObjectUtils.defaults(destination, source);

				expect(destination).toEqual({ a: 123, b: 456 });
			});
		});

		describe('copyOptions', function () {
			it('copies defaults onto an empty object', function () {
				var destination = {};
				var options = {};
				var defaults = { a: 1, b: 2 };

				ObjectUtils.copyOptions(destination, options, defaults);

				expect(destination).toEqual(defaults);
			});

			it('ignores defaults when options are present', function () {
				var destination = {};
				var options = { a: 123, b: 456 };
				var defaults = { a: 1, b: 2 };

				ObjectUtils.copyOptions(destination, options, defaults);

				expect(destination).toEqual(options);
			});

			it('copies the defaults object over when options is not an object', function () {
				var destination = {};
				var options = null;
				var defaults = { a: 1, b: 2 };

				ObjectUtils.copyOptions(destination, options, defaults);

				expect(destination).toEqual(defaults);
			});
		});

		describe('extends', function () {
			it('copies properties onto an empty object', function () {
				var destination = {};
				var source = { a: 1, b: 2 };

				ObjectUtils.extend(destination, source);

				expect(destination).toEqual(source);
			});

			it('overwrites existing properties on the destination object', function () {
				var destination = { a: 123, b: 456 };
				var source = { a: 1, b: 2 };

				ObjectUtils.extend(destination, source);

				expect(destination).toEqual(source);
			});
		});

		describe('forEach', function () {
			it('iterates over objects\' keys', function () {
				var obj = {
					p2: { sortValue: 2, value: 123 },
					p1: { sortValue: 1, value: 234 }
				};
				var spy = jasmine.createSpy('spy1');
				ObjectUtils.forEach(obj, spy, null, 'sortValue');

				expect(spy.calls.count()).toEqual(2);
				expect(spy).toHaveBeenCalledWith(obj.p1, 'p1', obj);
				expect(spy).toHaveBeenCalledWith(obj.p2, 'p2', obj);
			});
		});

		describe('cloneMap', function () {
			it('clones an empty map', function () {
				var originalMap = new Map();
				var clonedMap = ObjectUtils.cloneMap(originalMap);

				expect(clonedMap.size).toEqual(0);
			});

			it('clones a map with some elements', function () {
				var originalMap = new Map();
				originalMap.set(11, 'aa');
				originalMap.set(22, 'bb');
				var clonedMap = ObjectUtils.cloneMap(originalMap);

				expect(clonedMap.size).toEqual(2);
				expect(clonedMap.get(11)).toEqual('aa');
				expect(clonedMap.get(22)).toEqual('bb');
			});
		});

		describe('cloneSet', function () {
			it('clones an empty set', function () {
				var originalSet = new Set();
				var clonedSet = ObjectUtils.cloneSet(originalSet);

				expect(clonedSet.size).toEqual(0);
			});

			it('clones a set with some elements', function () {
				var originalSet = new Set();
				originalSet.add(11);
				originalSet.add(22);
				var clonedSet = ObjectUtils.cloneSet(originalSet);

				expect(clonedSet.size).toEqual(2);
				expect(clonedSet.has(11)).toBeTruthy();
				expect(clonedSet.has(22)).toBeTruthy();
			});
		});

		describe('deepClone', function () {
			var clone = ObjectUtils.deepClone;

			it('does not clone primitives and functions', function () {
				expect(clone(123)).toBe(123);
				expect(clone(true)).toBe(true);
				expect(clone('asd')).toBe('asd');

				var func = function () {};
				expect(clone(func)).toBe(func);
			});

			it('does not clone null or undefined', function () {
				expect(clone(null)).toBeNull();
				expect(clone(undefined)).toBeUndefined();
			});

			it('clones arrays', function () {
				var original = [1, 2, 3];
				expect(clone(original)).toBeCloned(original);
			});

			it('clones sparse arrays', function () {
				var original = [];
				original[10] = 123;
				var cloned = clone(original);
				expect(cloned).toBeCloned(original);
				expect(cloned.hasOwnProperty(0)).toBeFalsy();
			});

			it('clones objects', function () {
				var original = { a: 123, b: false, c: undefined, d: null };
				expect(clone(original)).toBeCloned(original);
			});

			it('clones a typed array', function () {
				var original = new Uint32Array([1, 2, 3]);
				expect(clone(original)).toBeCloned(original);
			});

			it('clones html entities', function () {
				var original = document.createElement('div');
				original.classList.add('asd');
				var cloned = clone(original);

				expect(cloned).not.toBe(original);
				expect(cloned.classList.contains('asd')).toBeTruthy();
			});
		});
	});

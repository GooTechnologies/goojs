define([
	'goo/util/ObjectUtil'
], function(
	ObjectUtil
) {
	'use strict';

	describe('ObjectUtil', function () {
		describe('forEach', function () {
			it('iterates over objects\' keys', function () {
				var obj = {
					'p2': { sortValue: 2, value: 123 },
					'p1': { sortValue: 1, value: 234 }
				};
				var spy = jasmine.createSpy('spy1');
				ObjectUtil.forEach(obj, spy, null, 'sortValue');

				expect(spy.calls.count()).toEqual(2);
				expect(spy).toHaveBeenCalledWith(obj['p1'], 'p1', obj);
				expect(spy).toHaveBeenCalledWith(obj['p2'], 'p2', obj);
			});
		});
		
		describe('cloneMap', function () {
			it('clones an empty map', function () {
				var originalMap = new Map();
				var clonedMap = ObjectUtil.cloneMap(originalMap);

				expect(clonedMap.size).toEqual(0);
			});

			it('clones a map with some elements', function () {
				var originalMap = new Map([[11, 'aa'], [22, 'bb']]);
				var clonedMap = ObjectUtil.cloneMap(originalMap);

				expect(clonedMap.size).toEqual(2);
				expect(clonedMap.get(11)).toEqual('aa');
				expect(clonedMap.get(22)).toEqual('bb');
			});
		});

		describe('cloneSet', function () {
			it('clones an empty set', function () {
				var originalSet = new Set();
				var clonedSet = ObjectUtil.cloneMap(originalSet);

				expect(clonedSet.size).toEqual(0);
			});

			it('clones a set with some elements', function () {
				var originalSet = new Set([11, 22]);
				var clonedSet = ObjectUtil.cloneMap(originalSet);

				expect(clonedSet.size).toEqual(2);
				expect(clonedSet.has(11)).toBeTruthy();
				expect(clonedSet.has(22)).toBeTruthy();
			});
		});
	});
});
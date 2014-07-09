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

				expect(spy.callCount).toEqual(2);
				expect(spy).toHaveBeenCalledWith(obj['p1'], 'p1', obj);
				expect(spy).toHaveBeenCalledWith(obj['p2'], 'p2', obj);
			});
		});
	});
});
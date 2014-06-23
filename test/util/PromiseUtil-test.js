define([
	'goo/util/PromiseUtil'
], function (
	PromiseUtil
) {
	'use strict';

	describe('PromiseUtil', function () {
	    describe('createDummyPromise', function () {
	        it('resolves asynchronously', function () {
				var solvedValue;
	            var promise = PromiseUtil.createDummyPromise('some value').then(function (value) {
					solvedValue = value;
				});

				promise.resolve('some value');

				// not yet!
				expect(solvedValue).toBeUndefined();

				waitsFor(function () {
					return promise.isResolved;
				});

				runs(function () {
					expect(solvedValue).toEqual('some value');
				});
	        });
	    });
	});
});
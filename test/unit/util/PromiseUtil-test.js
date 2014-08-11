define([
	'goo/util/PromiseUtil'
], function (
	PromiseUtil
) {
	'use strict';

	describe('PromiseUtil', function () {
	    describe('createDummyPromise', function () {
	        it('resolves asynchronously', function (done) {
				var solvedValue;
	            var promise = PromiseUtil.createDummyPromise('some value').then(function (value) {
					solvedValue = value; // store this guy or outside access
					expect(solvedValue).toEqual('some value');
					done();
				});

				promise.resolve('some value');

				// not yet!
				expect(solvedValue).toBeUndefined();
	        });
	    });
	});
});
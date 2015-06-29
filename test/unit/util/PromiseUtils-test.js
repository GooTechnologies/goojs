define([
	'goo/util/PromiseUtils'
], function (
	PromiseUtils
) {
	'use strict';

	describe('PromiseUtils', function () {
	    describe('createDummyPromise', function () {
	        it('resolves asynchronously', function (done) {
				var solvedValue;
	            var promise = PromiseUtils.createDummyPromise('some value').then(function (value) {
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
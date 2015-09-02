define([
	'goo/util/PromiseUtils'
], function (
	PromiseUtils
) {
	'use strict';

	describe('PromiseUtils', function () {
	    describe('createDummyPromise', function () {
	        xit('resolves asynchronously', function (done) {
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

		describe('optimisticAll', function () {
			it('resolves when given an empty collection', function (done) {
				PromiseUtils.optimisticAll([]).then(function (resolves) {
					expect(resolves).toEqual([]);
					done();
				});
			});

			it('resolves when all promises resolve', function (done) {
				PromiseUtils.optimisticAll([
					PromiseUtils.resolve(123),
					PromiseUtils.resolve(456)
				]).then(function (resolves) {
					expect(resolves).toEqual([
						123,
						456
					]);

					done();
				});
			});

			it('resolves when some promises resolve', function (done) {
				PromiseUtils.optimisticAll([
					PromiseUtils.resolve(123),
					PromiseUtils.reject(456)
				]).then(function (resolves) {
					expect(resolves).toEqual([
						123,
						456
					]);

					done();
				});
			});

			it('resolves when no promises resolve', function (done) {
				PromiseUtils.optimisticAll([
					PromiseUtils.reject(123),
					PromiseUtils.reject(456)
				]).then(function (resolves) {
					expect(resolves).toEqual([
						123,
						456
					]);

					done();
				});
			});
		});
	});
});
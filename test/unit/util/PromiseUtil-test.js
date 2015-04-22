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

		describe('delay', function () {
			it('resolves a timeout within 200 ms', function (done) {
				PromiseUtil.delay(200, 'asd').then(function (value) {
					expect(value).toEqual('asd');
					done();
				});
			});

			it('resolves asynchronously', function (done) {
				var resolved = false;
				PromiseUtil.delay(200, 'asd').then(function () {
					resolved = true;
					done();
				});

				expect(resolved).toBe(false);
			});
		});
	});
});
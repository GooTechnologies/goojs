define([
	'goo/util/PromiseUtil'
], function (
	PromiseUtil
) {
	'use strict';

	describe('PromiseUtil', function () {
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
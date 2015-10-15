define([
	'goo/util/PromiseUtils'
], function (
	PromiseUtils
) {
	'use strict';

	describe('PromiseUtils', function () {
	    describe('delay', function () {
			it('resolves asynchronously', function (done) {
				var resolved = false;
				PromiseUtils.delay('asd', 200).then(function () {
					resolved = true;
					done();
				});

				expect(resolved).toBe(false);
			});
		});
	});
});
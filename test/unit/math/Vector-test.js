define([
	'goo/math/Vector',
	'test/CustomMatchers'
], function (
	Vector,
	CustomMatchers
) {
	'use strict';

	describe('Vector', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});
	});
});

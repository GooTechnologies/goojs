define([
	'goo/math/Matrix',
	'test/CustomMatchers'
], function (
	Matrix,
	CustomMatchers
) {
	'use strict';

	describe('Matrix', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});
	});
});

define([
	'goo/renderer/RendererUtils',
	'test/CustomMatchers'
], function (
	RendererUtils,
	CustomMatchers
) {
	'use strict';

	describe('RendererUtils', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});
	});
});

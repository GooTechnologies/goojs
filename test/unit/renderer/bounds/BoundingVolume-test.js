define([
	'goo/renderer/bounds/BoundingVolume',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	BoundingVolume,
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('BoundingVolume', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('copy', function () {
			it('can copy everything from another bounding box', function () {
				var original = new BoundingVolume(new Vector3(1, 2, 3), 123, 234, 345);
				var copy = new BoundingVolume();
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});
	});
});

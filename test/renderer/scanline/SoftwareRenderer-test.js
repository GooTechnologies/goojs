define(
[
	'goo/renderer/scanline/SoftwareRenderer',
	'goo/math/Vector3'
], function(
	SoftwareRenderer,
	Vector3
) {
	'use strict';

	describe('SoftwareRenderer', function() {
		describe('calculateIntersectionRatio', function() {

			// REVIEW: Replace xit with it here to see the failing test.
			xit('calculates the intersection correctly at 50%', function() {
				// REVIEW: I expected the ratio to be .5 because the two z coordinates
				// are on the same distance from the near plane. What am I missing?
				var origin = new Vector3(-10, -10, 90);
				var target = new Vector3(-10, -10, 110);
				var near = 100;
				var ratio = SoftwareRenderer.calculateIntersectionRatio(origin, target, near);
				expect(ratio).toEqual(0.5);
			});
		});
	});
});

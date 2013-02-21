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

			it('calculates the intersection correctly at 50%', function() {

				// The vertices are in camera space at the point for this check in the graphics pipeline.
				// Thus the z-coordinates are in the range of [0, -far(+-boundingModel size)].

				var origin = new Vector3(-10, -10, -1.5);
				var target = new Vector3(-10, -10, -0.5);
				var near = 1;
				var ratio = SoftwareRenderer.calculateIntersectionRatio(origin, target, near);
				expect(ratio).toEqual(0.5);
			});
		});

		describe('isBackFacing', function() {

			// The vertices are transformed into perspective space and homogeneous divided at this point
			// in the graphics pipeline in SoftwareRenderer.

			// The x- and y-coordinates are in the range of [-1, 1]
			// and the z-coordinates are in the range of [-near, far(+-boundingModel size)].

			var v1 = new Vector3(0.5, -0.2, 13.5);
			var v2 = new Vector3(-0.5, 0.3, 23.5);
			var v3 = new Vector3(0.7, 0.7, 73.5);
			
			it('This face should be back face culled', function() {
				expect(SoftwareRenderer.isBackFacing(v1, v3, v2)).toEqual(true);
			});
			
			it('This face should be visible', function() {
				expect(SoftwareRenderer.isBackFacing(v1, v2, v3)).toEqual(false);
			});

		});
	});
});

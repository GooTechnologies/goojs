define([
	'goo/renderer/Camera',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Vector3'
], function(
	Camera,
	BoundingSphere,
	BoundingBox,
	Vector3
) {
	'use strict';

	describe('Camera', function() {
		var camera;
		beforeEach(function() {
			camera = new Camera(90, 1, 1, 100);
		});
		it('can pack frustum around bounds', function() {
			var bound = new BoundingSphere();
			bound.radius = 10.0;
			bound.center.setd(0,0,-20);

			camera.pack(bound);
			expect(camera._frustumNear).toBe(10.0);
			expect(camera._frustumFar).toBe(30.0);
			//TODO: test other parts of frustum and boundingbox
		});
		it('can pick a ray', function() {
			var ray = camera.getPickRay(25, 25, 100, 100);
		});
		it('can calculate corners of frustum', function() {
			var corners = camera.calculateFrustumCorners();
			expect(corners[0]).toEqual(new Vector3(1,-1,-1));
			expect(corners[1]).toEqual(new Vector3(-1,-1,-1));
			expect(corners[2]).toEqual(new Vector3(-1,1,-1));
			expect(corners[3]).toEqual(new Vector3(1,1,-1));
			expect(corners[4]).toEqual(new Vector3(100,-100,-100));
			expect(corners[5]).toEqual(new Vector3(-100,-100,-100));
			expect(corners[6]).toEqual(new Vector3(-100,100,-100));
			expect(corners[7]).toEqual(new Vector3(100,100,-100));
		});
	});
});

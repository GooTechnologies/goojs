define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/MeshCollider',
	'goo/shapes/Sphere'
], function (
	Vector3,
	MeshCollider,
	Sphere
) {
	'use strict';

	describe('MeshCollider', function () {

		it('can clone', function (done) {
			var collider = new MeshCollider({
				meshData: new Sphere(10, 10, 1),
				scale: new Vector3(2, 3, 4)
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
			done();
		});

	});
});
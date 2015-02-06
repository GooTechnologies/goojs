define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/physicspack/colliders/MeshCollider',
	'goo/shapes/Sphere'
], function (
	Vector3,
	Transform,
	MeshCollider,
	Sphere
) {
	'use strict';

	describe('MeshCollider', function () {

		it('can clone', function () {
			var collider = new MeshCollider({
				meshData: new Sphere(10, 10, 1),
				scale: new Vector3(2, 3, 4)
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);

		});

		it('can transform', function () {
			var collider = new MeshCollider({
				meshData: new Sphere(10, 10, 1),
				scale: new Vector3(2, 3, 4)
			});
			var transform = new Transform();
			transform.scale.set(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.scale).toEqual(new Vector3(2, 6, 12));
		});
	});
});
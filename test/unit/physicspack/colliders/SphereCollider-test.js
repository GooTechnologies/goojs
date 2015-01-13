define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/physicspack/colliders/SphereCollider'
], function (
	Vector3,
	Transform,
	SphereCollider
) {
	'use strict';

	describe('SphereCollider', function () {

		it('can clone', function (done) {
			var collider = new SphereCollider({
				radius: 2
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
			done();
		});

		it('can transform', function (done) {
			var collider = new SphereCollider({
				radius: 2
			});
			var transform = new Transform();
			transform.scale.set(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.radius).toEqual(6);
			done();
		});
	});
});
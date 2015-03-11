define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/addons/physicspack/colliders/SphereCollider'
], function (
	Vector3,
	Transform,
	SphereCollider
) {
	'use strict';

	xdescribe('SphereCollider', function () {

		it('can clone', function () {
			var collider = new SphereCollider({
				radius: 2
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);

		});

		it('can transform', function () {
			var collider = new SphereCollider({
				radius: 2
			});
			var transform = new Transform();
			transform.scale.set(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.radius).toEqual(6);

		});
	});
});
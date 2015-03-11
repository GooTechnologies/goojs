define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/addons/physicspack/colliders/PlaneCollider'
], function (
	Vector3,
	Transform,
	PlaneCollider
) {
	'use strict';

	xdescribe('PlaneCollider', function () {

		it('can clone', function () {
			var collider = new PlaneCollider();
			var clone = collider.clone();
			expect(collider).equal(clone);

		});

		it('can transform', function () {
			var collider = new PlaneCollider();
			var collider2 = new PlaneCollider();
			var transform = new Transform();
			collider.transform(transform, collider2);
			expect(collider).toEqual(collider2);

		});
	});
});
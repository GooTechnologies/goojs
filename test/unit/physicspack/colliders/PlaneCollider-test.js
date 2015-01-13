define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/physicspack/colliders/PlaneCollider'
], function (
	Vector3,
	Transform,
	PlaneCollider
) {
	'use strict';

	describe('PlaneCollider', function () {

		it('can clone', function (done) {
			var collider = new PlaneCollider();
			var clone = collider.clone();
			expect(collider).equal(clone);
			done();
		});

		it('can transform', function (done) {
			var collider = new PlaneCollider();
			var collider2 = new PlaneCollider();
			var transform = new Transform();
			collider.transform(transform, collider2);
			expect(collider).toEqual(collider2);
			done();
		});
	});
});
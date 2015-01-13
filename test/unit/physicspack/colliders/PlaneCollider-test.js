define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/PlaneCollider'
], function (
	Vector3,
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

	});
});
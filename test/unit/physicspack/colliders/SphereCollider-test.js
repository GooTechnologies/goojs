define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/SphereCollider'
], function (
	Vector3,
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

	});
});
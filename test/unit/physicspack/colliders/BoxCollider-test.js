define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/BoxCollider'
], function (
	Vector3,
	BoxCollider
) {
	'use strict';

	describe('BoxCollider', function () {

		it('can clone', function (done) {
			var collider = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
			done();
		});

	});
});
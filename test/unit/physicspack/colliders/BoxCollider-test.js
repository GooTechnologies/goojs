define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/physicspack/colliders/BoxCollider'
], function (
	Vector3,
	Transform,
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

		it('can transform', function (done) {
			var collider = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var transform = new Transform();
			transform.scale.set(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.halfExtents).toEqual(new Vector3(1, 4, 9));
			done();
		});

	});
});
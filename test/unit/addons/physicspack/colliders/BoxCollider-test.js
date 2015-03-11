define([
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/addons/physicspack/colliders/BoxCollider'
], function (
	Vector3,
	Transform,
	BoxCollider
) {
	'use strict';

	xdescribe('BoxCollider', function () {

		it('can clone', function () {
			var collider = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
		});

		it('can transform', function () {
			var collider = new BoxCollider({
				halfExtents: new Vector3(1, 2, 3)
			});
			var transform = new Transform();
			transform.scale.set(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.halfExtents).toEqual(new Vector3(1, 4, 9));
		});

	});
});
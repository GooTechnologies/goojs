define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/CylinderCollider'
], function (
	Vector3,
	CylinderCollider
) {
	'use strict';

	describe('CylinderCollider', function () {

		it('can clone', function (done) {
			var collider = new CylinderCollider({
				radius: 123,
				height: 456
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
			done();
		});

	});
});
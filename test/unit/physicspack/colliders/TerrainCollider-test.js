define([
	'goo/math/Vector3',
	'goo/physicspack/colliders/TerrainCollider'
], function (
	Vector3,
	TerrainCollider
) {
	'use strict';

	describe('TerrainCollider', function () {

		it('can clone', function (done) {
			var collider = new TerrainCollider({
				data: []
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
			done();
		});

	});
});
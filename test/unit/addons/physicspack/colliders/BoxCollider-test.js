describe('BoxCollider', function () {

	var BoxCollider = require('../../src/goo/addons/physicspack/colliders/BoxCollider');
	var Vector3 = require('../../src/goo/math/Vector3');
	var Transform = require('../../src/goo/math/Transform');

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
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.halfExtents).toEqual(new Vector3(1, 4, 9));
	});
});
describe('CylinderCollider', function () {

	var CylinderCollider = require('../../src/goo/addons/physicspack/colliders/CylinderCollider');
	var Transform = require('../../src/goo/math/Transform');

	it('can clone', function () {
		var collider = new CylinderCollider({
			radius: 123,
			height: 456
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new CylinderCollider({
			radius: 2,
			height: 3
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.radius).toEqual(4);
		expect(collider.height).toEqual(9);
	});
});

describe('MeshCollider', function () {

	var MeshCollider = require('../../../../../src/goo/addons/physicspack/colliders/MeshCollider');
	var Vector3 = require('../../../../../src/goo/math/Vector3');
	var Sphere = require('../../../../../src/goo/shapes/Sphere');
	var Transform = require('../../../../../src/goo/math/Transform');

	it('can clone', function () {
		var collider = new MeshCollider({
			meshData: new Sphere(10, 10, 1),
			scale: new Vector3(2, 3, 4)
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new MeshCollider({
			meshData: new Sphere(10, 10, 1),
			scale: new Vector3(2, 3, 4)
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.scale).toEqual(new Vector3(2, 6, 12));
	});
});

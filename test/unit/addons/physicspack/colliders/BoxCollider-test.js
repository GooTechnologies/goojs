import BoxCollider from 'src/goo/addons/physicspack/colliders/BoxCollider';
import Vector3 from 'src/goo/math/Vector3';
import Transform from 'src/goo/math/Transform';

describe('BoxCollider', function () {

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
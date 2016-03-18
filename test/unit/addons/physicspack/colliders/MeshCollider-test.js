import MeshCollider from 'src/goo/addons/physicspack/colliders/MeshCollider';
import Vector3 from 'src/goo/math/Vector3';
import Sphere from 'src/goo/shapes/Sphere';
import Transform from 'src/goo/math/Transform';

	describe('MeshCollider', function () {

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

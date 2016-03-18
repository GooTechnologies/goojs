import PlaneCollider from 'src/goo/addons/physicspack/colliders/PlaneCollider';
import Transform from 'src/goo/math/Transform';

	describe('PlaneCollider', function () {


		it('can clone', function () {
			var collider = new PlaneCollider();
			var clone = collider.clone();
			expect(collider).toEqual(clone);
		});

		it('can transform', function () {
			var collider = new PlaneCollider();
			var collider2 = new PlaneCollider();
			var transform = new Transform();
			collider.transform(transform, collider2);
			expect(collider).toEqual(collider2);
		});
	});

	describe('SphereCollider', function () {
		it('can clone', function () {
			var collider = new SphereCollider({
				radius: 2
			});
			var clone = collider.clone();
			expect(collider).toEqual(clone);
		});

		it('can transform', function () {
			var collider = new SphereCollider({
				radius: 2
			});
			var transform = new Transform();
			transform.scale.setDirect(1, 2, 3);
			collider.transform(transform, collider);
			expect(collider.radius).toEqual(6);
		});
	});

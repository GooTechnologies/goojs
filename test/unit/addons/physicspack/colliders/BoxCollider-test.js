/* global goo */
describe('BoxCollider', function () {
	it('can clone', function () {
		var collider = new goo.BoxCollider({
			halfExtents: new goo.Vector3(1, 2, 3)
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new goo.BoxCollider({
			halfExtents: new goo.Vector3(1, 2, 3)
		});
		var transform = new goo.Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.halfExtents).toEqual(new goo.Vector3(1, 4, 9));
	});
});
define([
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'goo/math/Matrix3x3',
	'goo/math/Vector3'
], function(
	World,
	TransformComponent,
	TransformSystem,
	Matrix3x3,
	Vector3
) {
	'use strict';

	describe('TransformComponent', function() {
		var world;
		beforeEach(function() {
			world = new World();
			world.setSystem(new TransformSystem());
		});

		it('can attach a child component via the transformComponent', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();

			expect(parentEntity.transformComponent.children)
				.toContain(childEntity.transformComponent);

			expect(childEntity.transformComponent.parent).toBe(parentEntity.transformComponent);
		});

		it('correctly removes parent reference of child on its removal from the world', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			childEntity.removeFromWorld();
			world.process();
			expect(parentEntity.transformComponent.children)
				.not.toContain(childEntity.transformComponent);
			expect(childEntity.transformComponent.parent).toBeNull();
		});

		it('correctly removes child reference of parent on its removal from the world (in non-recursive mode)', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			parentEntity.removeFromWorld(false);
			world.process();
			expect(childEntity.transformComponent.parent).toBeNull();
			expect(parentEntity.transformComponent.children)
				.not.toContain(childEntity.transformComponent);
		});

		it('setRotation with x, y, z', function() {
			var tc = new TransformComponent();
			tc.setRotation(0, 0, 0);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});
		it('setRotation with Vector3', function() {
			var tc = new TransformComponent();
			var vec = new Vector3(0, 0, 0);
			tc.setRotation(vec);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});
		it('setRotation with array', function() {
			var tc = new TransformComponent();
			tc.setRotation([0, 0, 0]);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});
	});
});

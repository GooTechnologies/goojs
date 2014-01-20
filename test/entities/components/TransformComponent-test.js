define([
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'goo/math/Matrix3x3',
	'goo/math/Vector3',
	'goo/entities/Entity'
], function(
	World,
	TransformComponent,
	TransformSystem,
	Matrix3x3,
	Vector3,
	Entity
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

		// bad spec names
		it('setRotation with x, y, z', function() {
			// tc?
			var tc = new TransformComponent();
			// useless test as the rotation matrix is 0 by default anyways
			tc.setRotation(0, 0, 0);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});

		it('setRotation with Vector3', function() {
			var tc = new TransformComponent();
			// vec?
			// useless test; it's based on (0, 0, 0) or default values; it's so easy to accidentally get default values and the tests would not do their job
			var vec = new Vector3(0, 0, 0);
			tc.setRotation(vec);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});

		it('setRotation with array', function() {
			var tc = new TransformComponent();
			// useless test
			tc.setRotation([0, 0, 0]);
			expect(tc.transform.rotation).toEqual(new Matrix3x3());
		});
		//

		it('handles attaching itself to an entity', function() {
			var transformComponent = new TransformComponent();
			var world = new World();
			var entity = new Entity();
			entity._world = world;

			entity.setComponent(transformComponent);
			expect(transformComponent.entity).toBe(entity);
		});

		// should it ever be detached? since it's enforced and there are so many dependencies probably not
		it('handles detaching itself from an entity', function() {
			var transformComponent = new TransformComponent();
			var world = new World();
			var entity = new Entity();
			entity._world = world;

			entity.setComponent(transformComponent);
			entity.clearComponent('transformComponent');
			expect(transformComponent.entity).toBeFalsy();
		});

		it('returns the parent host entity when calling setTranslation on it', function() {
			var entity = world.createEntity();
			entity.setComponent(new TransformComponent());

			expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
		});

		it('returns the parent host entity when calling any transform related method on it', function() {
			var entity = world.createEntity();
			entity.setComponent(new TransformComponent());

			expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.setScale(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.addTranslation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.setRotation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.lookAt(new Vector3(1, 2, 3))).toBe(entity);
		});

		it('returns the parent host entity when calling attachChild/detachChild on it', function() {
			var parent = world.createEntity();
			var child = world.createEntity();

			expect(parent.attachChild(child)).toBe(parent);
			expect(parent.detachChild(child)).toBe(parent);
		});

		it('calls TransformComponent.attachChild from the injected "pair" method', function() {
			var parent = world.createEntity();
			var child = world.createEntity();

			parent.attachChild(child);

			expect(parent.transformComponent.children).toEqual([child.transformComponent]);
			expect(child.transformComponent.parent).toEqual(parent.transformComponent);
		});

		it('calls TransformComponent.detachChild from the injected "pair" method', function() {
			var parent = world.createEntity();
			var child = world.createEntity();

			parent.attachChild(child);
			parent.detachChild(child);

			expect(parent.transformComponent.children).toEqual([]);
			expect(child.transformComponent.parent).toBeFalsy();
		});
	});
});

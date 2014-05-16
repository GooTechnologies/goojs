define([
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/math/Matrix3x3',
	'goo/math/Vector3',
	'goo/entities/Entity',
	'goo/math/Transform'
], function (
	World,
	TransformComponent,
	Matrix3x3,
	Vector3,
	Entity,
	Transform
) {
	'use strict';

	describe('TransformComponent', function () {
		var world;

		beforeEach(function () {
			world = new World();
			world.registerComponent(TransformComponent);
		});

		it('can attach a child component via the transformComponent', function () {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();

			expect(parentEntity.transformComponent.children).toContain(childEntity.transformComponent);
			expect(childEntity.transformComponent.parent).toBe(parentEntity.transformComponent);
		});

		it('correctly removes parent reference of child on its removal from the world', function () {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			childEntity.removeFromWorld();
			world.process();
			expect(parentEntity.transformComponent.children).not.toContain(childEntity.transformComponent);
			expect(childEntity.transformComponent.parent).toBeNull();
		});

		it('correctly removes child reference of parent on its removal from the world (in non-recursive mode)', function () {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			parentEntity.removeFromWorld(false);
			world.process();
			expect(childEntity.transformComponent.parent).toBeNull();
			expect(parentEntity.transformComponent.children).not.toContain(childEntity.transformComponent);
		});

		//! AT: if any method fails the whole spec fails
		// what is this testing? that the methods simply exist?
		it('can set, add and get rotation', function () {
			var tc = new TransformComponent();
			tc.setRotation(1,2,2);
			tc.addRotation(0,0,1);
			tc.getRotation();
		});

		//! AT: if any method fails the whole spec fails
		// what is this testing? that the methods simply exist?
		it('can set, add and get rotation with array', function () {
			var tc = new TransformComponent();
			tc.setRotation([1,2,2]);
			tc.addRotation([0,0,1]);
		});

		//! AT: if any method fails the whole spec fails
		it('can set, add and get translation', function () {
			var tc = new TransformComponent();
			tc.setTranslation(1,2,2);
			var vec = tc.getTranslation();
			expect(vec).toEqual(new Vector3(1,2,2));
			tc.addTranslation(0,0,1);
			expect(vec).toEqual(new Vector3(1,2,3));
		});

		it('handles attaching itself to an entity', function () {
			var transformComponent = new TransformComponent();
			var entity = new Entity(world);

			entity.setComponent(transformComponent);
			expect(transformComponent.entity).toBe(entity);
		});

		// should it ever be detached? since it's enforced and there are so many dependencies probably not
		it('handles detaching itself from an entity', function () {
			var transformComponent = new TransformComponent();
			var entity = new Entity(world);

			entity.setComponent(transformComponent);
			entity.clearComponent('transformComponent');
			expect(transformComponent.entity).toBeFalsy();
		});

		it('returns the parent host entity when calling setTranslation on it', function () {
			var entity = world.createEntity();
			entity.setComponent(new TransformComponent());

			expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
		});

		it('handles getTranslation on host the same way as on itself', function () {
			var entity = world.createEntity();
			entity.setComponent(new TransformComponent());
			expect(entity.getTranslation()).toBe(entity.transformComponent.getTranslation());
		});

		it('returns the parent host entity when calling any transform related method on it', function () {
			var entity = world.createEntity();
			entity.setComponent(new TransformComponent());

			expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.setScale(new Vector3(1, 2, 3))).toBe(entity);
//			expect(entity.addTranslation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.setRotation(new Vector3(1, 2, 3))).toBe(entity);
			expect(entity.lookAt(new Vector3(1, 2, 3))).toBe(entity);
		});

		it('returns the parent host entity when calling attachChild/detachChild on it', function () {
			var parent = world.createEntity();
			var child = world.createEntity();

			expect(parent.attachChild(child)).toBe(parent);
			expect(parent.detachChild(child)).toBe(parent);
		});

		it('calls TransformComponent.attachChild from the injected "pair" method', function () {
			var parent = world.createEntity();
			var child = world.createEntity();

			parent.attachChild(child);

			expect(parent.transformComponent.children).toEqual([child.transformComponent]);
			expect(child.transformComponent.parent).toEqual(parent.transformComponent);
		});

		it('calls TransformComponent.detachChild from the injected "pair" method', function () {
			var parent = world.createEntity();
			var child = world.createEntity();

			parent.attachChild(child);
			parent.detachChild(child);

			expect(parent.transformComponent.children).toEqual([]);
			expect(child.transformComponent.parent).toBeFalsy();
		});


		describe('.applyOnEntity', function () {
			it('sets a TransformComponent when trying to add a 3 element array', function () {
				var entity = new Entity(world);
				var translation = [1, 2, 3];
				entity.set(translation);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation.equals(new Vector3(1, 2, 3))).toBeTruthy();
			});

			it('modifies the TransformComponent if it already exists when trying to add a 3 element array', function () {
				var entity = new Entity(world);
				var transformComponent = new TransformComponent();
				entity.set(transformComponent);

				var translation = [1, 2, 3];
				entity.set(translation);

				expect(entity.transformComponent).toBe(transformComponent);
				expect(entity.transformComponent.transform.translation.equals(new Vector3(1, 2, 3))).toBeTruthy();
			});

			it('sets a TransformComponent when trying to add a {x, y, z} object', function () {
				var entity = new Entity(world);
				var translation = { x: 1, y: 2, z: 3 };
				entity.set(translation);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation.equals(new Vector3(1, 2, 3))).toBeTruthy();
			});

			it('sets a TransformComponent when trying to add a Transform', function () {
				var entity = new Entity(world);
				var transform = new Transform();
				transform.translation.setd(1, 2, 3);
				entity.set(transform);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation.equals(new Vector3(1, 2, 3))).toBeTruthy();
			});
		});

		it('gets an EntitySelection of children', function () {
			var parent = world.createEntity();
			var child1 = world.createEntity();
			var child2 = world.createEntity();

			parent.attachChild(child1);
			parent.attachChild(child2);

			var children = parent.children();

			expect(children.contains(child1)).toBeTruthy();
			expect(children.contains(child2)).toBeTruthy();
		});

		it('gets an EntitySelection of parent', function () {
			var parent = world.createEntity();
			var child = world.createEntity();

			parent.attachChild(child);

			var parentSelection = child.parent();

			expect(parentSelection.contains(parent)).toBeTruthy();
		});

		describe('traverse', function () {
			it('traverses the children of an entity with a callback', function () {
				var child21 = world.createEntity('child21');
				var child22 = world.createEntity('child22');

				var child1 = world.createEntity('child1');
				var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

				var parent = world.createEntity().attachChild(child1).attachChild(child2);

				var traversed = [];
				parent.traverse(function (entity) {
					traversed.push(entity);
				});

				expect(traversed).toEqual([parent, child1, child2, child21, child22]);
			});

			it('traverses the children of an entity with a callback until false is returned', function () {
				var child21 = world.createEntity('child21');
				var child22 = world.createEntity('child22');

				var child1 = world.createEntity('child1');
				var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

				var parent = world.createEntity().attachChild(child1).attachChild(child2);

				var traversed = [];
				parent.traverse(function (entity) {
					traversed.push(entity);
					if (traversed.length >= 3) {
						return false;
					}
				});

				expect(traversed).toEqual([parent, child1, child2]);
			});
		});

		describe('traverseUp', function () {
			it('traverses the parents of an entity with a callback', function () {
				var child21 = world.createEntity('child21');
				var child22 = world.createEntity('child22');

				var child1 = world.createEntity('child1');
				var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

				var parent = world.createEntity().attachChild(child1).attachChild(child2);

				var traversed = [];
				child22.traverseUp(function (entity) {
					traversed.push(entity);
				});

				expect(traversed).toEqual([child22, child2, parent]);
			});

			it('traverses the parents of an entity with a callback until false is returned', function () {
				var child21 = world.createEntity('child21');
				var child22 = world.createEntity('child22');

				var child1 = world.createEntity('child1');
				var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

				var parent = world.createEntity().attachChild(child1).attachChild(child2);

				var traversed = [];
				child22.traverseUp(function (entity) {
					traversed.push(entity);
					return false;
				});

				expect(traversed).toEqual([child22]);
			});
		});
	});
});

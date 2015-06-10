define([
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'goo/math/Matrix3x3',
	'goo/math/Vector3',
	'goo/entities/Entity',
	'goo/math/Transform',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/HtmlComponent',
	'goo/entities/EntitySelection',
	'test/CustomMatchers'
], function (
	World,
	TransformComponent,
	TransformSystem,
	Matrix3x3,
	Vector3,
	Entity,
	Transform,
	MeshRendererComponent,
	LightComponent,
	HtmlComponent,
	EntitySelection,
	CustomMatchers
) {
	'use strict';

	describe('TransformComponent', function () {
		var world;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
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

		it('can move', function () {
			var tc = new TransformComponent();
			tc.lookAt(new Vector3(1,0,0)); // look along the positive x axis
			tc.move(0,0,-10); // this moves forward in a right handed coordinate system.
			// in our case this will move us 10 unity in the direction of the positive x axis.
			var translation = tc.getTranslation();
			expect(translation).toBeCloseToVector(new Vector3(10,0,0));
			tc.move(new Vector3(0,0,1));
			expect(translation).toBeCloseToVector(new Vector3(9,0,0));
		});

		it('can lookAt entity', function () {
			var entity1 = world.createEntity();
			entity1.move(3,7,-10);
			var t1 = entity1.getTranslation();

			var entity2 = world.createEntity();
			entity2.lookAt(entity1);
			entity2.move(0,0,-t1.length());
			var t2 = entity2.getTranslation();
			
			expect(t1).toBeCloseToVector(t2);
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

		describe('called from EntitySelection', function () {
			it('sets the translation of some entities', function () {
				var entity1 = new Entity(world).setComponent(new TransformComponent());
				var entity2 = new Entity(world).setComponent(new TransformComponent());

				new EntitySelection(entity1, entity2).setTranslation(1, 2, 3);

				expect(entity1.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(entity2.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
			});

			it('translates some entities', function () {
				var entity1 = new Entity(world).setComponent(new TransformComponent());
				var entity2 = new Entity(world).setComponent(new TransformComponent());

				entity1.setTranslation(11, 22, 33);
				entity2.setTranslation(44, 55, 66);

				new EntitySelection(entity1, entity2).addTranslation(1, 2, 3);

				expect(entity1.transformComponent.transform.translation)
				.toBeCloseToVector(new Vector3(11 + 1, 22 + 2, 33 + 3));

				expect(entity2.transformComponent.transform.translation)
				.toBeCloseToVector(new Vector3(44 + 1, 55 + 2, 66 + 3));
			});

			it('hides some entities', function () {
				var entity = new Entity(world).setComponent(new TransformComponent());
				new EntitySelection(entity).hide();
				expect(entity._hidden).toBeTruthy();
			});
		});

		describe('.applyOnEntity', function () {
			it('sets a TransformComponent when trying to add a 3 element array', function () {
				var entity = new Entity(world);
				var translation = [1, 2, 3];
				entity.set(translation);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
			});

			it('modifies the TransformComponent if it already exists when trying to add a 3 element array', function () {
				var entity = new Entity(world);
				var transformComponent = new TransformComponent();
				var transformSystem = new TransformSystem();

				entity.set(transformComponent);
				transformSystem.process([entity]);

				var translation = [1, 2, 3];
				entity.set(translation);

				expect(entity.transformComponent).toBe(transformComponent);
				expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(entity.transformComponent._dirty).toBeTruthy();
			});

			it('sets a TransformComponent when trying to add a {x, y, z} object', function () {
				var entity = new Entity(world);
				var translation = { x: 1, y: 2, z: 3 };
				entity.set(translation);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
			});

			it('sets a TransformComponent when trying to add a Transform', function () {
				var entity = new Entity(world);
				var transform = new Transform();
				transform.translation.setd(1, 2, 3);
				entity.set(transform);

				expect(entity.transformComponent).toBeTruthy();
				expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
			});

			it('applies all of the API functions correctly', function(){
				var entity = new Entity(world);
				var childEntity = new Entity(world);
				function traverseFunction(entity){
					expect(entity).toEqual(jasmine.any(Entity));
				}
				entity.set(new TransformComponent());
				childEntity.set(new TransformComponent());

				entity.setTranslation(1,2,3);
				expect(entity.getTranslation()).toEqual(new Vector3(1,2,3));

				entity.setRotation(0,0,0);
				expect(entity.getRotation()).toEqual(new Vector3(0,0,0));

				entity.setScale(1,2,3);
				expect(entity.getScale()).toEqual(new Vector3(1,2,3));

				entity.lookAt(0,0,0);

				entity.addTranslation(1,0,0);

				entity.setTranslation(1,2,3).addTranslation(1,2,3);
				expect(entity.getTranslation()).toEqual(new Vector3(2,4,6));

				entity.attachChild(childEntity);
				expect(entity.children().size()).toEqual(1);
				expect(childEntity.parent().size()).toEqual(1);

				entity.traverse(traverseFunction);
				entity.traverseUp(traverseFunction);

				entity.detachChild(childEntity);
				expect(entity.children().size()).toEqual(0);
				expect(childEntity.parent().size()).toEqual(0);

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

		//! AT: let's isolate this a bit
		// it can't stay in its own describe but it uses some methods of its own
		(function () {
			function getEntity() {
				return world.createEntity().set(new MeshRendererComponent())
					.set(new LightComponent())
					.set(new HtmlComponent());
			}

			function expectEverything(entity, entityHidden, componentsHidden) {
				expect(entity._hidden).toEqual(entityHidden);
				expect(entity.meshRendererComponent.hidden).toEqual(componentsHidden);
				expect(entity.lightComponent.hidden).toEqual(componentsHidden);
				expect(entity.htmlComponent.hidden).toEqual(componentsHidden);
			}

			describe('hide', function () {
				it('can hide an entity and its components', function () {
					var entity = getEntity();

					entity.hide();

					expectEverything(entity, true, true);
				});

				it('can hide an entity and its children and their components', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					parent1.hide();
					grandparent.hide();

					expectEverything(grandparent, true, true);
					expectEverything(parent1, true, true);
					expectEverything(parent2, false, true);
					expectEverything(child11, false, true);
					expectEverything(child12, false, true);
					expectEverything(child21, false, true);
					expectEverything(child22, false, true);
				});
			});

			describe('show', function () {
				it('can show a hidden entity and its components', function () {
					var entity = getEntity();

					entity.hide();
					entity.show();

					expectEverything(entity, false, false);
				});

				it('can show a hidden entity but keeps its components hidden if an ancestor entity is hidden', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					grandparent.hide();
					parent1.show();
					child22.show();

					expectEverything(grandparent, true, true);
					expectEverything(parent1, false, true);
					expectEverything(parent2, false, true);
					expectEverything(child11, false, true);
					expectEverything(child12, false, true);
					expectEverything(child21, false, true);
					expectEverything(child22, false, true);
				});
			});

			describe('isHidden', function () {
			    it('returns the correct hidden status for one entity', function () {
					var entity1 = getEntity();
					expect(entity1.isHidden()).toBeFalsy();

					var entity2 = getEntity();
					entity2.hide();
					expect(entity2.isHidden()).toBeTruthy();
					entity2.show();
					expect(entity2.isHidden()).toBeFalsy();
			    });

				it('returns the correct hidden status for an entity in a hierarchy', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					parent1.hide();

					expect(grandparent.isHidden()).toBeFalsy();
					expect(parent1.isHidden()).toBeTruthy();
					expect(parent2.isHidden()).toBeFalsy();

					expect(child11.isHidden()).toBeFalsy();
					expect(child12.isHidden()).toBeFalsy();
					expect(child21.isHidden()).toBeFalsy();
					expect(child22.isHidden()).toBeFalsy();
				});
			});

			describe('isVisiblyHidden', function () {
				it('returns the correct visibly hidden status for one entity', function () {
					var entity1 = getEntity();
					expect(entity1.isVisiblyHidden()).toBeFalsy();

					var entity2 = getEntity();
					entity2.hide();
					expect(entity2.isVisiblyHidden()).toBeTruthy();
					entity2.show();
					expect(entity2.isVisiblyHidden()).toBeFalsy();
				});

				it('returns the correct visibly hidden status for an entity in a hierarchy', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					parent1.hide();

					expect(grandparent.isVisiblyHidden()).toBeFalsy();
					expect(parent1.isVisiblyHidden()).toBeTruthy();
					expect(parent2.isVisiblyHidden()).toBeFalsy();

					expect(child11.isVisiblyHidden()).toBeTruthy();
					expect(child12.isVisiblyHidden()).toBeTruthy();
					expect(child21.isVisiblyHidden()).toBeFalsy();
					expect(child22.isVisiblyHidden()).toBeFalsy();
				});
			});

			//! AT: components will be visible if attached after the entity was hidden
			// same goes for entities attached after the parent was hidden
		})();
	});
});

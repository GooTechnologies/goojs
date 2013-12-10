define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent'
], function(
	World,
	Entity,
	MeshDataComponent,
	MeshRendererComponent
) {
	'use strict';

	describe('Entity', function() {
		var world;
		beforeEach(function() {
			world = new World();
			Entity.entityCount = 0;
		});

		it('addToWorld', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			entity1.addToWorld();
			entity2.addToWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(true);
		});

		it('addToWorld recursive', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			entity1.transformComponent.attachChild(entity2.transformComponent);
			entity2.transformComponent.attachChild(entity3.transformComponent);
			entity1.addToWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(true);
			expect(world.entityManager.containsEntity(entity3)).toBe(true);
		});

		it('addToWorld non-recursive', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			entity1.transformComponent.attachChild(entity2.transformComponent);
			entity2.transformComponent.attachChild(entity3.transformComponent);
			entity1.addToWorld(false);
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(false);
			expect(world.entityManager.containsEntity(entity3)).toBe(false);
		});

		it('removeFromWorld', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			entity1.addToWorld();
			entity2.addToWorld();
			world.process();
			entity1.removeFromWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(false);
			expect(world.entityManager.containsEntity(entity2)).toBe(true);
		});

		it('removeFromWorld recursive', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			entity1.transformComponent.attachChild(entity2.transformComponent);
			entity2.transformComponent.attachChild(entity3.transformComponent);
			entity1.addToWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(true);
			expect(world.entityManager.containsEntity(entity3)).toBe(true);
			entity2.removeFromWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(false);
			expect(world.entityManager.containsEntity(entity3)).toBe(false);

			expect(entity1.transformComponent.children.length).toBe(0);
			expect(entity2.transformComponent.parent).toBeNull();
			expect(entity3.transformComponent.parent).toBe(entity2.transformComponent);
		});

		it('removeFromWorld non-recursive', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			entity1.transformComponent.attachChild(entity2.transformComponent);
			entity2.transformComponent.attachChild(entity3.transformComponent);
			entity1.addToWorld();
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(true);
			expect(world.entityManager.containsEntity(entity3)).toBe(true);
			entity2.removeFromWorld(false);
			world.process();
			expect(world.entityManager.containsEntity(entity1)).toBe(true);
			expect(world.entityManager.containsEntity(entity2)).toBe(false);
			expect(world.entityManager.containsEntity(entity3)).toBe(true);

			expect(entity1.transformComponent.children.length).toBe(0);
			expect(entity2.transformComponent.parent).toBeNull();
			expect(entity2.transformComponent.children.length).toBe(0);
			expect(entity3.transformComponent.parent).toBeNull();
		});

		it('toString', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity('myEnt');
			var entity3 = world.createEntity();
			expect(entity1.toString()).toBe('Entity_0');
			expect(entity2.toString()).toBe('myEnt');
			expect(entity3.toString()).toBe('Entity_2');
		});

		it('all entities should have TransformComponent', function() {
			var entity = world.createEntity();
			expect(entity.transformComponent !== undefined).toBe(true);
		});

		it('setComponent', function() {
			var entity = world.createEntity();
			entity.setComponent(new MeshDataComponent());
			expect(entity.meshDataComponent !== undefined).toBe(true);
		});

		it('cannot add the same component twice', function() {
			var entity = world.createEntity();
			var component = new MeshDataComponent();
			entity.setComponent(component);
			entity.setComponent(component);
			expect(entity._components.length).toBe(2);
		});

		it('cannot add more than one component of the same type to the same entity', function() {
			var entity = world.createEntity();
			entity.setComponent(new MeshDataComponent());
			entity.setComponent(new MeshDataComponent());
			expect(entity._components.length).toBe(2);
		});

		it('discards the second added component of the same type', function() {
			var entity = world.createEntity();
			var component1 = new MeshDataComponent();
			var component2 = new MeshDataComponent();
			entity.setComponent(component1);
			entity.setComponent(component2);
			var gotComponent = entity.getComponent('MeshDataComponent');
			expect(gotComponent).toBe(component1);
		});

		it('getComponent', function() {
			var entity = world.createEntity();
			var mdc = new MeshDataComponent();
			entity.setComponent(mdc);
			expect(entity.getComponent('meshDataComponent')).toBe(mdc);
			expect(entity.getComponent('MeshDataComponent')).toBe(mdc);
			expect(entity.getComponent('TransformComponent') !== undefined).toBe(true);
		});

		it('hasComponent', function() {
			var entity = world.createEntity();
			entity.setComponent(new MeshDataComponent());
			expect(entity.hasComponent('alabalaportocala')).toBe(false);
			expect(entity.hasComponent('TransformComponent')).toBe(true);
			expect(entity.hasComponent('MeshDataComponent')).toBe(true);
		});

		it('clears a component', function() {
			var entity = world.createEntity();
			entity.setComponent(new MeshDataComponent());
			entity.setComponent(new MeshRendererComponent());
			world.process();
			entity.clearComponent('MeshRendererComponent');
			world.process();
			expect(entity.hasComponent('MeshDataComponent')).toBe(true);
			expect(entity.hasComponent('MeshRendererComponent')).toBe(false);
		});

		/*
		it('cannot clear a transform component', function() {
			var entity = world.createEntity();
			entity.setComponent(new MeshDataComponent());
			world.process();
			entity.clearComponent('transformComponent');
			world.process();
			expect(entity.hasComponent('MeshDataComponent')).toBe(true);
			expect(entity.hasComponent('TransformComponent')).toBe(true);
		});
		*/

		it('')
	});
});

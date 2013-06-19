define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/components/MeshDataComponent'
], function(
	World,
	Entity,
	MeshDataComponent
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
		it('overwriting components', function() {
			var entity = world.createEntity();
			var mdc1 = new MeshDataComponent();
			entity.setComponent(mdc1);

			var mdc2 = new MeshDataComponent();
			entity.setComponent(mdc2);
			expect(entity.getComponent('meshDataComponent')).toBe(mdc2);
		});
	});
});

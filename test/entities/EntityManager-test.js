define([
	'goo/entities/World',
	'goo/entities/managers/EntityManager'
], function(
	World,
	EntityManager
) {
	'use strict';

	describe('EntityManager', function() {
		var world;
		var entityManager;
		beforeEach(function() {
			world = new World();
			entityManager = new EntityManager();
		});
		it('containsEntity', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			entityManager.added(entity1);

			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(false);
		});
		it('getEntityById', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			entityManager.added(entity1);

			expect(entityManager.getEntityById(entity1.id)).toEqual(entity1);
			expect(entityManager.getEntityById(entity1.id)).not.toEqual(entity2);
			expect(entityManager.getEntityById(1234)).toBeUndefined();
		});
		it('getEntityByName', function() {
			var entity1 = world.createEntity('entity1');
			var entity2 = world.createEntity('entity2');
			entityManager.added(entity1);

			expect(entityManager.getEntityByName(entity1.name)).toEqual(entity1);
			expect(entityManager.getEntityByName(entity1.name)).not.toEqual(entity2);
			expect(entityManager.getEntityByName('uknownentity')).toBeUndefined();
		});
		it('getEntities', function() {
			var entity1 = world.createEntity('entity1');
			var entity2 = world.createEntity('entity2');
			var entity3 = world.createEntity('entity3');
			entityManager.added(entity1);
			entityManager.added(entity2);

			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');
		});
		it('getTopEntities', function() {
			var entity1 = world.createEntity('entity1');
			var entity2 = world.createEntity('entity2');
			entity2.transformComponent.attachChild(entity1.transformComponent);
			entityManager.added(entity1);
			entityManager.added(entity2);

			expect(entityManager.getTopEntities()).toContain(entity2);
			expect(entityManager.getTopEntities()).not.toContain(entity1);
		});
	});
});

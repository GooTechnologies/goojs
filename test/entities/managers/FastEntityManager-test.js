define([
	'goo/entities/World',
	'goo/entities/managers/FastEntityManager'
], function(
	World,
	FastEntityManager
) {
	'use strict';

	// REVIEW: Great with tests! Some feedback on them:
	// Regarding naming,
	// imagine that `it` is the first world of a sentence.
	// This helps with keeping the tests focused and small,
	// and also makes it obvious what went wrong if it failed.
	//
	// Also, it's possible to use nested describes for clarity.
	// Consider something like:
	//
	// describe('FastEntityManager', function() {
	//   describe('containsEntity', function() {
	//     beforeEach(...);
	//     it('returns false before entity is added', ...);
	//     it('returns true after entity is added', ...);
	//     it('returns true after entity is added a second time', ...);
	//   });
	//   describe('removed', ...);
	// });

	describe('FastEntityManager', function() {
		var world;
		var entityManager;
		beforeEach(function() {
			world = new World();
			entityManager = new FastEntityManager();
		});

		it('added & containsEntity', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();

			expect(entityManager.containsEntity(entity1)).toBe(false);
			expect(entityManager.containsEntity(entity2)).toBe(false);

			entityManager.added(entity1);
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(false);

			entityManager.added(entity2);
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(true);

			entityManager.added(entity1); //add again to see what happens
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(true);

			entityManager.added(entity2); //add again to see what happens
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(true);
		});

		it('removed', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			var entity4 = world.createEntity();

			entityManager.added(entity1);
			entityManager.added(entity3);
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(false);
			expect(entityManager.containsEntity(entity3)).toBe(true);
			expect(entityManager.containsEntity(entity4)).toBe(false);

			entityManager.removed(entity1);
			entityManager.removed(entity3);
			expect(entityManager.containsEntity(entity1)).toBe(false);
			expect(entityManager.containsEntity(entity2)).toBe(false);
			expect(entityManager.containsEntity(entity3)).toBe(false);
			expect(entityManager.containsEntity(entity4)).toBe(false);

			entityManager.removed(entity2);
			entityManager.removed(entity3); //remove entity3 again
			expect(entityManager.containsEntity(entity1)).toBe(false);
			expect(entityManager.containsEntity(entity2)).toBe(false);
			expect(entityManager.containsEntity(entity3)).toBe(false);
			expect(entityManager.containsEntity(entity4)).toBe(false);

			entityManager.added(entity1);
			entityManager.added(entity2);
			entityManager.added(entity4);
			entityManager.removed(entity2);
			entityManager.removed(entity3);
			expect(entityManager.containsEntity(entity1)).toBe(true);
			expect(entityManager.containsEntity(entity2)).toBe(false);
			expect(entityManager.containsEntity(entity3)).toBe(false);
			expect(entityManager.containsEntity(entity4)).toBe(true);
		});

		it('getEntityById', function() {
			var entity1 = world.createEntity();
			var entity2 = world.createEntity();
			var entity3 = world.createEntity();
			var entity4 = world.createEntity();

			entityManager.added(entity1);
			entityManager.added(entity3);

			expect(entityManager.getEntityById(entity1.id)).toEqual(entity1);
			expect(entityManager.getEntityById(entity1.id)).not.toEqual(entity2);
			expect(entityManager.getEntityById(entity2.id)).toBeUndefined();
			expect(entityManager.getEntityById(entity3.id)).toEqual(entity3);
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
			expect(entityManager.getEntities().length).toEqual(1);
			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).not.toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');

			entityManager.added(entity2);
			expect(entityManager.getEntities().length).toEqual(2);
			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');

			entityManager.removed(entity1);
			expect(entityManager.getEntities().length).toEqual(1);
			expect(entityManager.getEntities()).not.toContain(entity1);
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

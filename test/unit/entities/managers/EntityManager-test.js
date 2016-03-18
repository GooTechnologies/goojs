	describe('EntityManager', function () {

		var World = require('src/goo/entities/World');
		var EntityManager = require('src/goo/entities/managers/EntityManager');

		var world;
		var entityManager;
		beforeEach(function () {
			world = new World();
			entityManager = new EntityManager();
		});

		describe('added & containsEntity', function () {
			var entity1, entity2;
			beforeEach(function () {
				entityManager = new EntityManager();
				entity1 = world.createEntity();
				entity2 = world.createEntity();
			});

			it('adds nothing and contains nothing', function () {
				expect(entityManager.containsEntity(entity1)).toBeFalsy();
				expect(entityManager.containsEntity(entity2)).toBeFalsy();
			});

			it('adds an entity and contains it', function () {
				entityManager.added(entity1);
				expect(entityManager.containsEntity(entity1)).toBeTruthy();
				expect(entityManager.containsEntity(entity2)).toBeFalsy();
			});

			it('adds 2 entities and contains them both', function () {
				entityManager.added(entity1);
				entityManager.added(entity2);
				expect(entityManager.containsEntity(entity1)).toBeTruthy();
				expect(entityManager.containsEntity(entity2)).toBeTruthy();
			});

			it('tries to add the same entity twice and contains it', function () {
				entityManager.added(entity1);
				entityManager.added(entity1); //add again to see what happens
				expect(entityManager.containsEntity(entity1)).toBeTruthy();
			});

			it('adds 2 entities with the same id but different indices', function () {
				entity1.id = 'asd';
				entity2.id = 'asd';
				entityManager.added(entity1);
				entityManager.added(entity2);
				expect(entityManager.containsEntity(entity1)).toBeTruthy();
				expect(entityManager.containsEntity(entity2)).toBeTruthy();
			});
		});

		describe('removed', function () {
			var entity1, entity2;
			beforeEach(function () {
				entityManager = new EntityManager();
				entity1 = world.createEntity();
				entity2 = world.createEntity();
			});

			it('tries to remove a non-added entity', function () {
				entityManager.removed(entity1);
				expect(entityManager.containsEntity(entity1)).toBeFalsy();
			});

			it('removes an entity', function () {
				entityManager.added(entity1);
				entityManager.removed(entity1);
				expect(entityManager.containsEntity(entity1)).toBeFalsy();
			});

			it('removes one entity and leaves the other intact', function () {
				entityManager.added(entity1);
				entityManager.added(entity2);
				entityManager.removed(entity1);
				expect(entityManager.containsEntity(entity1)).toBeFalsy();
				expect(entityManager.containsEntity(entity2)).toBeTruthy();
			});

			it('tries to remove the same entity twice', function () {
				entityManager.added(entity1);
				entityManager.removed(entity1);
				entityManager.removed(entity1);
				expect(entityManager.containsEntity(entity1)).toBeFalsy();
			});
		});

		describe('getEntityById', function () {
			var entity1, entity2, entity3;
			beforeEach(function () {
				entityManager = new EntityManager();
				entity1 = world.createEntity();
				entity2 = world.createEntity();
				entity3 = world.createEntity();
				entityManager.added(entity1);
				entityManager.added(entity3);
			});

			it('gets an entity by its id', function () {
				expect(entityManager.getEntityById(entity1.id)).toEqual(entity1);
				expect(entityManager.getEntityById(entity3.id)).toEqual(entity3);
			});

			it('tries to get a non-added entity by its id', function () {
				expect(entityManager.getEntityById(entity2.id)).toBeUndefined();
			});
		});

		describe('getEntityByName', function () {
			var entity1, entity2, entity3;
			beforeEach(function () {
				entityManager = new EntityManager();
				entity1 = world.createEntity();
				entity2 = world.createEntity();
				entity3 = world.createEntity();
				entityManager.added(entity1);
				entityManager.added(entity3);
			});

			it('gets an entity by its name', function () {
				expect(entityManager.getEntityByName(entity1.name)).toEqual(entity1);
				expect(entityManager.getEntityByName(entity3.name)).toEqual(entity3);
			});

			it('tries to get a non-added entity by its name', function () {
				expect(entityManager.getEntityByName(entity2.name)).toBeUndefined();
			});
		});

		describe('getEntities', function () {
			var entity1, entity2, entity3;
			beforeEach(function () {
				entityManager = new EntityManager();
				entity1 = world.createEntity();
				entity2 = world.createEntity();
				entity3 = world.createEntity();
			});

			it('adds an entity and gets all entities', function () {
				entityManager.added(entity1);
				expect(entityManager.getEntities().length).toEqual(1);
				expect(entityManager.getEntities()).toContain(entity1);
				expect(entityManager.getEntities()).not.toContain(entity2);
				expect(entityManager.getEntities()).not.toContain(entity3);
				expect(entityManager.getEntities()).not.toContain('fishbowl');
			});

			it('adds two entities and gets all entities', function () {
				entityManager.added(entity1);
				entityManager.added(entity2);
				expect(entityManager.getEntities().length).toEqual(2);
				expect(entityManager.getEntities()).toContain(entity1);
				expect(entityManager.getEntities()).toContain(entity2);
				expect(entityManager.getEntities()).not.toContain(entity3);
				expect(entityManager.getEntities()).not.toContain('fishbowl');
			});

			it('adds two entities, removed one and gets all entities', function () {
				entityManager.added(entity1);
				entityManager.added(entity2);
				entityManager.removed(entity1);
				expect(entityManager.getEntities().length).toEqual(1);
				expect(entityManager.getEntities()).not.toContain(entity1);
				expect(entityManager.getEntities()).toContain(entity2);
				expect(entityManager.getEntities()).not.toContain(entity3);
				expect(entityManager.getEntities()).not.toContain('fishbowl');
			});

			it('retrieves two distinct entities with the same id', function () {
				entity1.id = 'e1';
				entity2.id = 'e1';

				entityManager.added(entity1);
				entityManager.added(entity2);

				expect(entityManager.getEntities().length).toEqual(2);

				expect(entityManager.getEntities()).toContain(entity1);
				expect(entityManager.getEntities()).toContain(entity2);
			});
		});

		it('can get top entities', function () {
			var entity1 = world.createEntity('entity1');
			var entity2 = world.createEntity('entity2');
			entity2.transformComponent.attachChild(entity1.transformComponent);
			entityManager.added(entity1);
			entityManager.added(entity2);

			expect(entityManager.getTopEntities()).toContain(entity2);
			expect(entityManager.getTopEntities()).not.toContain(entity1);
		});

		it('can get the number of entities that the Entity Manager holds', function () {
			var entity1 = world.createEntity('entity1');
			var entity2 = world.createEntity('entity2');

			expect(entityManager.size()).toEqual(0);

			entityManager.added(entity1);
			expect(entityManager.size()).toEqual(1);

			entityManager.added(entity2);
			expect(entityManager.size()).toEqual(2);

			entityManager.removed(entity2);
			expect(entityManager.size()).toEqual(1);
		});

		describe('by.id', function () {
			var world;
			var entity1, entity2, entity3;
			beforeEach(function () {
				world = new World();
				entity1 = world.createEntity().addToWorld();
				entity2 = world.createEntity();
				entity3 = world.createEntity().addToWorld();
				world.process();
			});

			it('gets an entity by its id', function () {
				expect(world.by.id(entity1.id).first()).toEqual(entity1);
				expect(world.by.id(entity3.id).first()).toEqual(entity3);
			});

			it('tries to get a non-added entity by its id', function () {
				expect(world.by.id(entity2.id).first()).toBeUndefined();
			});
		});

		describe('by.name', function () {
			var world;
			var entity1, entity2, entity3;
			beforeEach(function () {
				world = new World();
				entity1 = world.createEntity().addToWorld();
				entity2 = world.createEntity();
				entity3 = world.createEntity().addToWorld();
				world.process();
			});

			it('gets an entity by its id', function () {
				expect(world.by.name(entity1.name).first()).toEqual(entity1);
				expect(world.by.name(entity3.name).first()).toEqual(entity3);
			});

			it('tries to get a non-added entity by its id', function () {
				expect(world.by.name(entity2.name).first()).toBeUndefined();
			});
		});
	});
define([
	'goo/entities/Entity',
	'goo/entities/managers/EntityManager',
	'goo/entities/World'
], function (
	Entity,
	EntityManager,
	World
) {
	'use strict';

	responseTime('EntityManager.added for 3000 entities', 10, function () {
		var nEntities = 3000;
		var world = new World();
		var entityManager = new EntityManager();
		for (var i = 0; i < nEntities; i++) {
			var entity = new Entity(world);
			entityManager.added(entity);
		}
	});

	responseTime('Create 3000 entities and EntityManager.added for another 3000 entities', 10, function () {
		var nEntities = 3000;
		var world = new World();
		var entityManager = new EntityManager();
		for (var i = 0; i < nEntities; i++) {
			var entity = new Entity(world);
		}
		for (var i = 0; i < nEntities; i++) {
			var entity = new Entity(world);
			entityManager.added(entity);
		}
	});

	responseTime('Repeat 10 times (EntityManager.added for 3000 entities and Entity.removed all)', 4, function () {
		var nEntities = 3000;
		var nAddRemoveCycles = 10;
		var world = new World();
		var entityManager = new EntityManager();

		Entity.entityCount = 0;

		var index = 0;
		for (var i = 0; i < nAddRemoveCycles; i++) {
			for (var j = 0; j < nEntities; j++) {
				var entity = new Entity(world);
				entityManager.added(entity);
			}
			for (var j = 0; j < nEntities; j++) {
				entityManager.removed(entityManager.getEntityByIndex(index));
				index++;
			}
		}
	});
});

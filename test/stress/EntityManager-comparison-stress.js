define(
[
	"goo/entities/Entity",
	"goo/entities/managers/EntityManager",
	"goo/entities/World",
	"goo/entities/managers/FastEntityManager"
], function(
	Entity,
	EntityManager,
	World,
	FastEntityManager
	) {
		'use strict';

		function measureDuration(fun) {
			var startTime = window.performance.now();
			fun();
			var endTime = window.performance.now();
			var timeDiff = endTime - startTime;
			return timeDiff;
		}

		function repeat(times, fun) {
			var min = Number.MAX_VALUE;
			var avg, sum = 0;
			var max = Number.MIN_VALUE;
			for(var i = 0; i < times; i++) {
				var duration = measureDuration(fun);
				if(duration > max) {
					max = duration;
				}
				if(duration < min) {
					min = duration;
				}
				sum += duration;
			}
			avg = sum / times;
			return { min: min, avg: avg, max: max };
		}

		function responseTime(description, times, fun) {
			var measurement = repeat(times, fun);
			console.log(description + ' took {' +
				' min: ' + measurement.min +
				', avg: ' + measurement.avg +
				', max: ' + measurement.max + ' } milliseconds to execute');
		}

		responseTime('EntityManager.added for 30000 entities', 10, function() {
			var nEntities = 30000;
			var world = new World();
			var entityManager = new EntityManager();
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
				entityManager.added(entity);
			}
		});

		responseTime('FastEntityManager.added for 30000 entities', 10, function() {
			var nEntities = 30000;
			var world = new World();
			var fastEntityManager = new FastEntityManager();
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
				fastEntityManager.added(entity);
			}
		});

		responseTime('Create 30000 entities and EntityManager.added for another 30000 entities', 10, function() {
			var nEntities = 30000;
			var world = new World();
			var entityManager = new EntityManager();
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
			}
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
				entityManager.added(entity);
			}
		});

		responseTime('Create 30000 entities and FastEntityManager.added for another 30000 entities', 10, function() {
			var nEntities = 30000;
			var world = new World();
			var fastEntityManager = new FastEntityManager();
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
			}
			for(var i = 0; i < nEntities; i++) {
				var entity = new Entity(world, '');
				fastEntityManager.added(entity);
			}
		});

		responseTime('Repeat 10 times ( EntityManager.added for 30000 entities and Entity.removed all )', 4, function() {
			var nEntities = 30000;
			var nAddRemoveCycles = 10;
			var world = new World();
			var entityManager = new EntityManager();

			Entity.entityCount = 0;

			var index = 0;
			for(var i = 0; i < nAddRemoveCycles; i++) {
				for(var j = 0; j < nEntities; j++) {
					var entity = new Entity(world, '');
					entityManager.added(entity);
				}
				for(var j = 0; j < nEntities; j++) {
					entityManager.removed(entityManager.getEntityById(index));
					index++;
				}
			}
		});

		responseTime('Repeat 10 times ( FastEntityManager.added for 30000 entities and Entity.removed all )', 4, function() {
			var nEntities = 30000;
			var nAddRemoveCycles = 10;
			var world = new World();
			var entityManager = new FastEntityManager();

			Entity.entityCount = 0;

			var index = 0;
			for(var i = 0; i < nAddRemoveCycles; i++) {
				for(var j = 0; j < nEntities; j++) {
					var entity = new Entity(world, '');
					entityManager.added(entity);
				}
				for(var j = 0; j < nEntities; j++) {
					entityManager.removed(entityManager.getEntityById(index));
					index++;
				}
			}
		});
	});

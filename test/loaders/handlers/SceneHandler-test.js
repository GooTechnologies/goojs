define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	Entity,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('SceneHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a scene with entities', function() {
			var config = Configs.scene();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(scene) {
				expect(scene.entities).toEqual(jasmine.any(Array));
				var entity = scene.entities[0];
				expect(entity).toEqual(jasmine.any(Entity));
				expect(entity._world._addedEntities).toContain(entity);
			});
			wait(p, 200);
		});
	});

});
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

	describe('EntityHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads an entity', function() {
			var config = Configs.entity();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity).toEqual(jasmine.any(Entity));
				expect(entity.id).toBe(config.id);
			});
			wait(p);
		});
	});

});
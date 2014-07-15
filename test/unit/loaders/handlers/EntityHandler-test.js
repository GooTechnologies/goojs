define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	Entity,
	DynamicLoader,
	Configs
) {
	'use strict';
	
	describe('EntityHandler', function () {
		var loader;
	
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		
		it('loads an entity', function (done) {
			var config = Configs.entity();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity).toEqual(jasmine.any(Entity));
				expect(entity.id).toBe(config.id);
				done();
			});
		});
	});
});
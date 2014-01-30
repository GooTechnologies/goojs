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

	describe('ProjectHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a project with scene', function() {
			var config = Configs.project();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(project) {
				console.log(project);
				expect(project.mainScene).toBeDefined();
				expect(project.mainScene.entities).toEqual(jasmine.any(Array));
			});
			wait(p);
		});
		it('loads a slightly more complex project', function() {
			var config = Configs.project(true);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(project) {
				console.log(project);
				expect(project.mainScene).toBeDefined();
				expect(project.mainScene.entities[0]).toEqual(jasmine.any(Entity));
				expect(project.material);
			});
			wait(p);
		});
	});

});
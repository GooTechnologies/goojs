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
	
	describe('ProjectHandler', function () {
		var loader;
		
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		
		it('loads a project with scene', function (done) {
			var config = Configs.project();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (project) {
				expect(project.mainScene).toBeDefined();
				expect(project.mainScene.entities).toEqual(jasmine.any(Object));
				done();
			});
		});
		
		it('loads a slightly more complex project', function (done) {
			var config = Configs.project(true);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (project) {
				expect(project.mainScene).toBeDefined();
				var entity;
				for (var key in project.mainScene.entities) {
					entity = project.mainScene.entities[key];
				}
				expect(entity).toEqual(jasmine.any(Entity));
				done();
			});
		});
	});
});
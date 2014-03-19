define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/loaders/DynamicLoader',
	'loaders/Configs',
	'goo/entities/components/QuadComponent',
	'goo/loaders/handlers/QuadComponentHandler'
], function(
	World,
	Material,
	DynamicLoader,
	Configs,
	QuadComponent,
	QuadComponentHandler
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() {
			return promise.isResolved;
		}, 'promise does not get resolved', time);
	}

	describe('QuadComponentHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a quadComponent', function() {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.quadComponent).toEqual(jasmine.any(QuadComponent));
			});

			wait(p);
		});

		it('loads default material if no material ref was given', function() {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				var newConfig = JSON.parse(JSON.stringify(config));

				// Remove the material!
				delete newConfig.components.quad.materialRef;
				return loader.update(config.id,newConfig);

			}).then(function(entity){
				// Hopefully we loaded the default material
				expect(entity.meshRendererComponent.materials[0]).toEqual(QuadComponentHandler.DEFAULT_MATERIAL);
			});

			wait(p);
		});

		it('cleans up after the config was updated', function() {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				var newConfig = JSON.parse(JSON.stringify(config));

				// Remove the material!
				delete newConfig.components.quad;
				return loader.update(config.id,newConfig);

			}).then(function(entity){
				expect(entity._components.length).toBe(1); // just the transform component is left
			});

			wait(p);
		});

		it('cleans up after the component is removed', function() {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				entity.clearComponent('quadComponent');
			});

			wait(p);
		});
	});
});

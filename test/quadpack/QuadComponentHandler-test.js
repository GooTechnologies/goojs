define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs',
	'goo/quadpack/QuadComponent',
	'goo/quadpack/QuadComponentHandler'
], function (
	World,
	Material,
	DynamicLoader,
	Configs,
	QuadComponent
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function () {
			return promise.isResolved;
		}, 'promise does not get resolved', time);
	}

	describe('QuadComponentHandler', function () {
		var loader;
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a quadComponent', function () {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function (entity) {
				expect(entity.quadComponent).toEqual(jasmine.any(QuadComponent));
			});

			wait(p);
		});

		it('cleans up after the config was updated', function () {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function () {
				var newConfig = JSON.parse(JSON.stringify(config));

				// Remove the material!
				delete newConfig.components.quad;
				return loader.update(config.id, newConfig);

			}).then(function (entity) {
				expect(entity._components.length).toBe(1); // just the transform component is left
			});

			wait(p, 100);
		});
	});
});

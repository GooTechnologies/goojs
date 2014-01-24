define([
	'goo/entities/World',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('DynamicLoader', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './'
			});
		});

		it('loads bundle', function() {
			// Create a bundlewrapper to preload and skip ajax
			var config = Configs.entity();
			var bundleRef = Configs.randomRef('bundle');

			loader.update(bundleRef, Configs.get());
			// Load bundle
			var p = loader.load(bundleRef).then(function() {
				var keys = Object.keys(loader._ajax._cache);

				expect(keys).toContain(config.id);
				expect(loader._ajax._cache[config.id].components).toBeDefined();
			});

			wait(p);
		});
	});

});
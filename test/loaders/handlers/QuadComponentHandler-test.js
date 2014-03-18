define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/loaders/DynamicLoader',
	'loaders/Configs',
	'goo/entities/components/QuadComponent'
], function(
	World,
	Material,
	DynamicLoader,
	Configs,
	QuadComponent
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
	});

});

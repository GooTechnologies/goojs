define([
	'goo/entities/World',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/state/SteadyState',
	'goo/animation/blendtree/ClipSource',
	'goo/animation/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	AnimationLayer,
	SteadyState,
	ClipSource,
	AnimationClip,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('AnimationLayersHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a collection of animation layers', function() {
			var layersConfig = Configs.animation();
			loader.preload(Configs.get());
			var p = loader.load(layersConfig.id).then(function(layers) {
				expect(layers.length).toBe(Object.keys(layersConfig.layers).length);

				var layer = layers[0];
				expect(layer).toEqual(jasmine.any(AnimationLayer));
				expect(layer._currentState).toEqual(jasmine.any(SteadyState));
			});
			wait(p);
		});
		it('sorts animation layers correctly', function() {
			var layersConfig = Configs.animation();
			loader.preload(Configs.get());
			var p = loader.load(layersConfig.id).then(function(layers) {
				for (var i = 0; i < layers.length; i++) {
					expect(layersConfig.layers[layers[i].id].sortValue).toBe(i);
				}
			});
			wait(p);
		});
	});
});
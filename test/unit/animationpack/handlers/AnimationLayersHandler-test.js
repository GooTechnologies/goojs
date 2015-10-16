define([
	'goo/entities/World',
	'goo/animationpack/layer/AnimationLayer',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	AnimationLayer,
	SteadyState,
	ClipSource,
	AnimationClip,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('AnimationLayersHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads a collection of animation layers', function (done) {
			var layersConfig = Configs.animation();
			loader.preload(Configs.get());
			loader.load(layersConfig.id).then(function (layers) {
				expect(layers.length).toBe(Object.keys(layersConfig.layers).length);

				var layer = layers[0];
				expect(layer).toEqual(jasmine.any(AnimationLayer));
				expect(layer._currentState).toEqual(jasmine.any(SteadyState));
				done();
			});
		});

		it('sorts animation layers correctly', function (done) {
			var layersConfig = Configs.animation();
			loader.preload(Configs.get());
			loader.load(layersConfig.id).then(function (layers) {
				for (var i = 0; i < layers.length; i++) {
					expect(layersConfig.layers[layers[i].id].sortValue).toBe(i);
				}
				done();
			});
		});
	});
});
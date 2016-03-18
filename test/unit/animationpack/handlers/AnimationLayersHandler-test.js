
	import World from 'src/goo/entities/World';
	import DynamicLoader from 'src/goo/loaders/DynamicLoader';
	import SteadyState from 'src/goo/animationpack/state/SteadyState';
	import AnimationLayer from 'src/goo/animationpack/layer/AnimationLayer';
	import Configs from 'test/unit/loaders/Configs';

describe('AnimationLayersHandler', function () {


	require('src/goo/animationpack/handlers/AnimationHandlers');

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
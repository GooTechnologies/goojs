
	import World from 'src/goo/entities/World';
	import DynamicLoader from 'src/goo/loaders/DynamicLoader';
	import SteadyState from 'src/goo/animationpack/state/SteadyState';
	import ClipSource from 'src/goo/animationpack/blendtree/ClipSource';
	import AnimationClip from 'src/goo/animationpack/clip/AnimationClip';
	import Configs from 'test/unit/loaders/Configs';

describe('AnimationStateHandler', function () {


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

	it('loads an animation state', function (done) {
		var stateConfig = Configs.animstate();
		loader.preload(Configs.get());
		loader.load(stateConfig.id).then(function (state) {
			expect(state).toEqual(jasmine.any(SteadyState));
			expect(state._sourceTree).toEqual(jasmine.any(ClipSource));
			expect(state._sourceTree._clip).toEqual(jasmine.any(AnimationClip));
			done();
		});
	});
});
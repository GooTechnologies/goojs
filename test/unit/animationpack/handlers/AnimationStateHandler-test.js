describe('AnimationStateHandler', function () {

	var World = require('src/goo/entities/World');
	var DynamicLoader = require('src/goo/loaders/DynamicLoader');
	var SteadyState = require('src/goo/animationpack/state/SteadyState');
	var ClipSource = require('src/goo/animationpack/blendtree/ClipSource');
	var AnimationClip = require('src/goo/animationpack/clip/AnimationClip');
	var Configs = require('test/unit/loaders/Configs');

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
define([
	'goo/entities/World',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	SteadyState,
	ClipSource,
	AnimationClip,
	DynamicLoader,
	Configs
) {
	'use strict';
	
	describe('AnimationStateHandler', function () {
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
});
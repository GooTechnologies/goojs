define([
	'goo/entities/World',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function(
	World,
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

	describe('AnimationStateHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads an animation state', function() {
			var stateConfig = Configs.animstate();
			loader.preload(Configs.get());
			var p = loader.load(stateConfig.id).then(function(state) {
				expect(state).toEqual(jasmine.any(SteadyState));
				expect(state._sourceTree).toEqual(jasmine.any(ClipSource));
				expect(state._sourceTree._clip).toEqual(jasmine.any(AnimationClip));
			});
			wait(p);
		});
	});
});
define([
	'goo/entities/World',
	'goo/animationpack/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'../../loaders/Configs'
], function(
	World,
	AnimationClip,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('AnimationClipHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a clip', function() {
			var config = Configs.clip();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(clip) {
				expect(clip).toEqual(jasmine.any(AnimationClip));
			});
			wait(p);
		});
	});
});
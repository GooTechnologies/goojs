define([
	'goo/entities/World',
	'goo/animationpack/clip/AnimationClip',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	AnimationClip,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('AnimationClipHandler', function () {
		var loader;
		
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		
		it('loads a clip', function (done) {
			var config = Configs.clip();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (clip) {
				expect(clip).toEqual(jasmine.any(AnimationClip));
				done();
			});
		});
	});
});
define([
	'goo/entities/World',
	'goo/animation/SkeletonPose',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	SkeletonPose,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('SkeletonHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a skeleton', function() {
			var config = Configs.skeleton();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(skeleton) {
				expect(skeleton).toEqual(jasmine.any(SkeletonPose));
				expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
			});
			wait(p);
		});
		it('order joints correctly', function() {
			var config = Configs.skeleton();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(skeleton) {
				var joints = skeleton._skeleton._joints;
				var ordered = joints.every(function(joint, idx) {
					if (idx === 0) { return true; }
					return joint._index > joints[idx-1]._index;
				});
				expect(ordered).toBeTruthy();
				expect(skeleton).toEqual(jasmine.any(SkeletonPose));
				expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
			});
			wait(p);
		});
	});

});
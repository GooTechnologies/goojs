define([
	'goo/entities/World',
	'goo/animationpack/SkeletonPose',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	SkeletonPose,
	DynamicLoader,
	Configs
) {
	'use strict';
	
	describe('SkeletonHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads a skeleton', function (done) {
			var config = Configs.skeleton();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (skeleton) {
				expect(skeleton).toEqual(jasmine.any(SkeletonPose));
				expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
				done();
			});
		});

		it('order joints correctly', function (done) {
			var config = Configs.skeleton();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (skeleton) {
				var joints = skeleton._skeleton._joints;
				var ordered = joints.every(function (joint, idx) {
					if (idx === 0) { return true; }
					return joint._index > joints[idx-1]._index;
				});
				expect(ordered).toBeTruthy();
				expect(skeleton).toEqual(jasmine.any(SkeletonPose));
				expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
				done();
			});
		});
	});
});
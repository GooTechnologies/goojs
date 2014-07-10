define([
	'goo/entities/World',
	'goo/animationpack/components/AnimationComponent',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/layer/AnimationLayer',

	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function(
	World,
	AnimationComponent,
	SkeletonPose,
	AnimationLayer,

	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('AnimationComponentHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads an entity with animation component', function() {
			var config = Configs.entity(['animation']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.animationComponent).toEqual(jasmine.any(AnimationComponent));
			});
			wait(p);
		});
		it('loads component with layers and skeletonpose', function() {
			var config = Configs.entity(['animation']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				var component = entity.animationComponent;
				expect(component._skeletonPose).toEqual(jasmine.any(SkeletonPose));
				expect(component.layers[0]).toEqual(jasmine.any(AnimationLayer));
			});
			wait(p);
		});
	});
});
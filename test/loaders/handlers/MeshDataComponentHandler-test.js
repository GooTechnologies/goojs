define([
	'goo/entities/World',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/MeshData',
	'goo/animationpack/SkeletonPose',
	'goo/loaders/DynamicLoader',
	'../Configs'
], function(
	World,
	MeshDataComponent,
	MeshData,
	SkeletonPose,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('MeshDataComponentHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './'
			});
		});
		it('loads an entity with a meshDataComponent', function() {
			var config = Configs.entity(['meshData']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
				expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
				expect(entity.meshDataComponent.currentPose).toEqual(jasmine.any(SkeletonPose));
			});
			wait(p);
		});
		it('loads a meshDatacomponent with a shape', function() {
			var config = Configs.entity();
			config.components.meshData = Configs.component.meshData('Sphere');
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
				expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
			});
			wait(p);
		});
	});
});
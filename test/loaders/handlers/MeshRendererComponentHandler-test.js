define([
	'goo/entities/World',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	MeshRendererComponent,
	Material,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('MeshRendererComponentHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a meshRendererComponent', function() {
			var config = Configs.entity(['meshRenderer']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.meshRendererComponent).toEqual(jasmine.any(MeshRendererComponent));
				expect(entity.meshRendererComponent.materials[0]).toEqual(jasmine.any(Material));
				console.log(entity);
			});
			wait(p);
		});
		it('loads materials in right order', function() {
			var config = Configs.entity(['meshRenderer']);
			var materialConfigs = config.components.meshRenderer.materials;
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				var materials = entity.meshRendererComponent.materials;
				var sortMaterials = {};

				for (var key in materialConfigs) {
					var sortValue = materialConfigs[key].sortValue;
					var ref = materialConfigs[key].materialRef;
					sortMaterials[sortValue] = loader._objects[ref];
				}

				var keys = Object.keys(sortMaterials).sort();
				for (var i = 0; i < keys.length; i++) {
					console.log(keys[i],i);
					expect(sortMaterials[keys[i]]).toBe(materials[i]);
				}
				expect(entity.meshRendererComponent).toEqual(jasmine.any(MeshRendererComponent));
				expect(entity.meshRendererComponent.materials[0]).toEqual(jasmine.any(Material));
				console.log(entity);
			});
			wait(p);
		});
	});

});
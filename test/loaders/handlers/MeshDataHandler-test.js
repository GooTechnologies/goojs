define([
	'goo/entities/World',
	'goo/renderer/MeshData',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function (
	World,
	MeshData,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function () { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('MeshDataHandler', function () {
		var loader;
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});

		it('loads a meshdata object', function () {
			var config = Configs.mesh();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function (mesh) {
				expect(mesh).toEqual(jasmine.any(MeshData));
				for (var key in config.attributes) {
					var view = mesh.dataViews[key];
					expect(view).toEqual(jasmine.any(Float32Array));

					var length = config.vertexCount * config.attributes[key].dimensions;
					expect(view.length).toBe(length);
				}
			});
			wait(p);
		});

		// remove entities from world
		// deallocate all
		// deallocateEntity from GPU
		// clear cache
		// full

		it('clears meshdata from the GPU', function () {
			var config = Configs.mesh();
			loader.preload(Configs.get());
			var m;
			var p = loader.load(config.id).then(function (meshdata) {
				m = meshdata;
				return loader.clear();
			}).then(function () {
				expect(m.vertexData.glBuffer).toBeFalsy();
				expect(m.indexData.glBuffer).toBeFalsy();
			});
			wait(p, 1000);
		});
	});
});
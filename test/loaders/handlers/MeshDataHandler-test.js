define([
	'goo/entities/World',
	'goo/entities/GooRunner',
	'goo/renderer/MeshData',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function (
	World,
	GooRunner,
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
		var world;
		var gooRunner;
		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false
			});
			world = gooRunner.world;
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});
		afterEach(function () {
			gooRunner.clear();
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

		it('clears meshdata from the GPU', function () {
			var config = Configs.mesh();
			loader.preload(Configs.get());
			var m;
			var p = loader.load(config.id).then(function (meshdata) {
				m = meshdata;
				m.vertexData.glBuffer = gooRunner.renderer.context.createBuffer();
				m.indexData.glBuffer = gooRunner.renderer.context.createBuffer();
				return loader.clear();
			}).then(function () {
				expect(m.vertexData.glBuffer).toBeFalsy();
				expect(m.indexData.glBuffer).toBeFalsy();
			});
			wait(p, 1000);
		});
	});
});
define([
	'goo/entities/World',
	'goo/entities/GooRunner',
	'goo/renderer/MeshData',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	GooRunner,
	MeshData,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('MeshDataHandler', function () {
		var loader;

		beforeEach(function () {
//			gooRunner = new GooRunner({
//				logo: false
//			});
//			world = gooRunner.world;
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});

//		afterEach(function () {
//			gooRunner.clear();
//		});

		it('loads a meshdata object', function (done) {
			var config = Configs.mesh();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (mesh) {
				expect(mesh).toEqual(jasmine.any(MeshData));
				for (var key in config.attributes) {
					var view = mesh.dataViews[key];
					expect(view).toEqual(jasmine.any(Float32Array));

					var length = config.vertexCount * config.attributes[key].dimensions;
					expect(view.length).toBe(length);
				}
				done();
			});
		});

		xit('clears meshdata from the GPU', function (done) {
			var config = Configs.mesh();
			loader.preload(Configs.get());
			var m;
			loader.load(config.id).then(function (meshdata) {
				m = meshdata;
				m.vertexData.glBuffer = gooRunner.renderer.context.createBuffer();
				m.indexData.glBuffer = gooRunner.renderer.context.createBuffer();
				return loader.clear();
			}).then(function () {
				expect(m.vertexData.glBuffer).toBeFalsy();
				expect(m.indexData.glBuffer).toBeFalsy();
				done();
			});
		});
	});
});
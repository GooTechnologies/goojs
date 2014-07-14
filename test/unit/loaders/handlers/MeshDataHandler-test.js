define([
	'goo/entities/World',
	'goo/renderer/MeshData',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	MeshData,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('MeshDataHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});

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
	});
});
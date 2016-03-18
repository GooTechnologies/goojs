
		import MeshData from 'src/goo/renderer/MeshData';
		import GooRunner from 'src/goo/entities/GooRunner';
		import DynamicLoader from 'src/goo/loaders/DynamicLoader';
		import Configs from 'test/unit/loaders/Configs';
	describe('MeshDataHandler', function () {

		var gooRunner, loader;

		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false,
				manuallyStartGameLoop: true
			});
			loader = new DynamicLoader({
				world: gooRunner.world,
				rootPath: 'loaders/res/'
			});
		});

		afterEach(function () {
			gooRunner.clear();
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
			}, function () {
				expect('').toEqual('Should never reach this');
				done();
			});
		});

		it('clears meshdata from the GPU', function (done) {
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

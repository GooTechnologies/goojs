	describe('MeshDataComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './'
			});
		});

		it('loads an entity with a meshDataComponent', function (done) {
			var config = Configs.entity(['meshData']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
				expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
				expect(entity.meshDataComponent.currentPose).toEqual(jasmine.any(SkeletonPose));
				done();
			});
		});

		it('loads a meshDatacomponent with a shape', function (done) {
			var config = Configs.entity();
			config.components.meshData = Configs.component.meshData('Sphere');
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
				expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
				done();
			});
		});
	});

	describe('QuadComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a quadComponent', function (done) {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.quadComponent).toEqual(jasmine.any(QuadComponent));
				done();
			});
		});

		it('cleans up after the config was updated', function (done) {
			var config = Configs.entity(['quad']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function () {
				var newConfig = JSON.parse(JSON.stringify(config));

				// Remove the material!
				delete newConfig.components.quad;
				return loader.update(config.id, newConfig);
			}).then(function (entity) {
				expect(entity._components.length).toEqual(1); // just the transform component is left
				done();
			});
		});
	});

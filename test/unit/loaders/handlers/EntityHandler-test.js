	describe('EntityHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity', function (done) {
			var config = Configs.entity();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity).toEqual(jasmine.any(Entity));
				expect(entity.id).toBe(config.id);
				done();
			});
		});

		it('loads an entity with tags', function (done) {
			var config = Configs.entity();
			config.tags = { t1: true, t2: true };
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.hasTag('t1')).toEqual(true);
				expect(entity.hasTag('t2')).toEqual(true);
				done();
			});
		});
	});

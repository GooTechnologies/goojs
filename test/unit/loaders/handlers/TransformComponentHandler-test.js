		import TransformComponent from 'src/goo/entities/components/TransformComponent';
		import DynamicLoader from 'src/goo/loaders/DynamicLoader';
		import World from 'src/goo/entities/World';
		import Configs from 'test/unit/loaders/Configs';
		import Vector3 from 'src/goo/math/Vector3';
		import CustomMatchers from 'test/unit/CustomMatchers';
	describe('TransformComponentHandler', function () {


		var loader;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);

			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a transformComponent', function (done) {
			var config = Configs.entity(['transform']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.transformComponent).toEqual(jasmine.any(TransformComponent));
				done();
			});
		});

		it('loads the correct transform', function (done) {
			var config = Configs.entity(['transform']);
			config.components.transform.translation = [1, 2, 3];
			config.components.transform.rotation = [4, 5, 6];
			config.components.transform.scale = [7, 8, 9];

			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				var t = entity.transformComponent.transform;
				var ct = config.components.transform;
				expect(t.translation).toBeCloseToVector(Vector3.fromArray(ct.translation));
				expect(t.scale).toBeCloseToVector(Vector3.fromArray(ct.scale));
				var rotation = t.rotation.toAngles();
				rotation.scale(180 / Math.PI);
				expect(rotation).toBeCloseToVector(Vector3.fromArray(ct.rotation));
				done();
			});
		});

		it('updates existing transformcomponent', function (done) {
			//var component;
			var config = Configs.entity(['transform']);

			var newConfig = Configs.entity(['transform']);
			newConfig.components.transform.translation = [1, 2, 3];
			newConfig.id = config.id;

			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				//component = entity.transformComponent;

				return loader.update(config.id, newConfig);
			}).then(function (entity) {
//				expect(entity.transformComponent).toEqual(component);

				var t = entity.transformComponent.transform;
				var ct = newConfig.components.transform;
				expect(t.translation).toBeCloseToVector(Vector3.fromArray(ct.translation));
				expect(t.scale).toBeCloseToVector(Vector3.fromArray(ct.scale));
				var rotation = t.rotation.toAngles();
				rotation.scale(180 / Math.PI);
				expect(rotation).toBeCloseToVector(Vector3.fromArray(ct.rotation));
				done();
			});
		});

		function inScene(id) {
			if (loader._world.entityManager.getEntityById(id)) {
				return true;
			}
			var addedEntities = loader._world._addedEntities;
			for (var i = 0; i < addedEntities.length; i++) {
				var entity = addedEntities[i];
				if (entity.id === id) {
					return true;
				}
			}
			return false;
		}

		xit('adds hierarchy correctly outside of scene', function (done) {
			var parentConfig = Configs.entity(['transform']);
			var childConfig = Configs.entity(['transform']);
			Configs.attachChild(parentConfig, childConfig);

			loader.preload(Configs.get());

			loader.load(parentConfig.id).then(function (entity) {
				loader._world.process();
				expect(entity.transformComponent.children.length).toBeGreaterThan(0);

				var child = entity.transformComponent.children[0];
				expect(child).toEqual(jasmine.any(TransformComponent));
				expect(child.entity.id).toBe(childConfig.id);
				expect(child.parent).toBe(entity.transformComponent);
				expect(inScene(parentConfig.id)).toBeFalsy();
				expect(inScene(childConfig.id)).toBeFalsy();
				done();
			});
		});

		it('adds hierarchy correctly inside of scene', function (done) {
			var sceneConfig = Configs.scene();
			var childConfig = Configs.entity();
			var parentId = Object.keys(sceneConfig.entities)[0];
			var parentConfig = Configs.get()[parentId];

			Configs.attachChild(parentConfig, childConfig);
			loader.preload(Configs.get());
			loader.load(sceneConfig.id).then(function () {
				loader._world.process();
				expect(inScene(childConfig.id)).toBeTruthy();
				expect(inScene(parentConfig.id)).toBeTruthy();
				done();
			});
		});
	});

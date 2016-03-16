	describe('EnvironmentHandler', function () {

		var World = require('src/goo/entities/World');
		var TransformComponent = require('src/goo/entities/components/TransformComponent');
		var MeshDataComponent = require('src/goo/entities/components/MeshDataComponent');
		var MeshRendererComponent = require('src/goo/entities/components/MeshRendererComponent');
		var RenderSystem = require('src/goo/entities/systems/RenderSystem');
		var DynamicLoader = require('src/goo/loaders/DynamicLoader');
		var ShaderBuilder = require('src/goo/renderer/shaders/ShaderBuilder');
		var Configs = require('test/unit/loaders/Configs');

		require('src/goo/loaders/handlers/EnvironmentHandler');

		var loader, world;

		beforeEach(function () {
			world = new World();

			// Pretending to be gooRunner
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.registerComponent(MeshRendererComponent);
			world.setSystem(new RenderSystem());
			// Faking a goorunner
			world.gooRunner = {
				world: world
			};

			loader = new DynamicLoader({
				world: world,
				rootPath: window.__karma__ ? './' : 'loaders/res'
			});
		});

		it('loads an environment', function (done) {
			var config = Configs.environment();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (environment) {
				expect(ShaderBuilder.GLOBAL_AMBIENT).toEqual(environment.globalAmbient);

				expect(ShaderBuilder.FOG_SETTINGS).toEqual([environment.fog.near, environment.fog.far]);
				expect(ShaderBuilder.FOG_COLOR).toEqual(environment.fog.color);
				expect(ShaderBuilder.USE_FOG).toBe(environment.fog.enabled);

				expect(world._addedEntities).toContain(
					environment.weatherState.snow.snow.particleCloudEntity
				);

				done();
			});
		});
	});

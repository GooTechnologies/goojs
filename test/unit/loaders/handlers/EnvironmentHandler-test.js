		import World from 'src/goo/entities/World';
		import TransformComponent from 'src/goo/entities/components/TransformComponent';
		import MeshDataComponent from 'src/goo/entities/components/MeshDataComponent';
		import MeshRendererComponent from 'src/goo/entities/components/MeshRendererComponent';
		import RenderSystem from 'src/goo/entities/systems/RenderSystem';
		import DynamicLoader from 'src/goo/loaders/DynamicLoader';
		import ShaderBuilder from 'src/goo/renderer/shaders/ShaderBuilder';
		import Configs from 'test/unit/loaders/Configs';
	describe('EnvironmentHandler', function () {


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
				rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
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

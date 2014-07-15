define([
	'goo/entities/World',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/loaders/DynamicLoader',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/systems/RenderSystem',
	'test/loaders/Configs'
], function (
	World,
	ShaderBuilder,
	DynamicLoader,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	RenderSystem,
	Configs
) {
	'use strict';
	
	describe('EnvironmentHandler', function () {
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
});
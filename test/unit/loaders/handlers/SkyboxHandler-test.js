define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Texture',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/loaders/DynamicLoader',
	'goo/loaders/handlers/EnvironmentHandler',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/systems/RenderSystem',
	'test/loaders/Configs'
], function (
	World,
	Entity,
	Material,
	Shader,
	ShaderLib,
	Texture,
	Box,
	Sphere,
	DynamicLoader,
	EnvironmentHandler,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	RenderSystem,
	Configs
) {
	'use strict';

	describe('SkyboxHandler', function () {
		var loader, world;
		beforeEach(function () {
			world = new World();

			// Pretending to be gooRunner
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.registerComponent(MeshRendererComponent);
			world.setSystem(new RenderSystem());

			loader = new DynamicLoader({
				world: world,
				rootPath: window.__karma__ ? './' : 'loaders/res'
			});
		});

		it('loads a skybox', function (done) {
			var config = Configs.skybox();
			loader.preload(Configs.get());
			var renderSystem = world.getSystem('RenderSystem');
			spyOn(renderSystem, 'added');

			EnvironmentHandler.currentSkyboxRef = config.id;

			loader.load(config.id).then(function (skyboxes) {
				var skybox = skyboxes[0];
				expect(skybox).toEqual(jasmine.any(Entity));

				// expect(renderSystem.added).toHaveBeenCalledWith(skybox); //! AT: this causes problems in jasmine 2.0
				// seems like a bug in their pretty printer (skybox can't be pretty printed)
				// will comment it out for now and replace with just an id check (which is enough in this case)
				expect(renderSystem.added.calls.mostRecent().args[0].id).toEqual(skybox.id);

				expect(skybox.isSkybox).toBeTruthy();

				// Texture and material
				var material = skybox.meshRendererComponent.materials[0];
				expect(material).toEqual(jasmine.any(Material));
				var texture = material.getTexture('DIFFUSE_MAP');
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image.data.length).toBe(6);

				// Mesh
				var mesh = skybox.meshDataComponent.meshData;
				expect(mesh).toEqual(jasmine.any(Box));
				done();
			});
		});

		it('loads a skysphere', function (done) {
			var config = Configs.skybox('sphere');
			loader.preload(Configs.get());

			EnvironmentHandler.currentSkyboxRef = config.id;

			loader.load(config.id).then(function (skyboxes) {
				var skybox = skyboxes[0];
				expect(skybox).toEqual(jasmine.any(Entity));
				expect(skybox.isSkybox).toBeTruthy();

				// Texture and material
				var material = skybox.meshRendererComponent.materials[0];
				expect(material).toEqual(jasmine.any(Material));
				var texture = material.getTexture('DIFFUSE_MAP');
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));

				// Mesh
				var mesh = skybox.meshDataComponent.meshData;
				expect(mesh).toEqual(jasmine.any(Sphere));
				done();
			});
		});
	});
});
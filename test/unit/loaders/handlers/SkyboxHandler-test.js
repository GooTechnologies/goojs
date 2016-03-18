		import Entity from 'src/goo/entities/Entity';
		import TransformComponent from 'src/goo/entities/components/TransformComponent';
		import MeshDataComponent from 'src/goo/entities/components/MeshDataComponent';
		import MeshRendererComponent from 'src/goo/entities/components/MeshRendererComponent';
		import RenderSystem from 'src/goo/entities/systems/RenderSystem';
		import DynamicLoader from 'src/goo/loaders/DynamicLoader';
		import EnvironmentHandler from 'src/goo/loaders/handlers/EnvironmentHandler';
		import World from 'src/goo/entities/World';
		import Texture from 'src/goo/renderer/Texture';
		import Material from 'src/goo/renderer/Material';
		import Box from 'src/goo/shapes/Box';
		import Sphere from 'src/goo/shapes/Sphere';
		import Configs from 'test/unit/loaders/Configs';
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
				rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
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

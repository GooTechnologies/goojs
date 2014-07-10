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
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/systems/RenderSystem',
	'test/loaders/Configs'
], function(
	World,
	Entity,
	Material,
	Shader,
	ShaderLib,
	Texture,
	Box,
	Sphere,
	DynamicLoader,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	RenderSystem,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('SkyboxHandler', function() {
		var loader, world;
		beforeEach(function() {
			world = new World();

			// Pretending to be gooRunner
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.registerComponent(MeshRendererComponent);
			world.setSystem(new RenderSystem());

			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});
		it('loads a skybox', function() {
			var config = Configs.skybox();
			loader.preload(Configs.get());
			var renderSystem = world.getSystem('RenderSystem');
			spyOn(renderSystem, 'added');

			var p = loader.load(config.id).then(function(skyboxes) {
				var skybox = skyboxes[0];
				expect(skybox).toEqual(jasmine.any(Entity));
				expect(renderSystem.added).toHaveBeenCalledWith(skybox);
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
			});
			wait(p, 5000);
		});
		it('loads a skysphere', function() {
			var config = Configs.skybox('sphere');
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(skyboxes) {
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
			});
			wait(p, 5000);
		});
	});
});
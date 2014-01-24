define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Texture',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	Material,
	Shader,
	ShaderLib,
	Texture,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('MaterialHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});
		it('loads a material with a shader', function() {
			var config = Configs.material();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(material) {
				expect(material).toEqual(jasmine.any(Material));
				expect(material.shader).toEqual(jasmine.any(Shader));
			});
			wait(p);
		});
		it('loads a material with a shader and a texture', function() {
			var config = Configs.material();
			config.texturesMapping.DIFFUSE_MAP = {
				enabled: true,
				textureRef: Configs.texture().id
			};
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(material) {
				var texture = material.getTexture('DIFFUSE_MAP');
				expect(material.shader).toEqual(jasmine.any(Shader));
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));
			});
			wait(p, 1000);
		});
		it('loads a material with an engine shader', function() {
			var config = Configs.material();
			config.shaderRef = 'GOO_ENGINE_SHADERS/uber';
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(material) {
				expect(material.shader.shaderDefinition).toBe(ShaderLib.uber);
			});
			wait(p, 1000);
		});
	});
});
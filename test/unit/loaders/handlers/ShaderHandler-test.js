define([
	'goo/entities/World',
	'goo/renderer/Shader',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	Shader,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('ShaderHandler', function () {
		var loader;
		
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		
		it('loads a shader', function (done) {
			var config = Configs.shader();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (shader) {
				expect(shader).toEqual(jasmine.any(Shader));
				done();
			});
		});
	});
});
define([
	'goo/entities/World',
	'goo/renderer/Shader',
	'goo/loaders/DynamicLoader',
	'loaders/Configs',
	'goo/entities/GooRunner'
], function (
	World,
	Shader,
	DynamicLoader,
	Configs,
	GooRunner
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function () { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('ShaderHandler', function () {

		var loader;
		var world;
		var gooRunner;
		beforeEach(function () {
			gooRunner = new GooRunner({
				logo: false
			});
			world = gooRunner.world;
			loader = new DynamicLoader({
				world: world,
				rootPath: 'loaders/res/'
			});
		});
		afterEach(function () {
			gooRunner.clear();
		});

		it('loads a shader', function () {
			var config = Configs.shader();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function (shader) {
				expect(shader).toEqual(jasmine.any(Shader));
			});
			wait(p);
		});

		it('clears shader from the GPU', function () {
			var config = Configs.shader();
			loader.preload(Configs.get());
			var s;
			var p = loader.load(config.id).then(function (shader) {
				s = shader;
				shader.compile(gooRunner.renderer);
				expect(s.shaderProgram).toBeTruthy();
				expect(s.fragmentShader).toBeTruthy();
				expect(s.vertexShader).toBeTruthy();
				return loader.clear();
			}).then(function () {
				expect(s.shaderProgram).toBeFalsy();
				expect(s.fragmentShader).toBeFalsy();
				expect(s.vertexShader).toBeFalsy();
			});
			wait(p, 1000);
		});
	});

});
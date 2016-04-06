var GooRunner = require('../../../../src/goo/entities/GooRunner');
var DynamicLoader = require('../../../../src/goo/loaders/DynamicLoader');
var Shader = require('../../../../src/goo/renderer/Shader');
var Configs = require('../../../../test/unit/loaders/Configs');

describe('ShaderHandler', function () {
	var gooRunner, loader;

	beforeEach(function () {
		gooRunner = new GooRunner({
			logo: false,
			manuallyStartGameLoop: true
		});
		loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'loaders/res/'
		});
	});

	afterEach(function () {
		gooRunner.clear();
	});

	it('loads a shader', function (done) {
		var config = Configs.shader();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (shader) {
			expect(shader).toEqual(jasmine.any(Shader));
			done();
		});
	});

	it('clears shader from the GPU', function (done) {
		var config = Configs.shader();
		loader.preload(Configs.get());
		var s;
		loader.load(config.id).then(function (shader) {
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
			done();
		});
	});
});

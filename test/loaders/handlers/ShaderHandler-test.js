define([
	'goo/entities/World',
	'goo/renderer/Shader',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	Shader,
	DynamicLoader,
	Configs
) {
	'use strict';
	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('ShaderHandler', function() {
		var loader;
		beforeEach(function() {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		it('loads a shader', function() {
			var config = Configs.shader();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(shader) {
				expect(shader).toEqual(jasmine.any(Shader));
			});
			wait(p);
		});
	});

});
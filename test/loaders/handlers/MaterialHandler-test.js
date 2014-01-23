define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/loaders/DynamicLoader',
	'loaders/Configs'
], function(
	World,
	Material,
	Shader,
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
				rootPath: './',
				ajax: false
			});
		});
		it('loads a material with a shader', function() {
			var config = Configs.material();
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(material) {
				console.log(material);
				expect(material).toEqual(jasmine.any(Material));
				expect(material.shader).toEqual(jasmine.any(Shader));
			});
			wait(p);
		});
	});
});
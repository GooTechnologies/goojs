define([
	'goo/entities/World',
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	ParticleComponent,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('ParticleComponentHandler', function () {
		var loader;
		
		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});
		
		it('loads an entity with a ParticleComponent', function (done) {
			var config = Configs.entity(['particle']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.particleComponent).toEqual(jasmine.any(ParticleComponent));
				done();
			});
		});
	});
});
define([
	'goo/entities/World',
	'goo/addons/physicspack/handlers/ColliderComponentHandler',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	ColliderComponentHandler,
	ColliderComponent,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('ColliderComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with collider component', function (done) {
			var config = Configs.entity(['collider']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.colliderComponent).toEqual(jasmine.any(ColliderComponent));
				done();
			});
		});
	});
});
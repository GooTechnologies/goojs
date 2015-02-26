define([
	'goo/entities/World',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/handlers/RigidbodyComponentHandler',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	RigidbodyComponent,
	RigidbodyComponentHandler,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('RigidbodyComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with rigidbody component', function (done) {
			var config = Configs.entity(['rigidbody']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.rigidbodyComponent).toEqual(jasmine.any(RigidbodyComponent));
				done();
			});
		});
	});
});
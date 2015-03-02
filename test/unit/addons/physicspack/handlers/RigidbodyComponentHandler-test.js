define([
	'goo/entities/World',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/handlers/RigidbodyComponentHandler',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs',
	'goo/math/Vector3'
], function (
	World,
	RigidbodyComponent,
	RigidbodyComponentHandler,
	DynamicLoader,
	Configs,
	Vector3
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

			config.components.rigidbody.mass = 3;
			config.components.rigidbody.velocity = [1, 2, 3];
			config.components.rigidbody.angularVelocity = [4, 5, 6];

			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.rigidbodyComponent).toEqual(jasmine.any(RigidbodyComponent));

				var velocity = new Vector3();
				entity.rigidbodyComponent.getVelocity(velocity);
				expect(velocity).toEqual(new Vector3(1, 2, 3));

				var angularVelocity = new Vector3();
				entity.rigidbodyComponent.getAngularVelocity(angularVelocity);
				expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

				expect(entity.rigidbodyComponent.mass).toBe(3);

				done();
			});
		});
	});
});
define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/entities/SystemBus'
], function (
	World,
	Entity,
	CameraComponent,
	Camera,
	SystemBus
	) {
	'use strict';

	describe('CameraComponent', function () {
		var world;

		beforeEach(function () {
			world = new World();
			world.registerComponent(CameraComponent);
		});

		it('attaches .setAsMainCamera to the host entity', function () {
			var camera = new Camera();
			var cameraComponent = new CameraComponent(camera);
			var entity = new Entity(world);

			entity.setComponent(cameraComponent);
			expect(entity.setAsMainCamera).toBeDefined();
		});

		describe('.setAsMainCamera', function () {
			it('sets the main camera', function () {
				var camera = new Camera();
				var cameraComponent = new CameraComponent(camera);
				var entity = new Entity(world);

				entity.setComponent(cameraComponent);

				var listener = jasmine.createSpy('camera-listener');
				SystemBus.addListener('goo.setCurrentCamera', listener);
				entity.setAsMainCamera();
				expect(listener).toHaveBeenCalledWith({
					camera: camera,
					entity: entity
				});
			});

			it('returns the calling entity', function () {
				var cameraComponent = new CameraComponent(new Camera());
				var entity = new Entity(world);

				entity.setComponent(cameraComponent);
				expect(entity.setAsMainCamera()).toBe(entity);
			});
		});
	});
});

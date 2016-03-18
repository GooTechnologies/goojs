describe('CameraComponent', function () {

	var Entity = require('src/goo/entities/Entity');
	var World = require('src/goo/entities/World');
	var SystemBus = require('src/goo/entities/SystemBus');
	var Camera = require('src/goo/renderer/Camera');
	var CameraComponent = require('src/goo/entities/components/CameraComponent');
	var CustomMatchers = require('test/unit/CustomMatchers');

	var world;

	beforeEach(function () {
		world = new World();
		world.registerComponent(CameraComponent);
		jasmine.addMatchers(CustomMatchers);
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
				},
				'goo.setCurrentCamera',
				SystemBus
			);
		});

		it('returns the calling entity', function () {
			var cameraComponent = new CameraComponent(new Camera());
			var entity = new Entity(world);

			entity.setComponent(cameraComponent);
			expect(entity.setAsMainCamera()).toBe(entity);
		});
	});

	describe('copy', function () {
		it('can copy everything from another camera component', function () {
			var original = new CameraComponent(new Camera(50, 2, 2, 2000));
			var copy = new CameraComponent(new Camera(50, 2, 2, 2000));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a camera component', function () {
			var original = new CameraComponent(new Camera(50, 2, 2, 2000));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});

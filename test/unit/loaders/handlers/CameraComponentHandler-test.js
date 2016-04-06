var DynamicLoader = require('../../../../src/goo/loaders/DynamicLoader');
var World = require('../../../../src/goo/entities/World');
var Configs = require('../../../../test/unit/loaders/Configs');
var CameraComponent = require('../../../../src/goo/entities/components/CameraComponent');
var Camera = require('../../../../src/goo/renderer/Camera');

describe('CameraComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a cameraComponent', function (done) {
		var config = Configs.entity(['camera']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.cameraComponent).toEqual(jasmine.any(CameraComponent));
			expect(entity.cameraComponent.camera).toEqual(jasmine.any(Camera));
			done();
		});
	});

	it('loads the correct camera settings', function (done) {
		var config = Configs.entity(['camera']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			var camera = entity.cameraComponent.camera;
			var cameraConfig = config.components.camera;
			for (var key in cameraConfig) {
				if (key !== 'projectionMode') {
					expect(camera[key]).toBe(cameraConfig[key]);
				}
			}
			done();
		});
	});
});

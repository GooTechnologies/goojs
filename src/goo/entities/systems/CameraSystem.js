define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/Renderer'
],
	/** @lends */
function (
	System,
	SystemBus,
	Renderer
) {
	'use strict';

	/**
	 * @class Updates cameras/cameracomponents with their transform component transforms
	 */
	function CameraSystem() {
		System.call(this, 'CameraSystem', ['TransformComponent', 'CameraComponent']);
		this.mainCamera = null;
	}

	CameraSystem.prototype = Object.create(System.prototype);

	CameraSystem.prototype.findMainCamera = function () {
		var mainCamera = null;
		var mainCameraEntity = null;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var cameraComponent = this._activeEntities[i].cameraComponent;
			if (!mainCamera || cameraComponent.isMain) {
				mainCamera = cameraComponent.camera;
				mainCameraEntity = this._activeEntities[i];
			}
		}
		SystemBus.emit('goo.setCurrentCamera', { camera: mainCamera, entity: mainCameraEntity });
		Renderer.mainCamera = mainCamera;
	};

	CameraSystem.prototype.inserted = function () {
		this.findMainCamera();
	};

	CameraSystem.prototype.deleted = function () {
		this.findMainCamera();
	};

	CameraSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var transformComponent = entity.transformComponent;
			var cameraComponent = entity.cameraComponent;

			if (transformComponent._updated) {
				cameraComponent.updateCamera(transformComponent.worldTransform);
			}
		}
	};

	return CameraSystem;
});
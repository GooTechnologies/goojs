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

	/**
	 * Sets the Renderer's main camera to be the first camera of the CameraComponents
	 * in the currently active entities of this system.
	 */
	CameraSystem.prototype.findMainCamera = function () {
		var mainCamera = null;
		var mainCameraEntity = null;
		var numberOfEntities = this._activeEntities.length;
		for (var i = 0; i < numberOfEntities; i++) {
			var cameraComponent = this._activeEntities[i].cameraComponent;
			// REVIEW: the cameracomponent does not have any property isMain?
			// Also, why not break upon setting the mainCamera.
			if (!mainCamera || cameraComponent.isMain) {
				mainCamera = cameraComponent.camera;
				mainCameraEntity = this._activeEntities[i];
			}
		}
		SystemBus.emit('goo.setCurrentCamera', { camera: mainCamera, entity: mainCameraEntity });
		Renderer.mainCamera = mainCamera;
	};

	CameraSystem.prototype.inserted = function () {
		if (!Renderer.mainCamera) {
			this.findMainCamera();
		}
	};

	CameraSystem.prototype.deleted = function () {
		//! AT: leaving it like this until a better solution is found
		// apparently it might conflict with the new loader scheme
		//this.findMainCamera();
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
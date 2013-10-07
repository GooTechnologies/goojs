define(['goo/entities/systems/System', 'goo/entities/EventHandler', 'goo/renderer/Renderer'],
	/** @lends */
	function (System, EventHandler, Renderer) {
	"use strict";

	/**
	 * @class Updates cameras/cameracomponents with ther transform component transforms
	 */
	function CameraSystem() {
		System.call(this, 'CameraSystem', ['Camera']);

		this.mainCamera = null;
	}

	CameraSystem.prototype = Object.create(System.prototype);

	CameraSystem.prototype.findMainCamera = function () {
		var mainCamera = null;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var camera = this._activeEntities[i].camera;
			if (!mainCamera || camera.isMain) {
				mainCamera = camera;
			}
		}
		EventHandler.dispatch("setCurrentCamera", mainCamera);
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
			var camera = entity.camera;

			if (entity._updated) {
				camera.updateFromTransform(entity.worldTransform);
			}
		}
	};

	return CameraSystem;
});
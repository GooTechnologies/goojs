define(['goo/entities/systems/System', 'goo/entities/EventHandler', 'goo/renderer/Renderer'], function(System, EventHandler, Renderer) {
	"use strict";

	/**
	 * @name CameraSystem
	 * @class TODO: not finished
	 */
	function CameraSystem() {
		System.call(this, 'CameraSystem', ['TransformComponent', 'CameraComponent']);

		this.mainCamera = null;
	}

	CameraSystem.prototype = Object.create(System.prototype);

	CameraSystem.prototype.findMainCamera = function() {
		var mainCamera = null;
		for ( var i in this._activeEntities) {
			var cameraComponent = this._activeEntities[i].cameraComponent;
			if (!mainCamera || cameraComponent.isMain) {
				mainCamera = cameraComponent.camera;
			}
		}
		EventHandler.dispatch("setCurrentCamera", mainCamera);
		Renderer.mainCamera = mainCamera;
	};

	CameraSystem.prototype.inserted = function(entity) {
		this.findMainCamera();
	};

	CameraSystem.prototype.deleted = function(entity) {
		this.findMainCamera();
	};

	CameraSystem.prototype.process = function(entities) {
		for ( var i in entities) {
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
define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], 
/** @lends */
function(
	ComponentHandler,
	CameraComponent,
	Camera,
	RSVP,
	pu,
	_
) {
	"use strict";

	/**
	* @class
	*/
	function CameraComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	CameraComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('camera', CameraComponentHandler);
	CameraComponentHandler.prototype.constructor = CameraComponentHandler;

	CameraComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
			fov: 45,
			near: 1,
			far: 10000,
			projectionMode: 0,
			size: 100,
			aspect: 1,
			lockedRatio: false
		});
	};

	CameraComponentHandler.prototype._create = function(entity/*, config*/) {
		var camera = new Camera(45, 1, 1, 1000);
		var component = new CameraComponent(camera);
		entity.setComponent(component);
		return component;
	};

	CameraComponentHandler.prototype.update = function(entity, config) {
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		component.camera.setProjectionMode(config.projectionMode);
		component.camera.lockedRatio = config.lockedRatio || false;
		if (config.projectionMode === 0) {
			component.camera.setFrustumPerspective(config.fov, config.aspect || 1, config.near, config.far);
		} else {
			var size = config.size;
			component.camera.setFrustum(config.near, config.far, -size, size, size, -size, config.aspect || 1);
			component.camera.size = size;
		}
		return pu.createDummyPromise(component);
	};

	CameraComponentHandler.prototype.remove = function(entity) {
		// This removes the camera entity,
		// but there is still a visible view that isn't updated.
		// Perhaps change the engine so it draws just black if
		// there is no camera?
		/*jshint eqeqeq: false, -W041*/

		/*if (entity != null && entity.cameraComponent != null && entity.cameraComponent.camera != null) {
			this.world.removeEntity(entity.cameraComponent.camera);
		}*/
		return ComponentHandler.prototype.remove.call(this, entity);
	};

	return CameraComponentHandler;
});

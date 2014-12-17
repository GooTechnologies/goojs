define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/CameraComponent',
	'goo/renderer/Camera',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function (
	ComponentHandler,
	CameraComponent,
	Camera,
	RSVP,
	pu,
	_
) {
	'use strict';

	/**
	 * For handling loading of camera components
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @private
	 */
	function CameraComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'CameraComponent';
	}

	CameraComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('camera', CameraComponentHandler);
	CameraComponentHandler.prototype.constructor = CameraComponentHandler;

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	CameraComponentHandler.prototype._prepare = function (config) {
		_.defaults(config, {
			near: 1,
			far: 10000,
			projectionMode: 'Perspective',
			aspect: 1,
			lockedRatio: false
		});
		if (config.projectionMode === 'Perspective' && config.fov === undefined) {
			config.fov = 45;
		}
		if (config.projectionMode === 'Parallel' && config.size === undefined) {
			config.size = 100;
		}
		if (config.projectionMode !== 'Perspective' && config.projectionMode !== 'Parallel') {
			config.projectionMode = 'Perspective';
		}
	};

	/**
	 * Create camera component object.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {CameraComponent} the created component object
	 * @private
	 */
	CameraComponentHandler.prototype._create = function () {
		var camera = new Camera(45, 1, 1, 1000);
		var component = new CameraComponent(camera);
		return component;
	};

	// TODO: Handle if cameracomponent is removed and camera is active

	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	CameraComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }
			component.camera.setProjectionMode(Camera[config.projectionMode]);
			component.camera.lockedRatio = false;
			if (config.projectionMode === 'Perspective') {
				component.camera.setFrustumPerspective(config.fov, null, config.near, config.far);
			} else {
				var size = config.size;
				component.camera.setFrustum(config.near, config.far, -size, size, size, -size, null);
				component.camera.size = size;
			}
			return component;
		});
	};

	return CameraComponentHandler;
});

define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/DirectionalLight',
	'goo/math/Vector3',
	'goo/util/rsvp',
	'goo/util/ObjectUtil'
], function (
	ComponentHandler,
	LightComponent,
	PointLight,
	SpotLight,
	DirectionalLight,
	Vector3,
	RSVP,
	ObjectUtil
) {
	'use strict';

	/**
	 * For handling loading of light components
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function LightComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'LightComponent';
	}

	LightComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	LightComponentHandler.prototype.constructor = LightComponentHandler;
	ComponentHandler._registerClass('light', LightComponentHandler);


	//! AT: would be nice to have a FuncUtil.memoize()
	var cachedSupportsShadows;
	var supportsShadows = function () {
		if (cachedSupportsShadows === undefined) {
			var isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
			cachedSupportsShadows = !isIos;
		}
		return cachedSupportsShadows;
	};


	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @private
	 */
	LightComponentHandler.prototype._prepare = function (config) {
		ObjectUtil.defaults(config, {
			direction: [0, 0, 0],
			color: [1, 1, 1],
			shadowCaster: false,
			lightCookie: null
		});

		if (config.type !== 'DirectionalLight') {
			config.range = (config.range !== undefined) ? config.range : 1000;
		}

		if (config.shadowCaster && supportsShadows()) {
			config.shadowSettings = config.shadowSettings || {};
			ObjectUtil.defaults(config.shadowSettings, {
				shadowType: 'Basic',
				near: 1,
				far: 1000,
				resolution: [512, 512],
				darkness: 0.5
			});

			var settings = config.shadowSettings;

			if (settings.projection === 'Parallel') {
				settings.size = (settings.size !== undefined) ? settings.size : 400;
			} else {
				settings.fov = (settings.fov !== undefined) ? settings.fov : 55;
			}
		}
	};

	/**
	 * Create light component object based on the config.
	 * @returns {LightComponent} the created component object
	 * @private
	 */
	LightComponentHandler.prototype._create = function () {
		return new LightComponent();
	};

	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	LightComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		var Light = {
			SpotLight: SpotLight,
			DirectionalLight: DirectionalLight,
			PointLight: PointLight
		};

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }
			var light = component.light;
			if(!light || Light[config.type] !== light.constructor) {
				light = new Light[config.type]();
				component.light = light;
			}

			for (var key in config) {
				var value = config[key];
				if (light.hasOwnProperty(key)) {
					if (key === 'shadowSettings') {
						for (var key in value) {
							var shadowVal = value[key];
							if (light.shadowSettings[key] instanceof Vector3) {
								light.shadowSettings[key].setDirect(shadowVal[0], shadowVal[1], shadowVal[2]);
							} else {
								light.shadowSettings[key] = ObjectUtil.clone(shadowVal);
							}
						}
					} else if (light[key] instanceof Vector3) {
						light[key].set(value[0], value[1], value[2]);
					} else {
						light[key] = ObjectUtil.clone(value);
					}
				}
			}

			if (config.type === 'PointLight' || !supportsShadows()) {
				light.shadowCaster = false;
			}

			if (config.lightCookie && config.type !== 'PointLight') {
				var textureObj = config.lightCookie;

				if (!textureObj || !textureObj.textureRef || textureObj.enabled === false) {
					light.lightCookie = null;
					return component;
				} else {
					return that._load(textureObj.textureRef, options).then(function (texture) {
						light.lightCookie = texture;
						return component;
					});
				}
			} else {
				light.lightCookie = null;
				return component;
			}
		});
	};

	return LightComponentHandler;
});

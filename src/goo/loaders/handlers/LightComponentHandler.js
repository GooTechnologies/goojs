define(['goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/DirectionalLight',
	'goo/math/Vector',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	LightComponent,
	PointLight,
	SpotLight,
	DirectionalLight,
	Vector,
	RSVP,
	pu,
	_
) {
	"use strict";

	/**
	* @class
	*/
	function LightComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	LightComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	LightComponentHandler.prototype.constructor = LightComponentHandler;
	ComponentHandler._registerClass('light', LightComponentHandler);

	LightComponentHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			direction: [0, 0, 0],
			color: [1, 1, 1, 1],
			attenuate: true,
			shadowCaster: false,
			lightCookie: null
		});
		if (config.type !== 'DirectionalLight') {
			config.range = (config.range !== undefined) ? config.range : 1000;
		}
		if (config.shadowCaster) {
			config.shadowSettings = config.shadowSettings || {};
			_.defaults(config.shadowSettings, {
				type: 'Blur',
				projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
				fov: 55,
				size: 400,
				near: 1,
				/** @type {number} */
				far: 1000,
				resolution: [512, 512],
				upVector: [0,1,0],
				darkness: 0.5
			});
		}
	};

	LightComponentHandler.prototype._create = function(entity, config) {
		var light;
		switch(config.type) {
			case 'SpotLight':
				light = new SpotLight();
				break;
			case 'DirectionalLight':
				light = new DirectionalLight();
				break;
			default:
				light = new PointLight();
		}
		var component = new LightComponent(light);
		entity.setComponent(component);
		return component;
	};

	LightComponentHandler.prototype.update = function(entity, config) {
		//var component, key, light, value;
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		var light = component.light;
		for (var key in config) {
			var value = config[key];
			if (light.hasOwnProperty(key)) {
				if (key === 'shadowSettings') {
					for (var key in value) {
						var shadowVal = value[key];
						if (light.shadowSettings[key] instanceof Vector) {
							light.shadowSettings[key].set(shadowVal);
						} else {
							light.shadowSettings[key] = _.clone(shadowVal);
						}
					}
				}
				else if (light[key] instanceof Vector) {
					light[key].set(value);
				} else {
					light[key] = _.clone(value);
				}
			}
		}

		var that = this;
		var updateTexture = function(textureType, textureRef) {
			return that.getConfig(textureRef).then(function(textureConfig) {
				return that.updateObject(textureRef, textureConfig, that.options).then(function(texture) {
					return {
						type: textureType,
						ref: textureRef,
						texture: texture
					};
				});
			});
		};

		if (config.lightCookie) {
			var promise;
			var textureRef = config.lightCookie;
			if (typeof textureRef === 'string') {
				promise = updateTexture('cookie', textureRef);
			} else if (textureRef && textureRef.enabled) {
				promise = updateTexture('cookie', textureRef.textureRef);
			}

			if (promise) {
				promise.then(function(texture) {
					if (texture.texture) {
						light.lightCookie = texture.texture;
					} else {
						light.lightCookie = null;
					}
				}).then(null, function(err) {
					console.error("Error loading texture: " + err);
				});
			}
		}

		return pu.createDummyPromise(component);
	};

	return LightComponentHandler;
});

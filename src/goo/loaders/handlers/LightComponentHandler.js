define(['goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/math/Vector',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	LightComponent,
	PointLight,
	Vector,
	RSVP,
	pu,
	_
) {
	function LightComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	LightComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('light', LightComponentHandler);

	LightComponentHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			direction: [0, 0, 0],
			color: [1, 1, 1, 1],
			attenuate: true,
			shadowCaster: false
		});
		if (config.shadowCaster) {
			_.defaults(config.shadowSettings, {
				type: 'Blur'
			});
		}
	};

	LightComponentHandler.prototype._create = function(entity, config) {
		var component = new LightComponent(new PointLight());
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
				if (light[key] instanceof Vector) {
					light[key].set(value);
				} else {
					light[key] = _.clone(value);
				}
			}
		}
		return pu.createDummyPromise(component);
	};

	return LightComponentHandler;
});

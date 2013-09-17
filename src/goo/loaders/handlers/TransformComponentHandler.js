define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/TransformComponent',
	'goo/math/MathUtils',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	TransformComponent,
	MathUtils,
	RSVP,
	pu,
	_
) {
	/*jshint eqeqeq: false, -W041 */
	function TransformComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	TransformComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TransformComponentHandler.prototype.constructor = TransformComponentHandler;
	ComponentHandler._registerClass('transform', TransformComponentHandler);

	TransformComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
			translation: [0, 0, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1]
		});
	};

	TransformComponentHandler.prototype._create = function(entity/*, config*/) {
		var component = new TransformComponent();
		entity.setComponent(component);
		return component;
	};

	TransformComponentHandler.prototype.update = function(entity, config) {
		var that = this;
		var component = ComponentHandler.prototype.update.call(this, entity, config);

		component.transform.translation.set(config.translation);
		if (config.rotation.length === 3) {
			component.transform.setRotationXYZ(
				MathUtils.radFromDeg(config.rotation[0]),
				MathUtils.radFromDeg(config.rotation[1]),
				MathUtils.radFromDeg(config.rotation[2]));
		} else if (config.rotation.length === 4) {
			new Quaternion(config.rotation).toRotationMatrix(component.transform.rotation);
		} else {
			component.transform.rotation.set(config.rotation);
		}
		component.transform.scale.set(config.scale);

		if (config.parentRef != null) {
			this.getConfig(config.parentRef).then(function(parentConfig) {
				return that.updateObject(config.parentRef, parentConfig, that.options).then(function(parent) {
					if (parent != null) {
						var componentParent = component.parent;
						if(componentParent == null || componentParent.entity !== parent) {
							return parent.transformComponent.attachChild(component);
						}
					} else {
						return console.warn("Could not find parent with ref " + config.parentRef);
					}
				});
			});
		}

		component.setUpdated();

		return pu.createDummyPromise(component);
	};

	TransformComponentHandler.prototype.remove = function(entity) {
		var component = entity.transformComponent;
		component.transform.translation.set(0, 0, 0);
		component.transform.setRotationXYZ(0, 0, 0);
		component.transform.scale.set(1, 1, 1);
		component.setUpdated();
	};

	return TransformComponentHandler;

});

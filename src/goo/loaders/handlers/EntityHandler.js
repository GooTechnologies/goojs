define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/Entity',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	ComponentHandler,
	Entity,
	RSVP,
	pu,
	_
) {
	function EntityHandler() {
		ConfigHandler.apply(this, arguments);
	}

	EntityHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('entity', EntityHandler);

	EntityHandler.prototype._prepare = function(config) {};

	EntityHandler.prototype._create = function(ref) {
		var object = this.world.createEntity(ref);
		object.ref = ref;
		return object;
	};

	EntityHandler.prototype.update = function(ref, config) {
		function equalityFilter(entity) {
			return entity.ref === ref;
		}

		var object = this.world.entityManager.getEntityByName(ref);
		if(object == null) {
			var filtered = this.world._addedEntities.filter(equalityFilter);
			if(filtered != null) {
				object = filtered[0];
			}
		}
		if(object == null) {
			object = this._create(ref);
		}

		var promises = [];
		for (var componentName in config.components) {
			var componentConfig = config.components[componentName];
			var handlerClass = ComponentHandler.getHandler(componentName);
			if (handlerClass) {
				if (this._componentHandlers == null) {
					this._componentHandlers = {};
				}
				var handler = this._componentHandlers[componentName];
				if (handler) {
					_.extend(handler, {
						world: this._world,
						getConfig: this.getConfig,
						updateObject: this.updateObject,
						options: _.clone(this.options)
					});
				} else {
					handler = this._componentHandlers[componentName] = new handlerClass(
						this.world,
						this.getConfig,
						this.updateObject,
						this.options
					);
				}
				var promise = handler.update(object, componentConfig);
				if (promise == null || promise.then == null) {
					console.error("Handler for " + componentName + " did not return promise");
				} else {
					promises.push(promise);
				}
			} else {
				console.warn("No componentHandler for " + componentName);
			}
		}
		if (promises.length) {
			return RSVP.all(promises).then(function(components) {
				return object;
			});
		} else {
			console.error("No promises in " + ref + " ", config);
			return pu.createDummyPromise(object);
		}
	};

	EntityHandler.prototype.remove = function(ref) {
		var entity = this.world.entityManager.getEntityByName(ref);
		this.world.removeEntity(entity);
	};

	return EntityHandler;
});

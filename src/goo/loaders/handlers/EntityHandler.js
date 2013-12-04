define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/entities/EntityUtils'
], function(
	ConfigHandler,
	ComponentHandler,
	RSVP,
	pu,
	_,
	EntityUtils
) {
	"use strict";

	function EntityHandler() {
		ConfigHandler.apply(this, arguments);
	}

	EntityHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('entity', EntityHandler);

	EntityHandler.prototype._prepare = function(/*config*/) {};

	EntityHandler.prototype._create = function(ref) {
		var object = this.world.createEntity(ref);
		object.ref = ref;
		return object;
	};

	EntityHandler.prototype.update = function(ref, config, options) {
		function equalityFilter(entity) {
			return entity.ref === ref;
		}

		var object = this.world.entityManager.getEntityByName(ref);
		if(!object) {
			var filtered = this.world._addedEntities.filter(equalityFilter);
			if(filtered) {
				object = filtered[0];
			}
		}
		if(!object) {
			object = this._create(ref);
		}

		var promises = [];
		// Adding components to the object
		for (var componentName in config.components) {
			var componentConfig = config.components[componentName];
			var handlerClass = ComponentHandler.getHandler(componentName);
			if (handlerClass) {
				if (!this._componentHandlers) {
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
					/*jshint -W055*/
					handler = this._componentHandlers[componentName] = new handlerClass(
						this.world,
						this.getConfig,
						this.updateObject,
						this.options
					);
				}
				var promise = handler.update(object, componentConfig, options);
				if (!promise || !promise.then) {
					console.error("Handler for " + componentName + " did not return promise");
				} else {
					promises.push(promise);
				}
			} else {
				console.warn("No componentHandler for " + componentName);
			}
		}

		// REVIEW : The move of this block to here is because the transformcomponent has all the children connections?
		// And those ones are only created after doing all those promise stuff above? Plus that the renderComponent has to be there also I guess.

		// hide/unhide entities and their descendants
		if (!!config.hidden) {
			EntityUtils.hide(object);
		} else {
			EntityUtils.show(object);
		}

		if (promises.length) {
			return RSVP.all(promises).then(function(/*components*/) {
				return object;
			});
		} else {
			console.error("No promises in " + ref + " ", config);
			return pu.createDummyPromise(object);
		}
	};

	EntityHandler.prototype.remove = function(ref) {
		var entity = this.world.entityManager.getEntityByName(ref);
		if (typeof entity === 'object') {
			this.world.removeEntity(entity);
		}
	};

	return EntityHandler;
});

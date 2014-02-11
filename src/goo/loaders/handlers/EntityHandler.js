define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/rsvp',
	'goo/util/StringUtil',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	ConfigHandler,
	ComponentHandler,
	RSVP,
	StringUtil,
	PromiseUtil,
	_,
	EntityUtils
) {
	"use strict";

	/**
	* @class
	* @private
	*/
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

	EntityHandler.prototype._getHandler = function(componentName) {
		if (!this._componentHandlers) {
			this._componentHandlers = {};
		}
		if (!this._componentHandlers[componentName]) {
			var handlerClass = ComponentHandler.getHandler(componentName);
			if (handlerClass) {
				/*jshint -W055*/
				this._componentHandlers[componentName] = new handlerClass(
					this.world,
					this.getConfig,
					this.updateObject,
					this.options
				);
			}
		}
		return this._componentHandlers[componentName];
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
			var handler = this._getHandler(componentName);
			if (handler) {
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
		// Remove components
		object._components.forEach(function(component) {
			var type = component.type;
			type = type.slice(0, type.lastIndexOf('Component'));
			type = StringUtil.uncapitalize(type);
			if (type === 'howler') {
				type = 'sound'; // Discrepancy for some reason
			}
			if (!config.components[type]) {
				handler = this._getHandler(type);
				if(handler) {
					handler.remove(object, options);
				} else {
					console.warn("No componentHandler for " + type);
				}
			}
		}.bind(this));

		if (promises.length) {
			return PromiseUtil.optimisticAll(promises).then(function(/*components*/) {
				if (!!config.hidden) {
					EntityUtils.hide(object);
				} else {
					EntityUtils.show(object);
				}
				return object;
			});
		} else {
			console.error("No promises in " + ref + " ", config);
			return PromiseUtil.createDummyPromise(object);
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

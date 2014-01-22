define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/rsvp',
	'goo/util/StringUtil',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/entities/EntityUtils'
], /* @lends */ function(
	ConfigHandler,
	ComponentHandler,
	RSVP,
	StringUtil,
	PromiseUtil,
	_,
	EntityUtils
) {
	"use strict";

	/*
	 * @class Handler for loading entities into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function EntityHandler() {
		ConfigHandler.apply(this, arguments);
		this._componentHandlers = {};
	}

	EntityHandler.prototype = Object.create(ConfigHandler.prototype);
	EntityHandler.prototype.constructor = EntityHandler;
	ConfigHandler._registerClass('entity', EntityHandler);

	/*
	 * Creates an empty entity
	 * @param {string} ref will be the entity's id
	 * @returns {Entity}
	 * @private
	 */
	EntityHandler.prototype._create = function() {
		return this.world.createEntity();
	};

	/*
	 * Removes an entity
	 * @param {ref}
	 * @private
	 */
	EntityHandler.prototype._remove = function(ref) {
		var entity = this._objects[ref];
		if (entity) {
			entity.removeFromWorld();
			delete this._objects[ref];
		}
	};

	/*
	 * Adds/updates/removes an entity
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated entity or null if removed
	 */
	EntityHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(entity) {
			if (!entity) { return; }
			entity.id = ref;
			var promises = [];

			// Adding/updating components
			for (var type in config.components) {
				var p = that._updateComponent(entity, type, config.components[type], options);
				if (p) { promises.push(p); }
				else { console.error("Error handling component " + name); }
			}

			// Removing components
			var components = entity._components;
			for(var i = 0; i < components.length; i++) {
				var type = that._getComponentType(components[i]);
				if (!config.components[type]) {
					that._updateComponent(entity, type, null, options);
				}
			}
			// When all is done, hide or show and return
			return PromiseUtil.optimisticAll(promises).then(function(/*components*/) {
				if (config.hidden) {
					EntityUtils.hide(entity);
				} else {
					EntityUtils.show(entity);
				}
				return entity;
			});
		});
	};

	/*
	 * Adds/updates/removes a component on an entity
	 * @param {Entity} entity
	 * @param {string} type
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with updated entity
	 * @private
	 */
	EntityHandler.prototype._updateComponent = function(entity, type, config, options) {
		var handler = this._getHandler(type);
		if (!handler) { return null; }

		var p = handler.update(entity, config, options);
		if (!p || !p.then) { return null; }

		return p;
	};

	/*
	 * Get the type for the component. Needed to match engine components against data model
	 * component types.
	 * @param {Component} component
	 * @returns {string} 
	 * @private
	 */
	EntityHandler.prototype._getComponentType = function(component) {
		var type = component.type;
		type = type.slice(0, type.lastIndexOf('Component'));
		type = StringUtil.uncapitalize(type);
		if (type === 'howler') { type = 'sound'; } // HowlerComponent should be renamed
		return type;
	};

	/*
	 * Gets the handler for a component type or creates a new one if necessary
	 * @param {string} type
	 * @returns {ComponentHandler}
	 */
	EntityHandler.prototype._getHandler = function(type) {
		if (!this._componentHandlers[type]) {
			var Handler = ComponentHandler.getHandler(type);
			if (Handler) {
				this._componentHandlers[type] = new Handler(
					this.world,
					this.getConfig,
					this.updateObject,
					this.options
				);
			}
		}
		return this._componentHandlers[type];
	};

	return EntityHandler;
});

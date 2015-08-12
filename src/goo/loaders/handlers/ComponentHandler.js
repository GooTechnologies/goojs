define([
	'goo/util/PromiseUtils'
], function (
	PromiseUtils
) {
	'use strict';

	/**
	 * Base class for component handlers. All different types of components that an entity
	 * can have need to have a registered component handler. To handle a new type of component,
	 * create a class that inherits from this class, and override {_prepare}, {_create}, {update} and {remove}
	 * as needed ({update} must be overridden). In your class, call <code>@_register('yourComponentType')</code> to _register
	 * the handler with the loader.
	 *
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {DynamicLoader.update}.
	 * @returns {ComponentHandler}
	 * @hidden
	 */
	function ComponentHandler(world, getConfig, updateObject, loadObject) {
		//! schteppe: this._type seem to be assumed to be set by the subclass. Why not pass it as a parameter to this constructor?
		this.world = world;
		this.getConfig = getConfig;
		this.updateObject = updateObject;
		this.loadObject = loadObject;
	}

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @private
	 */
	ComponentHandler.prototype._prepare = function (/*config*/) {};

	/**
	 * Create engine component object based on the config. Should be overridden in subclasses.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {Component} the created component object
	 * @private
	 * @abstract
	 */
	ComponentHandler.prototype._create = function () {
		throw new Error('ComponentHandler._create is abstract, use ComponentHandler.getHandler(type)');
	};

	/**
	 * Remove engine component object. Should be overridden in subclasses.
	 * @param {Entity} entity The entity from which this component should be removed.
	 * @private
	 */
	ComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent(this._type);
	};

	/**
	 * Loads object for given ref
	 * @param {string} ref
	 * @param {Object} options
	 * @private
	 */
	ComponentHandler.prototype._load = function (ref, options) {
		return this.loadObject(ref, options);
	};

	/**
	 * Update engine component object based on the config. Should be overridden in subclasses.
	 * This method is called by #{EntityHandler} to load new component configs into the engine.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the created component when loading is done.
	 */
	ComponentHandler.prototype.update = function (entity, config/*, options*/) {
		if (!entity) {
			return PromiseUtils.reject('Entity is missing');
		}
		if (!config) {
			this._remove(entity);
			return PromiseUtils.resolve();
		}
		var component = entity.getComponent(this._type);
		if (!component) {
			component = this._create();
			entity.setComponent(component);
		}
		this._prepare(config);

		return PromiseUtils.resolve(component);
	};


	ComponentHandler.handlerClasses = {};

	/**
	 * Get a handler class for the specified type of component. The type can be e.g. 'camera', 'transform', etc.
	 * The type name should not end with "Component".
	 * @param {string} type
	 * @returns {Class} A subclass of {ComponentHandler}, or null if no registered handler for the given type was found.
	 */
	ComponentHandler.getHandler = function (type) {
		return ComponentHandler.handlerClasses[type];
	};

	/**
	 * Register a handler for a component type. Called in the class body of subclasses.
	 * @param {string} type
	 * @param {Class} klass the class to register for this component type
	 */
	ComponentHandler._registerClass = function (type, klass) {
		ComponentHandler.handlerClasses[type] = klass;
	};

	return ComponentHandler;
});

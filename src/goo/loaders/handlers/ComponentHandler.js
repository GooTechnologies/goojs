define( /** @lends */ function() {
	"use strict";

	/**
	 * @class Base class for component handlers. All different types of components that an entity
	 * can have need to have a registered component handler. To handle a new type of component,
	 * create a class that inherits from this class, and override {_prepare}, {_create}, {update} and {remove}
	 * as needed ({update} must be overridden). In your class, call <code>@_register('yourComponentType')</code> to _register
	 * the handler with the loader.
	 *
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {DynamicLoader.update}.
	 * @param {object} options
	 * @returns {ComponentHandler}
	 *
	 */
	function ComponentHandler(world, getConfig, updateObject, options) {
		this.world = world;
		this.getConfig = getConfig;
		this.updateObject = updateObject;
		this.options = options;
	}

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 */
	ComponentHandler.prototype._prepare = function(/*config*/) {};

	/**
	 * Create engine component object based on the config. Should be overridden in subclasses.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @returns {Component} the created component object
	 */
	ComponentHandler.prototype._create = function(/*entity, config*/) {
		throw new Error("ComponentHandler._create is abstract, use ComponentHandler.getHandler(type)");
	};

	/*jshint -W099*/
	/**
	 * Update engine component object based on the config. Should be overridden in subclasses.
	 * This method is called by #{EntityHandler} to load new component configs into the engine.
	 * A call to {super()} in your update method will create a new component object if needed.
	 * Note this (somewhat inconsistent) difference: {ComponentHandler.update} returns the
	 * updated component, whereas {MyHandler.update} should return a promise.
	 *
	 * @example
	 * class MyComponentHandler
	 @_register('my')
	 * ...
	 * 	update: (entity, config)->
	 * 		component = super(entity, config)
	 *
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @returns {RSVP.Promise} promise that resolves with the created component when loading is done.
	 */
	// REVIEW if component exists, doesn't return promise, but component
	// also, if component is null, still tries to create component on null entity
	// will probably cause an error
	ComponentHandler.prototype.update = function(entity, config) {
		this._prepare(config);
		var object;
		
		// REVIEW: I would prefer ===
		// ANSWER: entity !== null && entity !== undefined is unseemly
		if(entity == null || entity[this.constructor._type + "Component"] == null) {
			object = this._create(entity, config);
		} else {
			object = entity[this.constructor._type + "Component"];
		}

		return object;
	};

	/**
	 * Remove the component that is handled by this handler from the given entity.
	 * @param {Entity} entity The entity from which the component should be removed
	 */
	// REVIEW should it fails silently if entity is null?
	ComponentHandler.prototype.remove = function(entity) {
		// REVIEW: I would prefer !==
		// ANSWER: entity !== null && entity !== undefined is unseemly
		if(entity != null) {
			entity.clearComponent(this.constructor._type + "Component");
		}
		return entity;
	};

	ComponentHandler.handlerClasses = {};

	/**
	 * Get a handler class for the specified type of component. The type can be e.g. 'camera', 'transform', etc.
	 * The type name should not end with "Component".
	 * @param {string} type
	 * @returns {Class} A subclass of {ComponentHandler}, or null if no registered handler for the given type was found.
	 */
	ComponentHandler.getHandler = function(type) {
		return ComponentHandler.handlerClasses[type];
	};

	/**
	 * Register a handler for a component type. Called in the class body of subclasses.
	 * @param {string} type
	 * @param {Class} klass the class to register for this component type
	 */
	ComponentHandler._registerClass = function(type, klass) {
		klass._type = type;
		ComponentHandler.handlerClasses[type] = klass;
	};

	return ComponentHandler;

});

define(function() {
	/**
	 * @class Base class for resource handlers, used to load all types of resources into the engine.
	 * All the resource types in the bundle (noted by their extension) needs to have a registered config
	 * handler.
	 * To handle a new type of component, create a class that inherits from this class, and override {update}.
	 * In your class, call <code>@_register('yourResourceExtension')</code> to _register
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
	function ConfigHandler(world, getConfig, updateObject, options) {
		this.world = world;
		this.getConfig = getConfig;
		this.updateObject = updateObject;
		this.options = options;
	}

	/**
	 * Update engine object based on the config. Should be overridden in subclasses.
	 * This method is called by #{DynamicLoader} to load new resources into the engine.
	 *
	 * @example
	 * class MyResourceHandler
	 *		@_register('myResource')
	 * ...
	 * 	update: (entity, config)->
	 * 		component = super(entity, config)
	 *
	 * @param {string} ref The ref of this config
	 * @param {object} config
	 * @returns {RSVP.Promise} promise that resolves with the created object when loading is done.
	 */
	ConfigHandler.prototype.update = function(ref, config) {};

	ConfigHandler.handlerClasses = {};

	/**
	 * Get a handler class for the specified type of resource. The resource can be e.g. 'texture', 'mesh', etc.
	 * @param {string} type
	 * @returns {Class} A subclass of {ConfigHandler}, or null if no registered handler for the given type was found.
	 */
	ConfigHandler.getHandler = function(type) {
		return this.handlerClasses[type];
	};

	/**
	 * Register a handler for a component type. Called in the class body of subclasses.
	 * @param {string} type
	 */
	ConfigHandler._register = function(type) {
		this._type = type;
		return ConfigHandler.handlerClasses[type] = this;
	};

	ConfigHandler._registerClass = function(type, klass) {
		this._type = type;
		return ConfigHandler.handlerClasses[type] = klass;
	};

	return ConfigHandler;
});

define([
	'goo/util/rsvp',
	'goo/util/PromiseUtils'
], function (
	RSVP,
	PromiseUtils
) {
	'use strict';

	/**
	 * Base class for resource handlers, used to load all types of resources into the engine.
	 * All the resource types in the bundle (noted by their extension) need to have a registered config
	 * handler.
	 * To handle a new type of component, create a class that inherits from this class, and override {update}.
	 * In your class, call <code>@_register('yourResourceExtension')</code> to _register
	 * the handler with the loader.
	 *
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {DynamicLoader.update}.
	 * @hidden
	 */
	function ConfigHandler(world, getConfig, updateObject, loadObject) {
		this.world = world;
		this.getConfig = getConfig;
		this.updateObject = updateObject;
		this.loadObject = loadObject;
		this._objects = new Map();
		this._loading = new Map();
	}

	/**
	 * Method for creating empty engine object for ref. Should be overwritten in subclasses.
	 * @returns {Object} the newly created Entity, Material or other engine object
	 * @private
	 */
	ConfigHandler.prototype._create = function () {
		return {};
	};

	/**
	 * Remove the engine object denoted by the given ref. Should be overridden in subclasses.
	 * This method is called by #{DynamicLoader} to remove resources from the engine.
	 * Synchronous, returns nothing.
	 * @param {string} ref
	 * @private
	 */
	ConfigHandler.prototype._remove = function (ref) {
		this._objects.delete(ref);
	};

	/**
	 * Preparing config by populating it with defaults. Should be overwritten in subclasses.
	 * @param {Object} config
	 * @private
	 */
	ConfigHandler.prototype._prepare = function (config) {};

	/**
	 * Loads object for given ref
	 * @param {string} ref
	 * @param {Object} options
	 * @private
	 */
	ConfigHandler.prototype._load = function (ref, options) {
		return this.loadObject(ref, options);
	};

	ConfigHandler.prototype.load = function (ref, options) {
		var type = ref.substr(ref.lastIndexOf('.') + 1);
		if (type !== this.constructor._type) {
			throw new Error('Trying to load type' + type + ' with handler for ' + this._type);
		}

		if (this._loading.has(ref) && !options.instantiate) {
			return this._loading.get(ref);
		} else if (this._objects.has(ref) && !options.reload) {
			return PromiseUtils.resolve(this._objects.get(ref));
		} else {
			var promise = this.getConfig(ref, options).then(function (config) {
				return this.update(ref, config, options);
			}.bind(this))
			.then(function (object) {
				this._loading.delete(ref);
				return object;
			}.bind(this))
			.then(null, function (err) {
				this._loading.delete(ref);
				throw err;
			}.bind(this));

			return promise;
		}
	};

	ConfigHandler.prototype.clear = function () {
		var promises = [];
		this._objects.forEach(function (value, ref) {
			promises.push(this.update(ref, null, {}));
		}.bind(this));

		this._objects.clear();
		this._loading.clear();

		return RSVP.all(promises);
	};

	/**
	 * Update engine object based on the config. Should be overridden in subclasses.
	 * This method is called by #{DynamicLoader} to load new resources into the engine.
	 *
	 * @param {string} ref The ref of this config
	 * @param {Object} config
	 * @returns {RSVP.Promise} promise that resolves with the created object when loading is done.
	 */
	ConfigHandler.prototype.update = function (ref, config, options) {
		var promise = this._update(ref, config, options).then(function (object) {
			this._loading.delete(ref);
			return object;
		}.bind(this));

		this._loading.set(ref, promise);

		return promise;
	};


	ConfigHandler.prototype._update = function (ref, config, options) {
		if (!config) {
			this._remove(ref, options);
			return PromiseUtils.resolve();
		}
		if (!this._objects.has(ref) || options.instantiate) {
			this._objects.set(ref, this._create());
		}
		this._prepare(config);
		return PromiseUtils.resolve(this._objects.get(ref));
	};

	ConfigHandler.handlerClasses = {};

	/**
	 * Get a handler class for the specified type of resource. The resource can be e.g. 'texture', 'mesh', etc.
	 * @param {string} type
	 * @returns {Class} A subclass of {ConfigHandler}, or null if no registered handler for the given type was found.
	 */
	ConfigHandler.getHandler = function (type) {
		return ConfigHandler.handlerClasses[type];
	};

	/**
	 * Register a handler for a component type. Called in the class body of subclasses.
	 * @param {string} type
	 * @param {Class} klass the class to register for this component type
	 */
	ConfigHandler._registerClass = function (type, klass) {
		klass._type = type;
		return ConfigHandler.handlerClasses[type] = klass;
	};

	return ConfigHandler;
});
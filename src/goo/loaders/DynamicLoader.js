define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/Ajax',
	'goo/renderer/TextureCreator',
	'goo/util/rsvp',
	'goo/util/StringUtil',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/loaders/handlers/CameraComponentHandler',
	'goo/loaders/handlers/EntityHandler',
	'goo/loaders/handlers/LightComponentHandler',
//	'goo/loaders/handlers/LogicComponentHandler',
	'goo/loaders/handlers/MaterialHandler',
	'goo/loaders/handlers/MeshDataComponentHandler',
	'goo/loaders/handlers/MeshDataHandler',
	'goo/loaders/handlers/MeshRendererComponentHandler',
	'goo/loaders/handlers/SceneHandler',
	'goo/loaders/handlers/ShaderHandler',
	'goo/loaders/handlers/SkeletonHandler',
	'goo/loaders/handlers/TextureHandler',
	'goo/loaders/handlers/TransformComponentHandler',
	'goo/loaders/handlers/AnimationComponentHandler',
	'goo/loaders/handlers/AnimationStateHandler',
	'goo/loaders/handlers/AnimationLayersHandler',
	'goo/loaders/handlers/AnimationClipHandler',
	'goo/loaders/handlers/ProjectHandler',
	'goo/loaders/handlers/ScriptComponentHandler',
	'goo/loaders/handlers/ScriptHandler',
	//'goo/loaders/handlers/StateMachineComponentHandler',
	//'goo/loaders/handlers/MachineHandler',
	'goo/loaders/handlers/SoundComponentHandler',
	'goo/loaders/handlers/SoundHandler',
	'goo/loaders/handlers/PosteffectsHandler',
	'goo/loaders/handlers/EnvironmentHandler',
	'goo/loaders/handlers/SkyboxHandler'
],
/** @lends */
function(
	ConfigHandler,
	ComponentHandler,
	Ajax,
	TextureCreator,
	RSVP,
	StringUtil,
	PromiseUtil,
	_
) {
	/*jshint eqeqeq: false, -W041, -W099 */
	'use strict';

	/**
	 * @class Class to load objects into the engine, or to update objects based on the data model.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {World} parameters.world The target World object.
	 * @param {string} parameters.rootPath The root path from where to get resources.
	 * @param {Ajax} [parameters.ajax=new Ajax(parameters.rootPath)].
	 * Here you can overwrite how the loader fetches refs. Good for testing.
	 */
	function DynamicLoader(options) {
		if(options.world) {
			this._world = options.world;
		} else {
			throw new Error("World argument cannot be null");
		}
		if (options.ajax) {
			this._ajax = options.ajax;
		}
		else if (options.rootPath) {
			this._ajax = new Ajax(options.rootPath);
		} else {
			throw new Error("ajax or rootPath must be defined");
		}

		// Will hold the engine objects
		this._objects = {};
		// Will hold instances of handler classes by type
		this._handlers = {};
	}

	/**
	 * Load configs into the loader cache without loading anything into the engine.
	 * Subsequent calls to load and update will draw
	 * configs from the prefilled cache.
	 *
	 * @param {object} configs Configs object. Keys should be refs, and values are the config objects. If {configs} is null,
	 * 	the loader will search for the appropriate config in the loader's internal cache.
	 * @param {boolean} [clear=false] If true, possible previous cache will be cleared. Otherwise the existing cache is extended.
	 *
	 **/
	 DynamicLoader.prototype.preload = function(bundle, clear) {
		this._ajax.prefill(bundle, clear);
	};

	/*
	 * Clears the cache of the Dynamic Loader. Also clears the engine
	 */
	DynamicLoader.prototype.clear = function() {
		var refs = Object.keys(this._objects);
		this._objects = {};
		// Remove all objects from engine
		for(var i = 0; i < refs.length; i++) {
			this._handle(refs[i], null);
		}
	};

	/**
	 * Load an object with the specified path into the engine. The object can be of any
	 * type, what loading does is determined by the ref type and the
	 * registered {@link ConfigHandler}
	 *
	 * @param {string} ref Ref of object to load
	 * @param {object} options {@see DynamicLoader.update}
	 * @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object
	 * mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
	 */
	DynamicLoader.prototype.load = function(ref, options) {
		var that = this;
		function load() {
			return that._loadRef(ref, options).then(function(config) {
				return that._handle(ref, config, options);
			});
		}
		options = options || {};
		if (options.preloadBinaries === true) {
			return this._loadBinariesFromRefs(ref, options).then(load);
		} else {
			return load();
		}
	};

	/*
	 * Recursively traverses all configs and preloads the binary files referenced.
	 * @param {object} references one-level object of references, like in datamodel
	 * @param {object} options See {DynamicLoader.load}
	 * @returns {RSVP.Promise} Promise resolving when the binary files are loaded.
	 * @private
	 */
	DynamicLoader.prototype._loadBinariesFromRefs = function(references, options) {
		var that = this;
		function loadBinaryRefs(refs) {
			var handled = 0;

			// Load the binary and increase progress tick on finished loading
			function load(ref) {
				return that._loadRef(ref, options).then(function() {
					handled++;
					if (options.progressCallback instanceof Function) {
						options.progressCallback(handled, refs.length);
					}
				});
			}

			// When all binary refs are loaded, we're done
			return RSVP.all(refs.map(function(ref) { return load(ref); }));
		}

		function traverse(refs) {
			var binaryRefs = [];
			var jsonRefs = [];
			var promises = [];

			// Loads config for traversal
			function loadFn(ref) {
				promises.push(that._loadRef(ref, options).then(traverseFn));
			}

			// Looks through config for binaries
			function traverseFn(config) {
				var refs = that._getRefsFromConfig(config);

				for (var i = 0, keys = Object.keys(refs), len = refs.length; i < len; i++) {
					var ref = refs[keys[i]];
					if (DynamicLoader._isRefTypeInGroup(ref, 'asset') && binaryRefs.indexOf(ref) === -1) {
						// If it's a binary ref, store it in the list
						binaryRefs.push(ref);
					} else if (DynamicLoader._isRefTypeInGroup(ref, 'json') && jsonRefs.indexOf(ref) === -1) {
						// If it's a json-config, look deeper
						loadFn(ref);
					}
				}
			}

			traverseFn({ collectionRefs: refs });
			// Resolved when everything is loaded and traversed
			return RSVP.all(promises).then(function() { return binaryRefs; } );
		}

		return traverse(references).then(loadBinaryRefs);
	};

	/**
	 * Update an object in the world with an updated config. The object can be of any
	 * type, updating behavior is determined by the registered {ConfigHandler}
	 *
	 * @param {string} ref Ref of object to update
	 * @param {object} [config] New configuration (formatted according to data model).
	 * If omitted, works the same as {DynamicLoader.load}.
	 * @param {object} options
	 * @param {function(object)} [options.beforeAdd] Function called before updating the world with the loaded objects. Takes
	 * 	each object as argument and if it returns true, it is added to the world.
	 * @param {boolean} [options.noCache] Ignore cache, i.e. always load files fresh from the server. Defaults to false.
	 * @param {boolean} [options.recursive] Recursively load resources referenced from the given config. Defaults to true.
	 * @returns {RSVP.Promise} The promise is resolved when the object is updated, with the config data as argument.
	 */
	DynamicLoader.prototype.update = function(ref, config, options) {
		var that = this;
		options = options || {};

		return this._ajax.update(ref, config).then(function(config) {
			return that._handle(ref, config, options);
		})
		// Return all the configs
		.then(function(object) {
			return object;
		})
		.then(null, function(err) {
			console.error("Error updating " + ref + " " + err);
			throw err;
		});
	};

	/**
	 * Remove an object in the world. The object can be of any
	 * type, updating behavior is determined by the registered {ConfigHandler}
	 *
	 * @param {string} ref Ref of object to update
	 * @returns {RSVP.Promise} The promise is resolved when the object is removed, with no argument
	 */
	DynamicLoader.prototype.remove = function(ref) {
		delete this._objects[ref];
		return this._handle(ref, null);
	};

	/*
	 * Gets cached handler for type or creates a new one
	 * @param {string} type
	 * @returns {ConfigHandler}
	 * @private
	 */
	DynamicLoader.prototype._getHandler = function(type) {
		var handler = this._handlers[type];
		if (handler) { return handler; }
		var Handler = ConfigHandler.getHandler(type);
		if (Handler) {
			return this._handlers[type] = new Handler(
				this._world,
				this._loadRef.bind(this),
				this._handle.bind(this)
			);
		}
		return null;
	};

	/*
	 * Handles a ref with its loaded config, i e calls the proper config handler
	 * to create or update the object
	 *
	 * @param {string} ref
	 * @param {object} config
	 * @param {object} options
	 * @private
	 */
	DynamicLoader.prototype._handle = function(ref, config, options) {
		var that = this;
		var cachedObject = this._objects[ref];
		if (cachedObject && cachedObject.then && !cachedObject.isRejected) {
			// Object is in the process of being handled already
			return this._objects[ref];
		} else {
			var type = DynamicLoader.getTypeForRef(ref);

			if (DynamicLoader._isRefTypeInGroup(ref, 'bundle')) {
				// Do nothing
				return PromiseUtil.createDummyPromise();
			}

			var handler = this._getHandler(type);
			if (!handler) {
				console.warn("No handler for type " + type);
				return PromiseUtil.createDummyPromise(config);
			}

			if (!config) {
				// Remove object
				handler.remove(ref);
				return PromiseUtil.createDummyPromise(null);
			}

			// Update object
			this._objects[ref] = handler.update(ref, config, options).then(
				function(object) {
					that._objects[ref] = object;
					return object;
				}
			);
			return this._objects[ref];
		}
	};

	/*
	 * Fetch a file from the server, and parse JSON if needed.
	 *
	 * @param {string} ref Ref of the config to load
	 * @param {boolean} [noCache] If true, ignore cached config and fetch everything from the server
	 * @returns {RSVP.Promise} Promise that resolves with the loaded config
	 * @private
	 */
	DynamicLoader.prototype._loadRef = function(ref, options) {
		return this._ajax.load(ref, (options==null)?false:options.noCache);
	};

	/*
	 * Find all the references in a config, and return in a flat list
	 *
	 * @param {object} config
	 * @returns {string[]} refs
	 */
	DynamicLoader.prototype._getRefsFromConfig = function(config) {
		var refs = [];
		function traverse(key, value) {
			if (/\S+refs?$/i.test(key)) {
				// Refs
				if (value instanceof Object) {
					for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
						if (value[keys[i]]) {
							refs.push(value[keys[i]]);
						}
					}
				} else if (value) {
					// Ref
					refs.push(value);
				}
			} else if (value instanceof Object) {
				// Go down a level
				for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
					if (value.hasOwnProperty(keys[i])) {
						traverse(keys[i], value[keys[i]]);
					}
				}
			}
		}
		traverse("", config);
		return refs;
	};

	/**
	 * Gets the type of ref
	 *
	 * @param {string} ref
	 * @returns {string} type
	 */
	DynamicLoader.getTypeForRef = function(ref) {
		return ref.split('.').pop().toLowerCase();
	};

	/*
	 * Checks if ref has a type included in the group
	 * Different groups are found in the top of the file
	 *
	 * @param {string} ref
	 * @param {string} group
	 * @returns {boolean}
	 */
	DynamicLoader._isRefTypeInGroup = function(ref, group) {
		var type = DynamicLoader.getTypeForRef(ref);
		return type && Ajax.types[group] && _.indexOf(Ajax.types[group], type) >= 0;
	};

	/**
	 * Get the engine object for a given ref from the loader cache. Will return undefined if
	 * not loaded. If you want to be sure it's loaded, use DynamicLoader.load(ref).then instead.
	 *
	 * @param {string} ref Ref of object
	 * @returns {object|undefined} The engine object, e.g. {@link Entity} with the given ref.
	 */
	DynamicLoader.prototype.get = function(ref) {
		return this._objects[ref];
	};


	return DynamicLoader;
});

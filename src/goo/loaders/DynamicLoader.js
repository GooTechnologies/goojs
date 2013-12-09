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
	'goo/loaders/handlers/LogicComponentHandler',
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
	'goo/loaders/handlers/FSMComponentHandler',
	'goo/loaders/handlers/MachineHandler',
	'goo/loaders/handlers/SoundComponentHandler',
	'goo/loaders/handlers/SoundHandler',
	'goo/loaders/handlers/PosteffectHandler',
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
	var _json_types = [
		'shader',
		'script',
		'entity',
		'material',
		'scene',
		'mesh',
		'texture',
		'skeleton',
		'animation',
		'clip',
		'bundle',
		'project',
		'machine',
		'posteffect',
		'animstate',
		'sound'
	];

	//var _text_types = ['vert', 'frag']; // unused
	var _texture_types = _.keys(ConfigHandler.getHandler('texture').loaders);
	var _image_types = ['jpg', 'jpeg', 'png', 'gif'];
	var _binary_types = ['dat', 'bin'];
	var _url_types = ['mp3', 'wav'];
	// REVIEW: Never used
	var _all_binary_types = _texture_types.concat(_image_types).concat(_binary_types).concat(_url_types);
	var _binary_file_properties = ['url', 'binaryRef']; // refs pointing to 'real' binaries, not original filenames etc

	var _ENGINE_SHADER_PREFIX = ConfigHandler.getHandler('material').ENGINE_SHADER_PREFIX;

	/**
	 * @class Class to load scenes into the world, or to update the scene/world based on the data model.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {World} [parameters.world] The target World object.
	 * @param {string} [parameters.rootPath] The root path where to get resources.
	 * @param {boolean} [parameters.ajax] If true, load resources from the server if not found in the cache. Defaults to true.
	 *
	 */
	function DynamicLoader(options) {
		this.options = options;
		this._objects = {};
		_.defaults(this.options, {
			ajax: true
		});
		if(this.options.world) {
			this._world = this.options.world;
		} else {
			throw new Error("World argument cannot be null");
		}
		if (this.options.rootPath) {
			this.setRootPath(this.options.rootPath);
		} else {
			throw new Error("parameters.rootPath must be defined");
		}
		this._configs = {};
		if (this.options.ajax) {
			this._ajax = new Ajax();
		}
	}

	/**
	 * Load configs into the loader cache without loading anything into the engine. Subsequent calls to load and update will draw
	 * configs from the prefilled cache.
	 *
	 * @param {object} configs Configs object. Keys should be refs, and values are the config objects. If {configs} is null,
	 * 	the loader will search for the appropriate config in the loader's internal cache.
	 * @param {boolean} clear If true, possible previous cache will be cleared. Otherwise the existing cache is extended.
	 *
	 */
	DynamicLoader.prototype.preloadCache = function(configs, clear) {
		if (clear == null) {
			clear = false;
		}
		if (clear) {
			return this._configs = configs;
		} else {
			return _.extend(this._configs, configs);
		}
	};

	/**
	 * Load an object with the specified ref from an associative array. Keys should be refs, and values
	 * are the config objects.
	 * The loader cache will be filled with all the resources in the supplied configs, so loading resources
	 * should not involve ajax calls.
	 *
	 * @param {string} ref Ref of object to load
	 * @param {object} configs Configs object. Keys should be refs, and values are the config objects. If {configs} is null,
	 * 	the loader will search for the appropriate config in the loader's internal cache.
	 * @param {object} options See {DynamicLoader.update}
	 * @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object
	 * mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
	 *
	 */
	DynamicLoader.prototype.loadFromConfig = function(ref, configs, options) {
		if (options == null) {
			options = {};
		}
		_.defaults(options, this.options);
		if (configs != null) {
			if (options.noCache) {
				this._configs = configs;
			} else {
				_.extend(this._configs, configs);
			}
		}
		if (this._configs[ref]) {
			throw new Error("" + ref + " not found in the supplied configs Available keys: \n" + (_.keys(this._configs).join('\n')));
		}
		return this.load(ref, options);
	};

	/**
	 * Load an object with the specified ref from a .bundle file. The object can be of any
	 * type, what loading does is determined by the file extension of the ref and the
	 * registered {ConfigHandler}.
	 * The loader cache will be filled with all the resources in the bundle, so loading other
	 * resources from the bundle won't require new AJAX calls.
	 *
	 * @param {string} ref Ref of object to load
	 * @param {string} bundleName name of the bundle (including extension)
	 * @param {object} options See {DynamicLoader.update}
	 * @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object
	 * mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
	 *
	 */
	DynamicLoader.prototype.loadFromBundle = function(ref, bundleName, options) {

		var that = this;
		if (options == null) {
			options = {};
		}
		_.defaults(options, this.options);

		var loadRefPromise = function() {
			return that._loadRef(bundleName).then(function(data) {
				if (options.noCache) {
					that._configs = data;
				} else {
					_.extend(that._configs, data);
				}
				if (that._configs[ref] == null) {
					throw new Error("" + ref + " not found in bundle " + bundleName + ". Available keys: \n" + (_.keys(that._configs).join('\n')));
				}
				return that.load(ref, options);
			});
		};

		// Can currently only preload binaries when loading project.project
		// TODO enable preloading of specific binaries?
		if (options.preloadBinaries && ref == 'project.project') {
			return this._preloadBinaries(bundleName, options).then(loadRefPromise);
		} else {
			return loadRefPromise();
		}
	};

	/**
	 * Load an object with the specified path into the world. The object can be of any
	 * type, what loading does is determined by the file extension of the ref and the
	 * registered {ConfigHandler}
	 *
	 * @param {string} ref Ref of object to load
	 * @param {object} options See {DynamicLoader.update}
	 * @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object
	 * mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
	 *
	 */
	DynamicLoader.prototype.load = function(ref, options) {
		if (options == null) {
			options = {};
		}
		return this.update(ref, null, options);
	};

	DynamicLoader.prototype._preloadBinaries = function (bundleName, options) {
		if (options == null) {
			options = {};
		}
		_.defaults(options, this.options);
		var that = this;

		// Get the flat root.bundle file containing all references
		return this._loadRef(bundleName).then(function(bundleRefs) {

			// REVIEW: dict feels like python, it's a config
			// Also, you're not using it, entityRefs = bundleRefs['project.project']['entityRefs']
			// Get a list of the configs that are currently in the scene
			var projectDict = bundleRefs['project.project'];

			// Array containing the references currently in the scene
			var entityRefs = projectDict.entityRefs;

			// TODO add screenshots if wanted

			var stringInArray = function(str, arr) {
				if (typeof(str) != 'string') {
					return false;
				}
				for (var i=0; i<arr.length; i++) {
					if (str.indexOf(arr[i], str.length - arr[i].length) != -1) {
						return true;
					}
				}
				return false;
			};

			// REVIEW: If you look at the data model, sound actually has an array of urls, which won't
			// be caught in this traverse. Although sounds can't be preloaded yet I guess.
			// I think you should update _getRefsFromConfig to include url(s) and do
			// DynamicLoader.isBinaryRef and so on on the flat array
			// Perhaps even merge the two traverses into one
			// I think it would make the code look cleaner
			/*
			function traverse(config) {
				if (config != undefined) {
					refs = DynamicLoader._getRefsFromConfig(config)
					for (var i = 0; i < refs.length; i++) {
						// If it's not a json, it's a binary, sort of
						if (DynamicLoader.isJSONRef(refs[i]) traverse(bundleRefs[refs[i]]);
						else loadRef(refs[i]);
					}
				}
			}
			traverse(rootConfig);
			*/

			// Get all child references and binaries within a given reference
			var traverseConfig = function(rootConfig) {
				var childRefs = [];
				var binaries = [];
				var traverse = function(config) {
					for (var property in config) {
						var value = config[property];
						if (stringInArray(property, _binary_file_properties)) {
							// If the property points to a binary, add the value
							binaries.push(value);
						} else if (stringInArray(value, _json_types)) {
							// If JSON (config), add children
							childRefs.push(value);
						} else {
							if (value && typeof(value) == 'object') {
								// If the value is a dictionary, recursively traverse deeper
								traverse(value);
							}
						}
					}
				};
				traverse(rootConfig);
				return {'childRefs': childRefs, 'binaries': binaries};
			};

			// Get all binaries from a reference and its config's children
			var getBinariesFromRef = function(rootRef) {
				var binaries = [];
				var traverse = function(ref) {
					var config = bundleRefs[ref];
					if (config != undefined) {
						// Traverse config, looking for binaries and child references
						var configTraversalResult = traverseConfig(config);
						var childRefs = configTraversalResult.childRefs;
						// Add the found binaries
						binaries = binaries.concat(configTraversalResult.binaries);
						// Traverse the found children
						for (var i=0; i<childRefs.length; i++) {
							if (childRefs[i] != ref) {
								traverse(childRefs[i]);
							}
						}
					}
				};
				traverse(rootRef);
				return binaries;
			};

			var binaries = [];
			for (var i=0; i<entityRefs.length; i++) {
				binaries = binaries.concat(getBinariesFromRef(entityRefs[i]));
			}

			var loadPromises = [];
			var handled = 0;
			var loadRef = function(ref) {
				loadPromises.push(that._loadRef(ref).then(function(config) { // REVIEW: config is never used
					handled++;
					if (options.progressCallback && options.progressCallback.call) {
						// REVIEW: Why not just options.progressCallback(handled, loadPromises.length)?
						options.progressCallback.call(null, handled, loadPromises.length);
					}
				}));
			};

			for (var i=0; i<binaries.length; i++) {
				loadRef(binaries[i]);
			}

			return RSVP.all(loadPromises);
		});
	};

	/**
	 * Update an object in the world with an updated config. The object can be of any
	 * type, updating behavior is determined by the registered {ConfigHandler}
	 *
	 * @param {string} ref Ref of object to update
	 * @param {object} [config] New configuration (formatted according to data model). If omitted, works the same as {DynamicLoader.load}.
	 * @param {object} options
	 * @param {function(object)} [options.beforeAdd] Function called before updating the world with the loaded objects. Takes
	 * 	each object as argument and if it returns true, it is added to the world.
	 * @param {boolean} [options.noCache] Ignore cache, i.e. always load files fresh from the server. Defaults to false.
	 * @param {boolean} [options.recursive] Recursively load resources referenced from the given config. Defaults to true.
	 * @returns {RSVP.Promise} The promise is resolved when the object is updated, with the config data as argument.
	 *
	 */
	DynamicLoader.prototype.update = function(ref, config, options) {
		var that = this;
		if (options == null) {
			options = {};
		}
		_.defaults(options, this.options, {
			recursive: true
		});
		if (config) {
			this._configs[ref] = config;
		}
		delete this._objects[ref];
		//var handler = ConfigHandler.getHandler(that._getTypeForRef(ref));

		return this._loadRef(ref).then(function(config) {
			var handled = 0;
			var promises = [];
			if (options.recursive && ConfigHandler.getHandler(DynamicLoader.getTypeForRef(ref))) {
				var childRefs = that._getRefsFromConfig(config);

				var handleChildRef = function(childRef) {
					return promises.push(that._loadRef(childRef).then(function(childConfig) {
						handled++;
						if(options.progressCallback && options.progressCallback.call) {
							options.progressCallback.call(null, handled, promises.length);
						}
						return that._handle(childRef, childConfig, options);
					}));
				};
				for (var i = 0; i < childRefs.length; i++) {
					handleChildRef(childRefs[i]);
				}
			}

			// Concat the last promise (returns new array) rather than pushing it to the promises array
			// to prevent off-by-one error in progress callback.
			return RSVP.all(promises.concat(that._handle(ref, config, options)));
		}).then(function() {
			return that._configs;
		}).then(null, function(err) {
			return console.error("Error updating " + ref + " " + err);
		});
	};

	/**
	 * Remove an object in the world. The object can be of any
	 * type, updating behavior is determined by the registered {ConfigHandler}
	 *
	 * @param {string} ref Ref of object to update
	 * @returns {RSVP.Promise} The promise is resolved when the object is removed, with no argument
	 *
	 */
	DynamicLoader.prototype.remove = function(ref) {
		delete this._objects[ref];
		return this._handle(ref, null);
	};

	// Load/update an object with the given reference into the engine
	DynamicLoader.prototype._handle = function(ref, config, options) {
		var that = this;

		var handler, handlerClass, type;
		if (options == null) {
			options = {};
		}
		if (this._objects[ref]) {
			if(this._objects[ref].then) {
				// The object is already being handled in this update cycle, avoid duplicate handling
				// Object cache is reset when a new update call is initiated by the user
				return this._objects[ref];
			} else if (!options.noCache) {
				return PromiseUtil.createDummyPromise(this._objects[ref]);
			}
		} else {
			type = DynamicLoader.getTypeForRef(ref);
			handlerClass = ConfigHandler.getHandler(type);
			
			if (handlerClass) {
				if (this._handlers == null) {
					this._handlers = {};
				}
				handler = this._handlers[type];
				if (handler) {
					_.extend(handler, {
						world: this._world,
						getConfig: this._loadRef.bind(this),
						updateObject: this._handle.bind(this),
						options: _.clone(options)
					});
				} else {
					/*jshint -W055 */
					handler = this._handlers[type] = new handlerClass(this._world, this._loadRef.bind(this), this._handle.bind(this), options);
				}
				if (config != null) {
					return this._objects[ref] = handler.update(ref, config, options).then(function(object) {
						return that._objects[ref] = object;
					});
				} else {
					handler.remove(ref);
					return PromiseUtil.createDummyPromise(null);
				}
			} else {
				console.warn("No handler for type " + type);
				return PromiseUtil.createDummyPromise(null);
			}
		}
	};

	/**
	 * Fetch a file from the server, and parse JSON if needed.
	 *
	 * @param {string} ref Ref of the config to load
	 * @param {boolean} [noCache] If true, ignore cached config and fetch everything from the server
	 * @returns {RSVP.Promise} Promise that resolves with the loaded config
	 *
	 */
	DynamicLoader.prototype._loadRef = function(ref, noCache) {

		var promise, url,
			that = this;
		// Do not create a request to load the reference if it is a shader
		// to be loaded from the engine's shader library.
		if (ref.indexOf(_ENGINE_SHADER_PREFIX) === 0) {
			promise = PromiseUtil.createDummyPromise(null);
			this._configs[ref] = promise;
		}

		if (noCache == null) {
			noCache = false;
		}

		if (this._configs[ref]) {
			if(this._configs[ref].then) {
				// There's a pending request for this config; return the promise
				return this._configs[ref];
			}
			if (!noCache) {
				return PromiseUtil.createDummyPromise(this._configs[ref]);
			}
		}

		if (!this._ajax) {
			// There is no config loaded for this ref, and we don't have the means to load it
			return PromiseUtil.createDummyPromise(null);
		}

		// Load ref with ajax
		url = this._rootPath + window.escape(ref);

		if (DynamicLoader.isImageRef(ref)) {
			promise = this._ajax.loadImage(url);
		} else if (DynamicLoader.isBinaryRef(ref)) {
			promise = this._ajax.load(url, Ajax.ARRAY_BUFFER);
		} else if (DynamicLoader.isUrlRef(ref)) {
			promise = PromiseUtil.createDummyPromise(url);
		} else {
			promise = this._ajax.load(url);
		}

		promise = promise.then(function(data) {
			if (DynamicLoader.isJSONRef(ref)) {
				return that._configs[ref] = JSON.parse(data);
			} else {
				return that._configs[ref] = data;
			}
		}).then(null, function(e) {
			delete that._configs[ref];
			return e;
		});

		this._configs[ref] = promise;
		return promise;
	};

	// Find all the references in a config, and return in a flat list
	DynamicLoader.prototype._getRefsFromConfig = function(config) {
		var _refs = [];
		var traverse = function(key, value) {
			var _key;
			if (StringUtil.endsWith(key, 'Refs')) {
				_refs = _refs.concat(value);
			} else if (StringUtil.endsWith(key, 'Ref')) {
				_refs.push(value);
			} else if (value instanceof Object) {
				for (_key in value) {
					if (!value.hasOwnProperty(_key)) {
						continue;
					}
					traverse(_key, value[_key]);
				}
			}
		};
		traverse("", config);
		return _refs;
	};



	DynamicLoader.getTypeForRef = function(ref) {
		return ref.split('.').pop().toLowerCase();
	};


	DynamicLoader.isJSONRef = function(ref) {
		var type = DynamicLoader.getTypeForRef(ref);
		return _.indexOf(_json_types, type) >= 0;
	};

	/**
	 * Images that the browser can handle (jpg, png, gif)
	 */
	DynamicLoader.isImageRef = function(ref) {
		var type = DynamicLoader.getTypeForRef(ref);
		return _.indexOf(_image_types, type) >= 0;
	};

	/**
	 * .bin files and non-image textures (dds, tga, crn...)
	 */
	DynamicLoader.isBinaryRef = function(ref) {
		var type = DynamicLoader.getTypeForRef(ref);
		return _.indexOf(_texture_types, type) >= 0 || _.indexOf(_binary_types, type) >= 0;
	};

	/**
	 * Lazy loaded media (sound)
	 */
	DynamicLoader.isUrlRef = function(ref) {
		var type = DynamicLoader.getTypeForRef(ref);
		return _.indexOf(_url_types, type) >= 0;
	};

	/**
	 * Get the engine object for a given ref from the loader cache.
	 * The {DynamicLoader} cache is still quite rudimentary, and should be updated.
	 *
	 * @param {string} ref Ref of object
	 * @returns {object} The engine object, e.g. {Entity} with the given ref, if it's still
	 * available in the loader cache. Otherwise undefined.
	 *
	 */
	DynamicLoader.prototype.getCachedObjectForRef = function(ref) {
		return this._objects?this._objects[ref]:undefined;
	};

	/**
	 * Set the root path for this loader.
	 *
	 * @param path
	 */
	DynamicLoader.prototype.setRootPath = function(path) {
		this._rootPath = path;
		if (path.length > 1 && path.charAt(path.length - 1) !== '/') {
			this._rootPath += '/';
		}
	};

	return DynamicLoader;
});

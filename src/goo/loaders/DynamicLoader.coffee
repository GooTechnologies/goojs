define [

	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/loaders/Loader'
	'goo/renderer/TextureCreator'
	'goo/util/rsvp'
	'goo/util/StringUtil'
	'goo/util/PromiseUtil'

	# Short version of underscore.js
	'goo/util/ObjectUtil'
	
	# Load all handlers
	'goo/loaders/handlers/SceneHandler'
	'goo/loaders/handlers/EntityHandler'
	'goo/loaders/handlers/CameraComponentHandler'
	'goo/loaders/handlers/LightComponentHandler'
	'goo/loaders/handlers/MeshDataComponentHandler'
	'goo/loaders/handlers/MeshRendererComponentHandler'
	'goo/loaders/handlers/TransformComponentHandler'
], (
ConfigHandler,
ComponentHandler,
Loader,
TextureCreator,
RSVP,
su,
pu,
_) ->

	###*
	* @class Class to load scenes into the world, or to update the scene/world based on the data model.
	*
	* @constructor
	* @param {object} parameters
	* @param {World} parameters.world The target World object.
	* @param {Loader} [parameters.loader]
	* @param {string} [parameters.rootPath] The root path where to get resources. Either <code>parameters.rootPath</code> or <code>parameters.loader</code> must be defined.
	*###
	class DynamicLoader			
		_jsonTest = /\.(shader|script|entity|material|scene|mesh|texture)$/		
		
		
		###*
		* Create a new loader
		*
		* @param {object} options
		* @param {Loader} [config.loader] Loader to take care of the AJAX calls
		* @param {Loader} [config.rootPath] Root path of the resources that will be loaded. Either {config.rootPath} or {config.loader} must be set.
		* 	
		* @returns {DynamicLoader} 
		*###
		
		constructor: (options)->
			@_world = options.world or throw new Error("World argument cannot be null")
			if options.loader
				@_loader = options.loader 
			else if options.rootPath
				@_loader = new Loader(rootPath: options.rootPath)
			else
				throw new Error("parameters.rootPath or parameters.loader must be defined")
			@_configs = {}
			@_textureCreator = new TextureCreator(loader:@_loader)
			
			
			
		###*
		* Load an object with the specified ref from a .bundle file. The object can be of any
		* type, what loading does is determined by the file extension of the ref and the 
		* registered {ConfigHandler}.
		* The loader cache will be filled with all the resources in the bundle, so loading other
		* resources from the bundle won't require new AJAX calls. 
		* 
		* @param {string} ref Ref of object to load
		* @param {string} bundleName name of the bundle (including extension) 
		* @param {object} options
		* @param {function(object)} [config.beforeAdd] Function called before updating the world with the loaded objects. Takes
		* 	the config as argument and returns true to continue updating the world, and false to cancel load.
		* @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object 
		* mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
		*###
		loadFromBundle: (ref, bundleName, options={})->
			@_loader.load bundleName, (data)=>
				bundleData = JSON.parse(data)
				if options.noCache
					@_configs = bundleData
				else
					_.extend @_configs, bundleData
				
				if not @_configs[ref]?
					throw Error "#{ref} not found in bundle #{bundleName}. Available keys: \n#{_.keys(@_configs).join('\n')}"
				else 
					console.debug "#{ref} was found in bundle #{bundleName}: #{@_configs[ref]}. Available keys: \n#{_.keys(@_configs).join('\n')}"
				
				console.log "Loaded bundle"
				@load(ref)
				
		
		###*
		* Load an object with the specified path into the world. The object can be of any
		* type, what loading does is determined by the file extension of the ref and the 
		* registered {ConfigHandler}
		* 
		* @param {string} ref Ref of object to load
		* @param {object} options
		* @param {function(object)} [config.beforeAdd] Function called before updating the world with the loaded objects. Takes
		* 	the config as argument and returns true to continue updating the world, and false to cancel load.
		* @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object 
		* mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
		*###
		load: (ref, options={})->
			@update(ref, null, options)

		###*
		* Update an object in the world with an updated config. The object can be of any
		* type, updating behavior is determined by the registered {ConfigHandler}
		* 
		* @param {string} ref Ref of object to update
		* @param {object} [config] New configuration (formatted according to data model). If omitted, works the same as {DynamicLoader.load}.
		* @returns {RSVP.Promise} The promise is resolved when the object is updated, with the config data as argument.
		*###
		update: (ref, config, options={})->
			console.log "Loading/updating #{ref}"
			if config then @_configs[ref] = config
			@_objects = {}
			
			@_loadRef(ref).then (config)=>
				promises = []
				for childRef in @_getRefsFromConfig(config)
					do (childRef)=>
						promises.push @_loadRef(childRef).then (childConfig)=>
							@_handle(childRef, childConfig, options)
						
				promises.push @_handle(ref, config, options)
				return RSVP.all(promises)
			.then ()=>
				return @_configs	
			.then null, (err)->
				console.error "Error updating #{ref} #{err}"
		
		
		# Load/update an object with the given reference into the engine
		_handle: (ref, config, options)-> 
			if @_objects[ref]?.then
				#console.log "#{ref} is handling"	
				return @_objects[ref]
			else if @_objects[ref] and not options.noCache
				#console.log "#{ref} is already handled"
				return pu.createDummyPromise(@_objects[ref])
			else
				type = @_getTypeForRef(ref)
				
				if type == "texture"
					# TODO: Support pixel map textures
					textureObj = @_objects[ref] = @_textureCreator.loadTexture2D(config.url)
					pu.createDummyPromise(textureObj)
				else
					handlerClass = ConfigHandler.getHandler(type)
					if handlerClass
						@_handlers ?= {}
						handler = @_handlers[type]
						if handler
							_.extend handler,
								world: @_world
								getConfig: @_loadRef.bind(@)
								updateObject: @_handle.bind(@)
								options: _.clone(options)
						else
							handler = @_handlers[type] = new handlerClass(@_world, @_loadRef.bind(@), @_handle.bind(@), options)
						
						console.log "Handling #{ref}"
						@_objects[ref] = handler.update(ref, config).then (object)=>
							@_objects[ref] = object
							
					else
						console.warn "No handler for type #{type}"
						pu.createDummyPromise(null)


		###*
		* Fetch a file from the server, and parse JSON if needed. 
		*
		* @param {string} ref Ref of the config to load
		* @param {boolean} [noCache] If true, ignore cached config and fetch everything from the server
		* @returns {RSVP.Promise} Promise that resolves with the loaded config
		*###
		_loadRef: (ref, noCache=false)->
			if @_configs[ref]?.then
				return @_configs[ref]
			else if @_configs[ref]? and not noCache
				return pu.createDummyPromise(@_configs[ref])
			else
				@_configs[ref] = @_loader.load ref, (data)=>
					if _jsonTest.test(ref) 
						@_configs[ref] = JSON.parse(data)
					else
						@_configs[ref] = data

		# Find all the references in a config, and return in a flat list
		_getRefsFromConfig: (config)->
			_refs = []
			traverse = (key,value)->
				if su.endsWith(key, 'Refs')
					_refs = _refs.concat(value)
				else if su.endsWith(key, 'Ref')
					_refs.push(value)
				else if value instanceof Object
					for own _key, _value of value
						traverse(_key, _value)
			traverse "", config

			return _refs

		_getTypeForRef: (ref)->
			type = ref.split('.').pop()
			if type == 'ent' then type = 'entity'
			return type
			
		###*
		* Get the engine object for a given ref from the loader cache.
		* The {DynamicLoader} cache is still quite rudimentary, and should be updated. 
		* 
		* @param {string} ref Ref of object 
		* @returns {object} The engine object, e.g. {Entity} with the given ref, if it's still 
		* available in the loader cache. Otherwise undefined.
		*###
		getCachedObjectForRef: (ref)-> 
			@_objects[ref]


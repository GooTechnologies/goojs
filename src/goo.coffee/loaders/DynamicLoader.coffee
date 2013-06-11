define [

	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/loaders/Loader'
	'goo/renderer/TextureCreator'
	'goo/util/rsvp'
	'goo/util/StringUtil'
	'goo/util/PromiseUtil'
	# REVIEW: Require from goo/lib does not work with the minified code (in the examples at least).
	# The way the build system now works, you can't load modules from goo/lib
	# using require. They are not included in the minified code.
	# The idea is that files in goo/lib are not AMD modules,
	# and shouldn't be loaded by require.
	# Instead to use modules that depend on external libraries (e.g. Box2D)
	# the user will have to add <script> tags or other code to ensure it's loaded.
	# This is why we put RSVP, which is a non-optional part of the engine,
	# into src instead. Maybe we should do the same with underscore
	# (or switch to lodash which is API compatible with underscore but smaller
	# and with AMD support).
	# Maybe some other solution altogether to avoid cluttering src/ with third party code?
	
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
		* Load an object with the specified path into the world. The object can be of any
		* type, what loading does is determined by the registered {ConfigHandler}
		* 
		* @param {string} ref Ref of object to load
		* @param {object} options
		* @param {function(object)} [config.beforeAdd] Function called before updating the world with the loaded objects. Takes
		* 	the config as argument and returns true to continue updating the world, and false to cancel load.
		* @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world, with the config data as argument.
		*###
		# REVIEW: When loading a scene at least, the promise resolved into an object that maps refs to configs (for all loaded refs I think).
		# The comment is a bit unclear about this.
		# BTW, is there a way to get the Entity *object* given a ref? Otherwise getting that mapping here would be very useful.
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
			

		_handle: (ref, config, options)-> 
			if @_objects[ref]?.then
				#console.log "#{ref} is handling"	
				return @_objects[ref]
			else if @_objects[ref] and not options.noCache
				#console.log "#{ref} is already handled"
				return pu.dummyPromise(@_objects[ref])
			else
				type = @_getTypeForRef(ref)
				
				if type == "texture"
					# TODO: Support pixel map textures
					textureObj = @_objects[ref] = @_textureCreator.loadTexture2D(config.url)
					pu.dummyPromise(textureObj)
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
						pu.dummyPromise(null)


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
				return pu.dummyPromise(@_configs[ref])
			else
				@_configs[ref] = @_loader.load ref, (data)=>
					# REVIEW: We can't assume that data is JSON just because it can be parsed as JSON.
					# Otherwise invalid JSON will result in the data being treated as a string,
					# when it should give an error.
					# And data that just happens to look like JSON is parsed as JSON
					# even though it shouldn't.
					# Instead, the assumed file format should depend on file type.
					# Do as the tool server, that checks the file extension when loading,
					# see Tool/server/models/project.coffee
					# (It doesn't check when saving though, but that shouldn't cause problems.)
					try 
						output = JSON.parse(data)
					catch e
						output = data
					finally
						@_configs[ref] = output

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
			ref.split('.').pop()

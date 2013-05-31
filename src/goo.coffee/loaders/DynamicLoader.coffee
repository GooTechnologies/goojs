define [

	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/loaders/Loader'
	'goo/renderer/TextureCreator'
	'goo/util/rsvp'
	'goo/util/StringUtil'
	'goo/util/PromiseUtil'
	'goo/util/ConsoleUtil'
	
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
console) ->

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
			# REVIEW this looks like it's intended to be private
			# Shouldn't we be able to access the loaded objects/configs after loading?
			@_configs = {}
			@_textureCreator = new TextureCreator(loader:@_loader)
			
			
		###*
		* Load an object with the specified path into the world. The object can be of any
		* type, what loading does is determined by the registered {ConfigHandler}
		* 
		* @param {string} ref Ref of object to load
		* @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world, with the config data as argument.
		*###
		load: (ref)->
			@update(ref, null)

		###*
		* Update an object in the world with an updated config. The object can be of any
		* type, updating behavior is determined by the registered {ConfigHandler}
		* 
		* @param {string} ref Ref of object to update
		* @param {object} [config] New configuration (formatted according to data model). If omitted, works the same as {DynamicLoader.load}.
		* @returns {RSVP.Promise} The promise is resolved when the object is updated, with the config data as argument.
		*###
		update: (ref, config)->
			console.log "Loading/updating #{ref}"
			if config then @_configs[ref] = config
			# REVIEW why not construct this in the constructor? Also, same comment as for @_configs
			@_objects = {}
			
			@_loadRef(ref).then (config)=>
				promises = []
				for childRef in @_getRefsFromConfig(config)
					do (childRef)=>
						promises.push @_loadRef(childRef).then (childConfig)=>
							@_handle(childRef, childConfig)
						
				promises.push @_handle(ref, config)
				return RSVP.all(promises)
			.then ()=>
				return @_configs	
			.then null, (err)->
				console.error "Error updating #{ref} #{err}"
			

		_handle: (ref, config, noCache=false)-> 
			if @_objects[ref]?.then
				#console.log "#{ref} is handling"	
				return @_objects[ref]
			else if @_objects[ref] and not noCache
				#console.log "#{ref} is already handled"
				return pu.dummyPromise(@_objects[ref])
			else
				type = @_getTypeForRef(ref)
				
				if type == "texture"
					# Textures are special
					# REVIEW do we support pixel map textures in the file format? Like in the picking or the shapes example
					# If yes, this ignores them
					textureObj = @_objects[ref] = @_textureCreator.loadTexture2D(config.url)
					pu.dummyPromise(textureObj)
				else
					handlerClass = ConfigHandler.getHandler(type)
					if handlerClass
						@_handlers ?= {}
						handler = @_handlers[type]
						if handler
							handler.world = @_world
							handler.getConfig = @_loadRef.bind(@)
						else
							handler = @_handlers[type] = new handlerClass(@_world, @_loadRef.bind(@), @_handle.bind(@) )
						
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
				#console.log "#{ref} is loading"	
				return @_configs[ref]
			else if @_configs[ref]? and not noCache
				#console.log "#{ref} is already loaded"
				return pu.dummyPromise(@_configs[ref])
			else
				@_configs[ref] = @_loader.load ref, (data)=>
					try 
						output = JSON.parse(data)
					catch e
						#console.warn "#{ref} is not a JSON file"
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

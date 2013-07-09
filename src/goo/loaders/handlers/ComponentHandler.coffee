define [
	'goo/util/rsvp', 
	'goo/util/PromiseUtil'
],  `/** @lends */` 
(RSVP, pu) ->


	###*
	* @class Base class for component handlers. All different types of components that an entity 
	* can have need to have a registered component handler. To handle a new type of component, 
	* create a class that inherits from this class, and override {_prepare}, {_create}, {update} and {remove}
	* as needed ({update} must be overridden). In your class, call <code>@_register('yourComponentType')</code> to register
	* the handler with the loader.
	*
	* @constructor
	* @param {World} world The goo world
	* @param {function} getConfig The config loader function. See {DynamicLoader._loadRef}.
	* @param {function} updateObject The handler function. See {DynamicLoader.update}.
	* @param {object} options 
	* @returns {ComponentHandler}
	*###
	class ComponentHandler
		constructor: (@world, @getConfig, @updateObject, @options)->

		###*
		* Prepare component. Set defaults on config here.
		* @param {object} config
		###
		_prepare: (config)->

		###*
		* Create engine component object based on the config. Should be overridden in subclasses.
		* @param {Entity} entity The entity on which this component should be added. 
		* @param {object} config
		* @returns {Component} the created component object
		###
		_create: (entity, config)->
			throw new Error("ComponentHandler._create is abstract, use ComponentHandler.getHandler(type)")
		
		###*
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
		###
		update: (entity, config)->
			#console.log "Updating #{@constructor._type} component"
			@_prepare(config)
			object = entity?["#{@constructor._type}Component"]
			if not object
				#console.log "Need to create a new #{@constructor._type}Component"
				object = @_create(entity, config)
			else
				#console.log "Entity already has #{@constructor._type}Component"
			return object
			
		###*
		* Remove the component that is handled by this handler from the given entity.
		* @param {Entity} entity The entity from which the component should be removed
		###
		remove: (entity) ->
			entity?.clearComponent "#{@constructor._type}Component"

		@handlerClasses = {}

		###*
		* Get a handler class for the specified type of component. The type can be e.g. 'camera', 'transform', etc. 
		* The type name should not end with "Component". 
		* @param {string} type 
		* @returns {Class} A subclass of {ComponentHandler}, or null if no registered handler for the given type was found. 
		###
		@getHandler: (type)->
			@handlerClasses?[type] #or console.warn("No component handler found for type #{type}")

		###*
		* Register a handler for a component type. Called in the class body of subclasses. 
		* @param {string} type 
		###
		@_register: (type)->
			@_type = type
			ComponentHandler.handlerClasses[type] = @

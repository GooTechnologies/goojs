define [
	'goo/util/rsvp', 
	'goo/util/PromiseUtil'
], 
(RSVP, pu) ->

	class ComponentHandler
		constructor: (@world, @getConfig, @updateObject, @options)->

		_prepare: (config)->
		
		_create: (entity, config)->
			throw new Error("ComponentHandler._create is abstract, use ComponentHandler.getHandler(type)")
		
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
			
		remove: (entity) ->
			entity?.clearComponent "#{@constructor._type}Component"

		@handlerClasses = {}
		@getHandler: (type)->
			@handlerClasses?[type] #or console.warn("No component handler found for type #{type}")

		@_register: (type)->
			@_type = type
			ComponentHandler.handlerClasses[type] = @

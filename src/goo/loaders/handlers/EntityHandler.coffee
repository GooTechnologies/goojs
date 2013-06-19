define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'
	'goo/entities/Entity'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
], (ConfigHandler, ComponentHandler, Entity, RSVP, pu, _) ->
			
	class EntityHandler extends ConfigHandler
		@_register('entity')
		
		_prepare: (config)->
			#	
			
			
		_create: (ref)->
			object = @world.createEntity(ref)
			object.ref = ref
			return object
			
		update: (ref, config)->
			object = @world.entityManager.getEntityByName(ref) or @_create(ref)
			
			promises = []
			for componentName, componentConfig of config.components
				handlerClass = ComponentHandler.getHandler(componentName)
				if handlerClass
					@_componentHandlers ?= {}
					handler = @_componentHandlers[componentName]
					if handler
						_.extend handler,
							world: @_world
							getConfig: @getConfig
							updateObject: @updateObject
							options: _.clone(@options)
					
					else 
						handler = @_componentHandlers[componentName] = new handlerClass(@world, @getConfig, @updateObject, @options)
					
					promise = handler.update(object, componentConfig)
					if not promise?.then
						console.error "Handler for #{componentName} did not return promise"
					else
						promises.push(promise)
				else
					console.warn "No componentHandler for #{componentName}"

			if promises.length
				RSVP.all(promises).then (components)=>
					#object.addToWorld()
					return object
					
			else 
				console.error "No promises in #{ref} ", config
				return pu.createDummyPromise(object)
		
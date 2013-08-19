define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
], (ConfigHandler, RSVP, pu) ->
							
	class SceneHandler extends ConfigHandler
		@_register('scene')
		
		_prepare: (config)-> #
		_create: (ref)-> #
			
		# Returns a promise which resolves when updating is done
		update: (ref, config)->
			promises = []
			if config.entityRefs?.length
				for entityRef in config.entityRefs
					do (entityRef)=>
						promises.push @getConfig(entityRef).then (entityConfig)=>
							@updateObject(entityRef, entityConfig, @options)

				RSVP.all(promises).then (entities)=>
					for entity in entities
						if not @options.beforeAdd?.apply or @options.beforeAdd(entity)
						#console.log "Adding #{entity.ref} to world"
							entity.addToWorld()
			
				.then null, (err)-> console.error "Error updating entities: #{err}"
			else
				console.warn "No entity refs in scene #{ref}"
				return config
	
		remove: (ref)->
				# Do nothing
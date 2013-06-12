define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/TransformComponent'

	'goo/math/MathUtils'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
], (
ComponentHandler,
TransformComponent,
MathUtils,
RSVP,
pu,
_) ->

	class TransformComponentHandler extends ComponentHandler
		@_register('transform')
		
		_prepare: (config) ->
			_.defaults config,
				translation: [0, 0, 0]
				rotation: [0, 0, 0]
				scale: [1, 1, 1]
		
		_create: (entity, config) ->
			#console.log "Creating new transform component"
			component = new TransformComponent()
			entity.setComponent(component)			
		
		update: (entity, config) ->
			component = super(entity, config) # Creates component if needed

			component.transform.translation.set config.translation
			component.transform.setRotationXYZ(
				MathUtils.radFromDeg(config.rotation[0]),
				MathUtils.radFromDeg(config.rotation[1]),
				MathUtils.radFromDeg(config.rotation[2])
			)
			component.transform.scale.set config.scale

			if config.parentRef? 
				console.log "Found a parentref, getting..."
				@getConfig(config.parentRef).then (parentConfig)=>
					@updateObject(config.parentRef, parentConfig, @options).then (parent)=>
						if parent? and component.parentRef?.entity != parent
							console.log "Adding parent #{config.parentRef}"
							parent.transformComponent.attachChild(component)
						else if parent?
							console.log "Parent is already set"
						else
							console.warn "Could not find parent with ref #{config.parentRef}"

			component.setUpdated()
# 				if parent? and (not component.parentRef? or component.parentRef?.entity != parent.object)
# 					parent.object.transformComponent.attachChild(component)
# 			#component.setUpdated()
			return pu.createDummyPromise(component)
			
		remove: (entity) ->
			# We never remove the transform component, just set it to the defaults.
			component = entity.transformComponent
			component.transform.translation.set 0, 0, 0
			component.transform.setRotationXYZ 0, 0, 0
			component.transform.scale.set 1, 1, 1
			component.setUpdated()

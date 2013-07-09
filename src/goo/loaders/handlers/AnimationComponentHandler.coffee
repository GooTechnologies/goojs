define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/_AnimationComponent'

	'goo/math/MathUtils'
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
], (
	ComponentHandler,
	AnimationComponent,
	MathUtils,
	RSVP,
	pu,
	_
) ->
	
	class AnimationComponentHandler extends ComponentHandler
		@_register('animation')
		
		
		_prepare: (config) ->
			return
			
		_create: (entity, config) ->
			component = new AnimationComponent()
			entity.setComponent(component)
			return component
		
		update: (entity, config) ->
			component = super(entity, config) # Creates component if needed
			
			layersRef = config.layersRef
			
			if not layersRef
				console.log "No animation tree ref"
				promise = pu.createDummyPromise([])
			else
				promise =  @_getAnimationLayers(layersRef)
				
			promise.then (layers) =>
				component.layers = layers
			
		_getAnimationLayers: (ref) ->
			console.log "GetAnimationLayers #{ref}"
			@getConfig(ref).then (config) =>
				@updateObject(ref, config, @options)
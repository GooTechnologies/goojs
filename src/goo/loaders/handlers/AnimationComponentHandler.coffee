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
			
			animTreeRef = config.animationTree
			
			if not animTreeRef
				console.log "No animation tree ref"
				promise = pu.createDummyPromise([])
			else
				promise =  @_getAnimationTree(animTreeRef)
				
			promise.then (animationTree) =>
				component.
			
		
		
		_getAnimationTree: (ref) ->
			console.log "GetAnimationLayers #{ref}"
			@getConfig(ref).then (config) =>
				@updateObject(ref, config, @options)
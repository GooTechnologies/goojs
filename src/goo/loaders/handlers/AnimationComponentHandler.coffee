define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/AnimationComponent'

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
			poseRef = config.poseRef

			promises = []

			if not poseRef
				console.log "No skeleton pose ref"
				p1 = pu.createDummyPromise()
			else
				p1 = @getConfig(poseRef).then (config) =>
					@updateObject(poseRef, config, @options).then (pose) =>
						component._skeletonPose = pose

			promises.push(p1)
			
			if not layersRef
				console.log "No animation tree ref"
				p2 = pu.createDummyPromise([])
			else
				p2 = @_getAnimationLayers(layersRef).then (layers) =>
					component.layers = layers
				
			RSVP.all(promises).then =>
				component
			
		_getAnimationLayers: (ref) ->
			console.log "GetAnimationLayers #{ref}"
			@getConfig(ref).then (config) =>
				@updateObject(ref, config, @options)
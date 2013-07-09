define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/animation/layer/AnimationLayer'
	'goo/animation/layer/LayerLERPBlender'
	'goo/animation/state/SteadyState'
	'goo/animation/blendtree/ClipSource'
	'goo/animation/blendtree/ManagedTransformSource'

	'goo/util/rsvp'
	'goo/util/PromiseUtil'
], (
	ConfigHandler
	AnimationLayer
	LayerLERPBlender
	SteadyState
	ClipSource
	ManagedTransformSource
	
	RSVP
	pu
) ->
	class AnimationLayersHandler extends ConfigHandler
		@_register('animation')
		
		_create: (layersConfig) ->
			promises = []
			console.debug "Creating animation layers"
			layers = (
				for layerConfig, layerKey of layersConfig
					layer = new AnimationLayer(layerConfig.name)
					if layerConfig.blendWeight?
						layer._layerBlender = new LayerLERPBlender()
						layer._layerBlender._blendWeight = layerConfig.blendWeight
					for stateConfig, stateKey of layerConfig.states
						state = new SteadyState(stateConfig.name)
						layer._steadyStates[stateKey] = state
						do (state) ->
							promises.push @_parseClipSource(stateConfig.clipSource).then (source) =>
								state._sourceTree = source
			)
			return RSVP.all(promises).then ->
				return layers
			
		_parseClipSource: (clipSourceConfig) ->
			if clipSourceConfig.type == 'Clip'
				return @getConfig(clipSourceConfig.clipRef).then (config) =>
					@updateObject(clipSourceConfig.clipRef, config, @options)
				.then (clip) =>
					new ClipSource(clip)
					
			if clipSourceConfig.type == 'Managed'
				source = new ManagedTransformSource()
				if clipSourceConfig.clipRef?
					return @getConfig(clipSourceConfig.clipRef).then (config) =>
						@updateObject(clipSourceConfig.clipRef, config, @options)
					.then (clip) =>
						source.initJointsById(clip, clipSourceConfig.joints)
				else
					return pu.createDummyPromise(source)
			if clipSourceConfig.type == 'Lerp'
				promises = []
				promises.push @_parseClipSource(clipSourceConfig.clipSourceA)
				promises.push @_parseClipSource(clipSourceConfig.clipSourceB)
				
				return RSVP.all(promises).then (clipSources) =>
					source = new BinaryLERPSource(clipSources[0], clipSources[1])
					if clipSourceConfig.blendWeight
						source._blendWeight = clipSourceConfig.blendWeight
					return source
			if clipSourceConfig.type == 'Frozen'
				return @_parseClipSource(clipSourceConfig.clipSource).then (clipSource) ->
					return new FrozenClipSource(clipSource, clipSourceConfig || 0.0)
				
			
		update: (ref, config) ->
			layers = @_create(config)
			return pu.createDummyPromise(layers)
			
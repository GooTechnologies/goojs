define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/animation/layer/AnimationLayer'
	'goo/animation/layer/LayerLERPBlender'
	'goo/animation/state/SteadyState'
	'goo/animation/blendtree/ClipSource'
	'goo/animation/blendtree/ManagedTransformSource'
	'goo/animation/blendtree/BinaryLERPSource'
	'goo/animation/state/FadeTransitionState'
	'goo/animation/state/SyncFadeTransitionState'
	'goo/animation/state/FrozenTransitionState'

	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
], (
	ConfigHandler
	AnimationLayer
	LayerLERPBlender
	SteadyState
	ClipSource
	ManagedTransformSource
	BinaryLERPSource
	FadeTransitionState
	SyncFadeTransitionState
	FrozenTransitionState
	
	RSVP
	pu
	_
) ->
	class AnimationLayersHandler extends ConfigHandler
		@_register('animation')
		
		_create: (layersConfig) ->
			console.debug "Creating animation layers"
			layers = []

			promises = []
			for layerKey, layerConfig of layersConfig
				layer = new AnimationLayer(layerConfig.name)
				layers.push(layer)
				
				if layerConfig.blendWeight?
					layer._layerBlender = new LayerLERPBlender()
					layer._layerBlender._blendWeight = layerConfig.blendWeight
				
				for stateKey, stateConfig of layerConfig.states
					state = new SteadyState(stateConfig.name)
					layer._steadyStates[stateKey] = state
					do (state) =>
						promises.push @_parseClipSource(stateConfig.clipSource).then (source) =>
							state._sourceTree = source

				for stateKey, stateConfig of layerConfig.states when stateConfig.transitions?
					for transitionKey, transitionConfig of stateConfig.transitions when layer._steadyStates[transitionKey]? or transitionKey == '*'
						transition = _.clone(transitionConfig)
						layer._steadyStates[stateKey]._transitions[transitionKey] = transition
						if not layer._transitionStates[transition.type]?
							layer._transitionStates[transition.type] = @_getTransitionByType(transition.type)
								
				if layerConfig.transitions?
					for transitionKey, transitionConfig of layerConfig.transitions when layer._steadyStates[transitionKey]? or transitionKey == '*'
						transition = _.clone(transitionConfig)
						layer._transitions[transitionKey] = transition
						if not layer._transitionStates[transition.type]?
							layer._transitionStates[transition.type] = @_getTransitionByType(transition.type)

				if layerConfig.defaultState?
					layer.setCurrentStateByName(layerConfig.defaultState)

			return RSVP.all(promises).then ->
				return layers
			
		_parseClipSource: (cfg) ->
			switch cfg.type
				when 'Clip'
					return @getConfig(cfg.clipRef).then (config) =>
						@updateObject(cfg.clipRef, config, @options)
						.then (clip) =>
							clipSource = new ClipSource(clip)
							
							for key in ['loopCount', 'timeScale', 'active']
								if cfg[key] and not isNaN(cfg[key])
									clipSource._clipInstance['_'+key] = cfg[key]
							
							return clipSource
			
				when 'Managed'
					source = new ManagedTransformSource()
					if clipSourceConfig.clipRef?
						return @getConfig(cfg.clipRef)
							.then (config) =>
								@updateObject(cfg.clipRef, config, @options)
							.then (clip) =>
								source.initJointsById(clip, cfg.joints)
					else
						return pu.createDummyPromise(source)
				
				when 'Lerp'
					promises = [
						@_parseClipSource(cfg.clipSourceA)
						@_parseClipSource(cfg.clipSourceB)
					]
					return RSVP.all(promises)
						.then (clipSources) =>
							source = new BinaryLERPSource(clipSources[0], clipSources[1])
							if cfg.blendWeight
								source.blendWeight = cfg.blendWeight
							return source

				when 'Frozen'
					return @_parseClipSource(cfg.clipSource).then (clipSource) ->
						return new FrozenClipSource(clipSource, cfg.frozenTime || 0.0)

				else
					console.error 'Unable to parse clip source'
					return pu.createDummyPromise()
		
		_getTransitionByType: (type) ->
			switch type
				when 'Fade'
					return new FadeTransitionState()
				when 'SyncFade'
					return new SyncFadeTransitionState()
				when 'Frozen'
					return new FrozenTransitionState()
				else
					console.log 'Defaulting to frozen transition type'
					return new FrozenTransitionState()


		update: (ref, config) ->
			layers = @_create(config)
			return pu.createDummyPromise(layers)
			
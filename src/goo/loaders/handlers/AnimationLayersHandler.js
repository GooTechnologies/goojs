define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/layer/LayerLERPBlender',
	'goo/animation/state/SteadyState',
	'goo/animation/blendtree/ClipSource',
	'goo/animation/blendtree/ManagedTransformSource',
	'goo/animation/blendtree/BinaryLERPSource',
	'goo/animation/blendtree/FrozenClipSource',
	'goo/animation/state/FadeTransitionState',
	'goo/animation/state/SyncFadeTransitionState',
	'goo/animation/state/FrozenTransitionState',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	AnimationLayer,
	LayerLERPBlender,
	SteadyState,
	ClipSource,
	ManagedTransformSource,
	BinaryLERPSource,
	FrozenClipSource,
	FadeTransitionState,
	SyncFadeTransitionState,
	FrozenTransitionState,
	RSVP,
	pu,
	_
) {
	function AnimationLayersHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationLayersHandler.prototype = Object.create(ConfigHandler);
	ConfigHandler._registerClass('animation', AnimationLayersHandler);

	AnimationLayersHandler.prototype._create = function(layersConfig) {
		//console.debug("Creating animation layers");

		var promises = [];
		promises.push(this._parseLayer(layersConfig.DEFAULT));

		for (var layerKey in layersConfig) {
			var layerConfig = layersConfig[layerKey];
			if (layerKey !== 'DEFAULT') {
				promises.push(this._parseLayer(layerConfig));
			}
		}
		return RSVP.all(promises).then(function(layers) {
			return layers;
		});
	};

	AnimationLayersHandler.prototype._parseLayer = function(layerConfig) {
		var that = this;

		var promises = [];
		var layer = new AnimationLayer(layerConfig.name);

		if (layerConfig.blendWeight != null) {
			layer._layerBlender = new LayerLERPBlender();
			layer._layerBlender._blendWeight = layerConfig.blendWeight;
		}

		var parseState = function(state) {
			return promises.push(that._parseClipSource(stateConfig.clipSource).then(function(source) {
				return state._sourceTree = source;
			}));
		};

		for (var stateKey in layerConfig.states) {
			var stateConfig = layerConfig.states[stateKey];
			var state = new SteadyState(stateConfig.name);
			layer._steadyStates[stateKey] = state;
			parseState(state);

			if (stateConfig.transitions != null) {
				for (var transitionKey in stateConfig.transitions) {
					var transitionConfig = stateConfig.transitions[transitionKey];

					if ((layer._steadyStates[transitionKey] != null) || transitionKey === '*') {
						var transition = _.clone(transitionConfig);
						layer._steadyStates[stateKey]._transitions[transitionKey] = transition;
						if (layer._transitionStates[transition.type] == null) {
							layer._transitionStates[transition.type] = this._getTransitionByType(transition.type);
						}
					}
				}
			}
		}

		if (layerConfig.transitions != null) {
			for (var transitionKey in layerConfig.transitions) {
				var transitionConfig = layerConfig.transitions[transitionKey];
				if ((layer._steadyStates[transitionKey] != null) || transitionKey === '*') {
					var transition = _.clone(transitionConfig);
					layer._transitions[transitionKey] = transition;
					if (layer._transitionStates[transition.type] == null) {
						layer._transitionStates[transition.type] = this._getTransitionByType(transition.type);
					}
				}
			}
		}
		if (layerConfig.defaultState != null) {
			layer.setCurrentStateByName(layerConfig.defaultState);
		}
		return RSVP.all(promises).then(function() {
			return layer;
		});
	};

	AnimationLayersHandler.prototype._parseClipSource = function(cfg) {
		//var promises, source;
		var that = this;

		switch (cfg.type) {
			case 'Clip':
				return this.getConfig(cfg.clipRef).then(function(config) {
					return that.updateObject(cfg.clipRef, config, that.options).then(function(clip) {
						var clipSource = new ClipSource(clip, cfg.filter, cfg.channels);

						var keys = ['loopCount', 'timeScale', 'active'];
						for (var i = 0; i < keys.length; i++) {
							var key = keys[i];
							if (cfg[key] && !isNaN(cfg[key])) {
								clipSource._clipInstance['_' + key] = cfg[key];
							}
						}
						return clipSource;
					});
				});
			case 'Managed':
				var source = new ManagedTransformSource();
				if (cfg.clipRef != null) {
					return this.getConfig(cfg.clipRef).then(function(config) {
						return that.updateObject(cfg.clipRef, config, that.options);
					}).then(function(clip) {
						return source.initJointsById(clip, cfg.joints);
					});
				} else {
					return pu.createDummyPromise(source);
				}
				break;
			case 'Lerp':
				var promises = [this._parseClipSource(cfg.clipSourceA), this._parseClipSource(cfg.clipSourceB)];
				return RSVP.all(promises).then(function(clipSources) {
					var source = new BinaryLERPSource(clipSources[0], clipSources[1]);
					if (cfg.blendWeight) {
						source.blendWeight = cfg.blendWeight;
					}
					return source;
				});
			case 'Frozen':
				return this._parseClipSource(cfg.clipSource).then(function(clipSource) {
					return new FrozenClipSource(clipSource, cfg.frozenTime || 0.0);
				});
			default:
				console.error('Unable to parse clip source');
				return pu.createDummyPromise();
		}
	};

	AnimationLayersHandler.prototype._getTransitionByType = function(type) {
		switch (type) {
			case 'Fade':
				return new FadeTransitionState();
			case 'SyncFade':
				return new SyncFadeTransitionState();
			case 'Frozen':
				return new FrozenTransitionState();
			default:
				console.log('Defaulting to frozen transition type');
				return new FrozenTransitionState();
		}
	};

	AnimationLayersHandler.prototype.update = function(ref, config) {
		var layers = this._create(config);
		return pu.createDummyPromise(layers);
	};

	return AnimationLayersHandler;
});

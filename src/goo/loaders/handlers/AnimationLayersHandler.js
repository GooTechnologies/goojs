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
	PromiseUtil,
	_
) {
	function AnimationLayersHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	AnimationLayersHandler.prototype = Object.create(ConfigHandler);
	ConfigHandler._registerClass('animation', AnimationLayersHandler);

	AnimationLayersHandler.prototype.update = function(ref, config) {
		var object = this._objects[ref] || this._create(ref);
		var promises = [];

		if (config.layers instanceof Array) {
			for (var i = 0; i < config.layers.length; i++) {
				var layerConfig = config.layers[i];
				promises.push(this._parseLayer(layerConfig, object[i]));
			}
		} else {
			var i = 1;
			promises.push(this._parseLayer(config.layers.DEFAULT, object[0]));
			for (var key in config.layers) {
				var layerConfig = config.layers[key];
				if (key !== 'DEFAULT') {
					promises.push(this._parseLayer(layerConfig, object[i++]));
				}
			}
		}
		return RSVP.all(promises);
	};

	AnimationLayersHandler.prototype._create = function(ref) {
		return this._objects[ref] = [];
	};

	AnimationLayersHandler.prototype._parseLayer = function(layerConfig, layer) {
		var that = this;

		if (!layer) {
			layer = new AnimationLayer(layerConfig.name);
			layer._layerBlender = new LayerLERPBlender();
		} else {
			layer._name = layerConfig.name;
		}
		layer._layerBlender._blendWeight = layerConfig.blendWeight || 1.0;

		var promises = [];

		function getState(key, ref) {
			return that.getConfig(ref).then(function(config) {
				return that.updateObject(ref, config, that.options).then(function(state) {
					return {
						state: state,
						ref: ref,
						config: config,
						key: key
					};
				});
			});
		}

		for (var stateKey in layerConfig.states) {
			promises.push(getState(stateKey, layerConfig.states[stateKey].stateRef));
		}

		return RSVP.all(promises).then(function(stateObjects) {
			layer._steadyStates = {};
			for (var i = 0; i < stateObjects.length; i++) {
				var stateObject = stateObjects[i];
				layer._steadyStates[stateObject.key] = stateObject.state;
			}
			for(var i = 0; i < stateObjects.length; i++) {
				var transitions = stateObjects[i].config.transitions;
				var state = stateObjects[i].state;
				if (transitions) {
					for (var key in transitions) {
						var transitionConfig = transitions[key];

						if (layer._steadyStates[key] || key === '*') {
							var transition = _.clone(transitionConfig);
							state._transitions[key] = transition;
							if (!layer._transitionStates[transition.type]) {
								layer._transitionStates[transition.type] = that._getTransitionByType(transition.type);
							}
						}
					}
				}
			}
		}).then(function() {
			if (layerConfig.transitions) {
				for (var transitionKey in layerConfig.transitions) {
					var transitionConfig = layerConfig.transitions[transitionKey];
					if (layer._steadyStates[transitionKey] || transitionKey === '*') {
						var transition = _.clone(transitionConfig);
						layer._transitions[transitionKey] = transition;
						if (!layer._transitionStates[transition.type]) {
							layer._transitionStates[transition.type] = that._getTransitionByType(transition.type);
						}
					}
				}
			}
			if (layerConfig.defaultState) {
				layer.setCurrentStateByName(layerConfig.defaultState);
			}
			return layer;
		});
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

	return AnimationLayersHandler;
});

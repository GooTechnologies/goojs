define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/layer/LayerLERPBlender',
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
	FadeTransitionState,
	SyncFadeTransitionState,
	FrozenTransitionState,
	RSVP,
	PromiseUtil,
	_
) {
	"use strict";

	/*
	 * @class Handler for loading animation layers
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @extends ConfigHandler
	 */
	function AnimationLayersHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationLayersHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationLayersHandler.prototype.constructor = AnimationLayersHandler;
	ConfigHandler._registerClass('animation', AnimationLayersHandler);

	/*
	 * Creates an empty array to store animation layers
	 * @param {string} ref
	 * @returns {AnimationLayer[]}
	 * @private
	 */
	AnimationLayersHandler.prototype._create = function(ref) {
		return this._objects[ref] = [];
	};

	/*
	 * Shallow update of layers, which mean only changing blend weights and default states are allowed
	 * @param {object} config
	 * @param {AnimationLayer[]} layers
	 */
	AnimationLayersHandler.prototype._updateShallow = function(config, layers) {
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			var layerCfg = config[layer._key];

			if (layer._layerBlender) {
				layer._layerBlender._blendWeight = layerCfg.blendWeight;
			}
			this._setDefaultState(layer, layerCfg.defaultState);
		}
		return PromiseUtil.createDummyPromise(layers);
	};

	/*
	 * Sets current state on a layer if possible, otherwise clears  current state
	 * @param {AnimationLayer} layer
	 * @param {string} name
	 */
	AnimationLayersHandler.prototype._setDefaultState = function(layer, name) {
		if (name && layer._steadyStates[name]) {
			if (layer._currentState !== layer._steadyStates[name]) {
				layer.setCurrentStateByName(name, true);
			}
		} else {
			layer.setCurrentState();
		}
	};

	/*
	 * Adds/updates/removes the animation layers
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation state or null if removed
	 */
	AnimationLayersHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(object) {
			var promises = [];
			if (options && options.animation && options.animation.shallow) {
				// Only update blendweights and default states
				return that._updateShallow(config.layers, object);
			}

			var i = 0;
			_.forEach(config.layers, function(layerCfg, key) {
				promises.push(that._parseLayer(key, layerCfg, object[i++], options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function(layers) {
				object.length = layers.length;
				for(var i = 0; i < layers.length; i++) {
					object[i] = layers[i];
				}
				return object;
			});
		});
	};

	/*
	 * Parses a single layer, puts the correct properties and {@link SteadyState} onto it
	 * @param {object} layerConfig
	 * @param {layer}
	 * @returns {RSVP.Promise} resolves with layer
	 * @private
	 */
	AnimationLayersHandler.prototype._parseLayer = function(key, layerConfig, layer, options) {
		var that = this;

		function getState(key, ref, transitions) {
			return that.getConfig(ref, options).then(function(config) {
				return that.updateObject(ref, config, options).then(function(state) {
					return {
						state: state,
						ref: ref,
						config: config,
						key: key,
						transitions: transitions
					};
				});
			});
		}

		function fillStates(stateObjects) {
			layer._steadyStates = {};
			// Steady states
			for (var i = 0; i < stateObjects.length; i++) {
				var stateObject = stateObjects[i];
				layer._steadyStates[stateObject.key] = stateObject.state;
			}
			// State specific transitions
			for(var i = 0; i < stateObjects.length; i++) {
				var transitions = stateObjects[i].transitions;
				var state = stateObjects[i].state;
				state._transitions = {};
				if (transitions) {
					// Add all valid transitions to state
					for (var key in transitions) {
						if (layer._steadyStates[key] || key === '*') {
							var transition = _.clone(transitions[key]);
							state._transitions[key] = transition;

							// Create a reusable transition state
							if (!layer._transitionStates[transition.type]) {
								layer._transitionStates[transition.type] = that._getTransitionByType(transition.type);
							}
						}
					}
				}
			}
		}

		function fillTransitions() {
			layer._transitions = {};
			// Layer generic transitions
			if (layerConfig.transitions) {
				// Add all valid transitions to layer
				for (var transitionKey in layerConfig.transitions) {
					if (layer._steadyStates[transitionKey] || transitionKey === '*') {
						var transition = _.clone(layerConfig.transitions[transitionKey]);
						layer._transitions[transitionKey] = transition;

						// Create a reusable transition state
						if (!layer._transitionStates[transition.type]) {
							layer._transitionStates[transition.type] = that._getTransitionByType(transition.type);
						}
					}
				}
			}
		}

		if (!layer) {
			layer = new AnimationLayer(layerConfig.name);
		} else {
			layer._name = layerConfig.name;
		}

		layer._key = key;

		if (layer._layerBlender) {
			if (layerConfig.blendWeight !== undefined) {
				layer._layerBlender._blendWeight = layerConfig.blendWeight;
			} else {
				layer._layerBlender._blendWeight = 1.0;
			}
		}

		// Load all the stuff we need
		var promises = [];
		for (var stateKey in layerConfig.states) {
			var stateRef = layerConfig.states[stateKey].stateRef;
			var transitions = layerConfig.states[stateKey].transitions;
			promises.push(getState(stateKey, stateRef, transitions));
		}

		// Populate layer
		return RSVP.all(promises)
			.then(fillStates)
			.then(fillTransitions)
			.then(function() {
				that._setDefaultState(layer, layerConfig.defaultState);
				return layer;
			});
	};

	/*
	 * Creates a new transition depending on type
	 * @param {string} type
	 * @returns {FadeTransitionState|SyncFadeTransitionState|FrozenTransitionState}
	 * @private
	 */
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

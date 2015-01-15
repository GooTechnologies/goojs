define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animationpack/layer/AnimationLayer',
	'goo/animationpack/layer/LayerLERPBlender',
	'goo/animationpack/state/FadeTransitionState',
	'goo/animationpack/state/SyncFadeTransitionState',
	'goo/animationpack/state/FrozenTransitionState',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function (
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
	'use strict';

	/**
	 * @class Handler for loading animation layers
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @extends ConfigHandler
	 * @private
	 */
	function AnimationLayersHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationLayersHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationLayersHandler.prototype.constructor = AnimationLayersHandler;
	ConfigHandler._registerClass('animation', AnimationLayersHandler);

	/**
	 * Creates an empty array to store animation layers
	 * @param {string} ref
	 * @returns {AnimationLayer[]}
	 * @private
	 */
	AnimationLayersHandler.prototype._create = function (ref) {
		return this._objects.set(ref, []);
	};

	/**
	 * Sets current state on a layer if possible, otherwise clears  current state
	 * @param {AnimationLayer} layer
	 * @param {string} name
	 */
	AnimationLayersHandler.prototype._setInitialState = function (layer, stateKey) {
		if (stateKey) {
			var state = layer.getStateById(stateKey);
			if (layer._currentState !== state) {
				layer.setCurrentStateById(stateKey, true);
			}
		} else {
			layer.setCurrentState();
		}
	};

	/**
	 * Adds/updates/removes the animation layers
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation state or null if removed
	 */
	AnimationLayersHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (object) {
			if(!object) { return; }
			var promises = [];

			var i = 0;
			_.forEach(config.layers, function (layerCfg) {
				promises.push(that._parseLayer(layerCfg, object[i++], options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (layers) {
				object.length = layers.length;
				for (var i = 0; i < layers.length; i++) {
					object[i] = layers[i];
				}
				return object;
			});
		});
	};

	/**
	 * Parses a single layer, puts the correct properties and {@link SteadyState} onto it
	 * @param {object} layerConfig
	 * @param {layer}
	 * @returns {RSVP.Promise} resolves with layer
	 * @private
	 */
	AnimationLayersHandler.prototype._parseLayer = function (layerConfig, layer, options) {
		var that = this;

		if (!layer) {
			layer = new AnimationLayer(layerConfig.name);
		} else {
			layer._name = layerConfig.name;
		}

		layer.id = layerConfig.id;
		layer._transitions = _.deepClone(layerConfig.transitions);

		if (layer._layerBlender) {
			if (layerConfig.blendWeight !== undefined) {
				layer._layerBlender._blendWeight = layerConfig.blendWeight;
			} else {
				layer._layerBlender._blendWeight = 1.0;
			}
		}

		// Load all the stuff we need
		var promises = [];
		_.forEach(layerConfig.states, function (stateCfg) {
			promises.push(that.loadObject(stateCfg.stateRef, options).then(function (state) {
				layer.setState(state.id, state);
			}));
		}, null, 'sortValue');

		// Populate layer
		return RSVP.all(promises).then(function () {
			that._setInitialState(layer, layerConfig.initialStateRef);
			return layer;
		});
	};

	return AnimationLayersHandler;
});

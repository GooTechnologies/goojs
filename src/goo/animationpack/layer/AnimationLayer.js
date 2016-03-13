var FadeTransitionState = require('../../animationpack/state/FadeTransitionState');
var SyncFadeTransitionState = require('../../animationpack/state/SyncFadeTransitionState');
var FrozenTransitionState = require('../../animationpack/state/FrozenTransitionState');
var SteadyState = require('../../animationpack/state/SteadyState');
var LayerLerpBlender = require('../../animationpack/layer/LayerLerpBlender');
var World = require('../../entities/World');
var MathUtils = require('../../math/MathUtils');

	/**
	 * Animation layers are essentially independent state machines, managed by a single AnimationManager. Each maintains a set of possible
	 *        "steady states" - main states that the layer can be in. The layer can only be in one state at any given time. It may transition between
	 *        states, provided that a path is defined for transition from the current state to the desired one. *
	 * @param {string} name Name of layer
	 * @param {string} id Id of layer
	 */
	function AnimationLayer(name, id) {
		this.id = id;
		this._name = name;

		this._steadyStates = {};
		this._currentState = null;
		this._layerBlender = new LayerLerpBlender();
		this._transitions = {};
		this._transitionStates = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';

	/**
	 * Get available states for layer
	 * @returns {Array<string>}
	 */
	AnimationLayer.prototype.getStates = function () {
		return Object.keys(this._steadyStates);
	};

	/**
	 * Add a state to the layer with the associated stateKey
	 * @param {string} stateKey
	 * @param {SteadyState} state
	 */
	AnimationLayer.prototype.setState = function (stateKey, state) {
		this._steadyStates[stateKey] = state;
	};

	/**
	 * Sets the blend weight of a layer. This will not affect the base
	 * layer in the animation component.
	 * @param {number} weight Should be between 0 and 1 and will be clamped
	 */
	AnimationLayer.prototype.setBlendWeight = function (weight) {
		if (this._layerBlender) {
			this._layerBlender._blendWeight = MathUtils.clamp(weight, 0, 1);
		}
	};

	/**
	 * Get available transitions for current State
	 * @returns {Array<string>}
	 */
	AnimationLayer.prototype.getTransitions = function () {
		var transitions;
		if (this._currentState) {
			transitions = Object.keys(this._currentState._transitions);
		} else {
			transitions = [];
		}
		if (this._transitions) {
			for (var key in this._transitions) {
				if (transitions.indexOf(key) === -1) {
					transitions.push(key);
				}
			}
		}
		transitions.sort();
		return transitions;
	};

	/**
	 * Does the updating before animations are applied
	 * @private
	 */
	AnimationLayer.prototype.update = function (globalTime) {
		if (this._currentState) {
			this._currentState.update(typeof globalTime !== 'undefined' ? globalTime : World.time);
		}
	};

	/**
	 * Does the updating after animations are applied
	 * @private
	 */
	AnimationLayer.prototype.postUpdate = function () {
		if (this._currentState) {
			this._currentState.postUpdate();
		}
	};

	/**
	 * Transition the layer to another state. The transition must be specified either on the state or on the layer (as a general transition), see FileFormat spec for more info
	 * @param {string} state
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} finishCallback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 * @returns {boolean} true if a transition was found and started
	 */
	AnimationLayer.prototype.transitionTo = function (state, globalTime, finishCallback) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		var cState = this._currentState;
		var transition;
		if (this._steadyStates[state] === cState) {
			return false;
		}
		if (!this._steadyStates[state]) {
			return false;
		}

		if (cState && cState._transitions) {
			transition = cState._transitions[state] || cState._transitions['*'];
		}
		if (!transition && this._transitions) {
			transition = this._transitions[state] || this._transitions['*'];
		}
		if (cState instanceof SteadyState && transition) {
			var transitionState = this._getTransitionByType(transition.type);
			this._doTransition(transitionState, cState, this._steadyStates[state], transition, globalTime, finishCallback);
			return true;
		} else if (!cState) {
			transition = this._transitions[state];
			if (transition) {
				var transitionState = this._getTransitionByType(transition.type);
				if (transitionState) {
					this._doTransition(transitionState, null, this._steadyStates[state], transition, globalTime, finishCallback);
					return true;
				}
			}
		}
		return false;
	};

	AnimationLayer.prototype._doTransition = function (transition, source, target, config, globalTime, finishCallback) {
		if (source) {
			transition._sourceState = source;
			var timeWindow = config.timeWindow || [-1, -1];
			if (!transition.isValid(timeWindow, globalTime)) {
				console.warn('State not in allowed time window');
				return;
			}
			source.onFinished = null;
		}
		transition._targetState = target;
		transition.readFromConfig(config);

		this.setCurrentState(transition, true, globalTime, finishCallback);
	};

	/**
	 * Sets the current state to the given state. Generally for transitional state use.
	 * @param {AbstractState} state our new state. If null, then no state is currently set on this layer.
	 * @param {boolean} [rewind=false] if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} finishCallback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 */
	AnimationLayer.prototype.setCurrentState = function (state, rewind, globalTime, finishCallback) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		this._currentState = state;
		if (state) {
			if (rewind) {
				state.resetClips(globalTime);
			}
			state.onFinished = function () {
				this.setCurrentState(state._targetState || null, false, undefined, finishCallback);
				if (state instanceof SteadyState && finishCallback instanceof Function) {
					finishCallback();
				}
				this.update();
			}.bind(this);
		}
	};

	/**
	 * Get the current state
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getCurrentState = function () {
		return this._currentState;
	};

	/**
	 * Set the current state by state id.
	 * @param {string} id
	 * @param {boolean} [rewind=false] if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} callback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 */
	AnimationLayer.prototype.setCurrentStateById = function (id, rewind, globalTime, callback) {
		var state = this.getStateById(id);
		this.setCurrentState(state, rewind, globalTime, callback);
	};

	/**
	 * Get the current state by id.
	 * @param {string} id
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getStateById = function (id) {
		return this._steadyStates[id];
	};

	/**
	 * Get the current state by name.
	 * @param {string} name
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getStateByName = function (name) {
		for (var id in this._steadyStates) {
			var state = this._steadyStates[id];
			if (state._name === name) {
				return this._steadyStates[id];
			}
		}
	};

	/**
	 * Force the current state of the machine to the state with the given name.
	 * @param {AbstractState} stateName the name of our state. If null, or is not present in this state machine, the current state is not changed.
	 * @param {boolean} rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @returns {boolean} true if succeeds
	 */
	AnimationLayer.prototype.setCurrentStateByName = function (stateName, rewind, globalTime) {
		if (stateName) {
			var state = this.getStateByName(stateName);
			if (state) {
				this.setCurrentState(state, rewind, globalTime);
				return true;
			} else {
				console.warn('unable to find SteadyState named: ' + stateName);
			}
		}
		return false;
	};

	/**
	 * @returns a source data mapping for the channels involved in the current state/transition of this layer.
	 */
	AnimationLayer.prototype.getCurrentSourceData = function () {
		if (this._layerBlender) {
			return this._layerBlender.getBlendedSourceData();
		}

		if (this._currentState) {
			return this._currentState.getCurrentSourceData();
		} else {
			return null;
		}
	};
	/**
	 * Update the layer blender in this animation layer to properly point to the previous layer.
	 * @param {Object} previousLayer the layer before this layer in the animation manager.
	 * @private
	 */
	AnimationLayer.prototype.updateLayerBlending = function (previousLayer) {
		if (this._layerBlender) {
			this._layerBlender._layerA = previousLayer;
			this._layerBlender._layerB = this;
		}
	};

	/**
	 * Set the currently playing state on this layer to null.
	 */
	AnimationLayer.prototype.clearCurrentState = function () {
		this.setCurrentState(null);
	};

	AnimationLayer.prototype.resetClips = function (globalTime) {
		if (this._currentState) {
			this._currentState.resetClips(typeof globalTime !== 'undefined' ? globalTime : World.time);
		}
	};

	AnimationLayer.prototype.shiftClipTime = function (shiftTime) {
		if (this._currentState) {
			this._currentState.shiftClipTime(typeof shiftTime !== 'undefined' ? shiftTime : 0);
		}
	};

	AnimationLayer.prototype.setTimeScale = function (timeScale) {
		if (this._currentState) {
			this._currentState.setTimeScale(timeScale);
		}
	};

	AnimationLayer.prototype._getTransitionByType = function (type) {
		if (this._transitionStates[type]) { return this._transitionStates[type]; }
		var transition;
		switch (type) {
			case 'Fade':
				transition = new FadeTransitionState();
				break;
			case 'SyncFade':
				transition = new SyncFadeTransitionState();
				break;
			case 'Frozen':
				transition = new FrozenTransitionState();
				break;
			default:
				console.log('Defaulting to frozen transition type');
				transition = new FrozenTransitionState();
		}
		return this._transitionStates[type] = transition;
	};

	/**
	 * @returns {AnimationLayer}
	 */
	AnimationLayer.prototype.clone = function () {
		var cloned = new AnimationLayer(this._name);


		for (var key in this._steadyStates) {
			cloned._steadyStates[key] = this._steadyStates[key].clone();
			if (this._steadyStates[key] === this._currentState) {
				cloned._currentState = cloned._steadyStates[key];
			}
		}

		for (var key in this._transitions) {
			cloned._transitions[key] = this._transitions[key];
		}

		for (var key in this._transitionStates) {
			cloned._transitionStates[key] = new this._transitionStates[key].constructor();
		}

		return cloned;
	};

	module.exports = AnimationLayer;
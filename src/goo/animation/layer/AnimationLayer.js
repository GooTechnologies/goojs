define([
	'goo/animation/state/SteadyState',
	'goo/entities/World'
],
/** @lends */
function (
	SteadyState,
	World
) {
	"use strict";

	/**
	 * @class Animation layers are essentially independent state machines, managed by a single AnimationManager. Each maintains a set of possible
	 *        "steady states" - main states that the layer can be in. The layer can only be in one state at any given time. It may transition between
	 *        states, provided that a path is defined for transition from the current state to the desired one. *
	 * @param {String} name Name of layer
	 */
	function AnimationLayer (name) {
		this._name = name;

		this._steadyStates = {};
		this._currentState = null;
		this._layerBlender = null;
		this._transitions = {};
		this._transitionStates = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';


	/*
	 * Does the updating before animations are applied
	 */
	AnimationLayer.prototype.update = function(globalTime) {
		if(this._currentState) {
			this._currentState.update(globalTime || World.time);
		}
	};

	/*
	 * Does the updating after animations are applied
	 */
	AnimationLayer.prototype.postUpdate = function() {
		if (this._currentState) {
			this._currentState.postUpdate();
		}
	};

	/**
	 * Transition the layer to another state. The transition must be specified either on the state or on the layer (as a general transition), see FileFormat spec for more info
	 * @param {string} state
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 */
	AnimationLayer.prototype.transitionTo = function(state, globalTime) {
		globalTime = globalTime || World.time;
		var cState = this._currentState;
		var transition;
		if (cState && cState._transitions) {
			transition = cState._transitions[state] || cState._transitions['*'];
		}
		if(!transition && this._transitions) {
			transition = this._transitions[state] || this._transitions['*'];
		}
		if (cState instanceof SteadyState && transition) {
			var transitionState = this._transitionStates[transition.type];
			this._doTransition(transitionState, cState, this._steadyStates[state], transition, globalTime);
			return;
		} else if (!cState) {
			transition = this._transitions[state];
			if(transition) {
				var transitionState = this._transitionStates[transition.type];
				if (transitionState) {
					this._doTransition(transitionState, null, this._steadyStates[state], transition, globalTime);
					return;
				}
			}
		}
		console.warn('No transition performed');
	};

	AnimationLayer.prototype._doTransition = function(transition, source, target, config, globalTime) {
		if(source) {
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
		transition.resetClips(globalTime);

		this.setCurrentState(transition);
	};

	/**
	 * Sets the current state to the given state. Generally for transitional state use.
	 * @param {AbstractState} state our new state. If null, then no state is currently set on this layer.
	 * @param {boolean} [rewind=false] if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 */
	AnimationLayer.prototype.setCurrentState = function (state, rewind, globalTime) {
		globalTime = globalTime || World.time;
		this._currentState = state;
		if (state) {
			if (rewind) {
				state.resetClips(globalTime);
			}
			state.onFinished = function() {
				this.setCurrentState(state._targetState || null);
				this.update();
			}.bind(this);
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
			var state = this._steadyStates[stateName];
			if (state) {
				this.setCurrentState(state, rewind, globalTime);
				return true;
			} else {
				console.warn("unable to find SteadyState named: " + stateName);
			}
		}
		return false;
	};

	/*
	 * @return a source data mapping for the channels involved in the current state/transition of this layer.
	 */
	AnimationLayer.prototype.getCurrentSourceData = function () {
		if (this._layerBlender !== null) {
			return this._layerBlender.getBlendedSourceData();
		}

		if (this._currentState !== null) {
			return this._currentState.getCurrentSourceData();
		} else {
			return null;
		}
	};
	/*
	 * Update the layer blender in this animation layer to properly point to the previous layer.
	 * @param previousLayer the layer before this layer in the animation manager.
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

	return AnimationLayer;
});
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
	 * @property {String} name Name of layer
	 */
	function AnimationLayer (name) {
		this._name = name;

		this._steadyStates = {};
		this._currentState = null;
		this._layerBlender = null;
		this._transitions = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';


	AnimationLayer.prototype.update = function(globalTime) {
		if(this._currentState) {
			this._currentState.update(globalTime || World.time);
		}
	};

	AnimationLayer.prototype.postUpdate = function() {
		if (this._currentState) {
			this._currentState.update();
		}
	};

	/**
	 * @description Attempt to perform a transition. First, check the current state to see if it has a transition for the given key. If not, check
	 *              this layer for a general purpose transition. If no transition is found, this does nothing.
	 * @param key the transition key, a string key used to look up a transition in the current animation state.
	 * @return true if there is a current state and we were able to do the given transition.
	 */
	AnimationLayer.prototype.doTransition = function (key, globalTime) {
		globalTime = globalTime || World.time;
		var state = this._currentState;
		// see if current state has a transition
		if (state instanceof SteadyState) {
			var nextState = state.doTransition(key, globalTime);
			if (!nextState) {
				// no transition found, check if there is a global transition
				var transition = this._transitions[key];
				if (!transition) {
					transition = this._transitions['*'];
				}
				if (transition) {
					nextState = transition.doTransition(state, globalTime);
				}
			}

			if (nextState) {
				if (nextState !== state) {
					this.setCurrentState(nextState, false);
					return true;
				}
			}
		} else if (!state) {
			// check if there is a global transition
			var transition = this._transitions[key];
			if (!transition) {
				transition = this._transitions['*'];
			}
			if (transition) {
				this.setCurrentState(transition.doTransition(state, globalTime), true);
				return true;
			}
		}

		// no transition found
		return false;
	};

	/**
	 * @description Sets the current finite state to the given state. Generally for transitional state use.
	 * @param state our new state. If null, then no state is currently set on this layer.
	 * @param rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 */
	AnimationLayer.prototype.setCurrentState = function (state, rewind, globalTime) {
		globalTime = globalTime || World.time;
		this._currentState = state;
		if (state) {
			state._lastOwner = this;
			if (rewind) {
				state.resetClips(globalTime);
			}
		}
	};

	/**
	 * @description Force the current state of the machine to the steady state with the given name. Used to set the FSM's initial state.
	 * @param stateName the name of our state. If null, or is not present in this state machine, the current state is not changed.
	 * @param rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @return true if succeeds
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

	/**
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
	/**
	 * @description Update the layer blender in this animation layer to properly point to the previous layer.
	 * @param previousLayer the layer before this layer in the animation manager.
	 */
	AnimationLayer.prototype.updateLayerBlending = function (previousLayer) {
		if (this._layerBlender) {
			this._layerBlender._layerA = previousLayer;
			this._layerBlender._layerB = this;
		}
	};

	/**
	 * @description Set the currently playing state on this layer to null.
	 */
	AnimationLayer.prototype.clearCurrentState = function () {
		this.setCurrentState(null, false);
	};

	AnimationLayer.prototype.replaceState = function (currentState, newState) {
		if (this._currentState === currentState) {
			this.setCurrentState(newState, false);
		}
	};

	return AnimationLayer;
});
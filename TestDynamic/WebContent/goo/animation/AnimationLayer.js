define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name AnimationLayer
	 * @class Animation layers are essentially independent state machines, managed by a single AnimationManager. Each maintains a set of possible
	 *        "steady states" - main states that the layer can be in. The layer can only be in one state at any given time. It may transition between
	 *        states, provided that a path is defined for transition from the current state to the desired one. *
	 * @param {String} name Name of layer
	 * @property {String} name Name of layer
	 */
	function AnimationLayer(name) {
		this.name = name;

		this.steadyStates = {};
		this.currentState = null;
		this.manager = null;
		this.layerBlender = null;
		this.transitions = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';

	/**
	 * Attempt to perform a transition. First, check the current state to see if it has a transition for the given key. If not, check this layer for a
	 * general purpose transition. If no transition is found, this does nothing.
	 * 
	 * @param key the transition key, a string key used to look up a transition in the current animation state.
	 * @return true if there is a current state and we were able to do the given transition.
	 */
	AnimationLayer.prototype.doTransition = function(key) {
		var state = this.currentState;
		// see if current state has a transition
		if (state instanceof SteadyState) {
			var nextState = state.doTransition(key, this);
			if (nextState === null) {
				// no transition found, check if there is a global transition
				var transition = this.transitions[key];
				if (transition === null) {
					transition = this.transitions['*'];
				}
				if (transition !== null) {
					nextState = transition.doTransition(state, this);
				}
			}

			if (nextState !== null) {
				if (nextState !== state) {
					setCurrentState(nextState, false);
					return true;
				}
			}
		} else if (state === null) {
			// check if there is a global transition
			var transition = this.transitions[key];
			if (transition === null) {
				transition = this.transitions['*'];
			}
			if (transition !== null) {
				setCurrentState(transition.doTransition(state, this), true);
				return true;
			}
		}

		// no transition found
		return false;
	};

	/**
	 * Sets the current finite state to the given state. Generally for transitional state use.
	 * 
	 * @param state our new state. If null, then no state is currently set on this layer.
	 * @param rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 */
	AnimationLayer.prototype.setCurrentState = function(state, rewind) {
		this.currentState = state;
		if (state) {
			state._lastOwner = this;
			if (rewind) {
				state._globalStartTime = this.manager.globalTimer.getTimeInSeconds();
			}
		}
	};

	/**
	 * Force the current state of the machine to the steady state with the given name. Used to set the FSM's initial state.
	 * 
	 * @param stateName the name of our state. If null, or is not present in this state machine, the current state is not changed.
	 * @param rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @return true if succeeds
	 */
	AnimationLayer.prototype.setCurrentStateByName = function(stateName, rewind) {
		if (stateName) {
			var state = this.steadyStates[stateName];
			if (state) {
				this.setCurrentState(state, rewind);
				return true;
			} else {
				console.warn("unable to find SteadyState named: " + stateName);
			}
		}
		return false;
	};

	AnimationLayer.prototype.getCurrentSourceData = function() {
		if (this.layerBlender !== null) {
			return this.layerBlender.getBlendedSourceData(this.manager);
		}

		if (this.currentState !== null) {
			return this.currentState.getCurrentSourceData(this.manager);
		} else {
			return null;
		}
	};

	AnimationLayer.prototype.replaceState = function(currentState, newState) {
		if (this.currentState === currentState) {
			this.setCurrentState(newState, false);
		}
	};

	return AnimationLayer;
});
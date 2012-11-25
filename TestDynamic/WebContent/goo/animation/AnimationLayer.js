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
			if (nextState == null) {
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
			if (transition == null) {
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

	return AnimationLayer;
});
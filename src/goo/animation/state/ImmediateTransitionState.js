define(['goo/animation/state/AbstractTransitionState'],
	/** @lends ImmediateTransitionState */
	function (AbstractTransitionState) {
	"use strict";

	/**
	 * @class Cuts directly to the set target state, without any intermediate transition action.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 */
	function ImmediateTransitionState(targetState) {
		AbstractTransitionState.call(this, targetState);
	}

	ImmediateTransitionState.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Do the transition logic for this transition state.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */
	ImmediateTransitionState.prototype.getTransitionState = function (callingState, layer) {
		// Pull our state from the layer
		var state = layer._steadyStates[this._targetState];
		if (!state) {
			return null;
		}
		// Reset to start
		state.resetClips(layer._manager);
		// return state.
		return state;
	};

	ImmediateTransitionState.prototype.update = function (globalTime, layer) {
	};

	ImmediateTransitionState.prototype.getCurrentSourceData = function (manager) {
		return {};
	};

	ImmediateTransitionState.prototype.postUpdate = function (layer) {
	};

	return ImmediateTransitionState;
});
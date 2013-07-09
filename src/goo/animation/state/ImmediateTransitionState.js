define(['goo/animation/state/AbstractTransitionState'],
/** @lends */
function (AbstractTransitionState) {
	"use strict";

	/**
	 * @class Cuts directly to the set target state, without any intermediate transition action.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 */
	function ImmediateTransitionState (targetState) {
		AbstractTransitionState.call(this, targetState);
	}

	ImmediateTransitionState.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Do the transition logic for this transition state.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */
	ImmediateTransitionState.prototype.getTransitionState = function (callingState, globalTime) {
		// Pull our state from the layer
		var state = this._targetState;
		if (!state) {
			return null;
		}
		// Reset to start
		state.resetClips(globalTime);
		// return state.
		return state;
	};

	// Was: function (globalTime, layer)
	ImmediateTransitionState.prototype.update = function () {
	};

	// Was: function (manager)
	ImmediateTransitionState.prototype.getCurrentSourceData = function () {
		return {};
	};

	// Was: function (layer)
	ImmediateTransitionState.prototype.postUpdate = function () {
	};

	return ImmediateTransitionState;
});
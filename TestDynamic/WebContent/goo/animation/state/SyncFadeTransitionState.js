define(['goo/animation/state/FadeTransitionState'], function(FadeTransitionState) {
	"use strict";

	SyncFadeTransitionState.prototype = Object.create(FadeTransitionState.prototype);

	/**
	 * @name SyncFadeTransitionState
	 * @class A transition that blends over a given time from one animation state to another, synchronizing the target state to the initial state's
	 *        start time. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function SyncFadeTransitionState(targetState, fadeTime, blendType) {
		FadeTransitionState.call(this, targetState, fadeTime, blendType);
	}

	/**
	 * @description Do the transition logic for this transition state.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */
	SyncFadeTransitionState.prototype.getTransitionState = function(callingState, layer) {
		// grab current time as our start
		this._start = layer._manager.getCurrentGlobalTime();
		// set "current" start state
		this.setStateA(callingState);
		// set "target" end state
		this.setStateB(layer._steadyStates[this._targetState]);
		if (!this._stateB) {
			return null;
		}
		// grab current state's start time and set on end state
		this._stateB.resetClips(layer._manager, this._stateA._globalStartTime);
		return this;
	};

	return SyncFadeTransitionState;
});
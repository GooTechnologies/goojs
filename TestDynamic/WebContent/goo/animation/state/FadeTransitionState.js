define(['goo/animation/state/AbstractTwoStateLerpTransition'], function(AbstractTwoStateLerpTransition) {
	"use strict";

	FadeTransitionState.prototype = Object.create(AbstractTwoStateLerpTransition.prototype);

	/**
	 * @name FadeTransitionState
	 * @class A transition that blends over a given time from one animation state to another, beginning the target clip from local time 0 at the start
	 *        of the transition. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function FadeTransitionState(targetState, fadeTime, blendType) {
		AbstractTwoStateLerpTransition.call(this, targetState, fadeTime, blendType);
	}

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.update = function(globalTime, layer) {
		AbstractTwoStateLerpTransition.prototype.update.call(this, globalTime, layer);

		// update both of our states
		if (this._stateA != null) {
			this._stateA.update(globalTime, layer);
		}
		if (this._stateB != null) {
			this._stateB.update(globalTime, layer);
		}
	};

	/**
	 * @description Do the transition logic for this transition state.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */
	FadeTransitionState.prototype.getTransitionState = function(callingState, layer) {
		// grab current time as our start
		this._start = layer._manager.getCurrentGlobalTime();
		// set "current" start state
		setStateA(callingState);
		// set "target" end state
		setStateB(layer._steadyStates[this._targetState]);
		if (!this._stateB) {
			return null;
		}
		// restart end state.
		this._stateB.resetClips(layer._manager, this._start);
		return this;
	};

	/**
	 * @description Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.postUpdate = function(layer) {
		// post update both of our states
		if (this._stateA != null) {
			this._stateA.postUpdate(layer);
		}
		if (this._stateB != null) {
			this._stateB.postUpdate(layer);
		}
	};

	return FadeTransitionState;
});
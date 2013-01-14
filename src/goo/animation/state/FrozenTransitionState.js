define(['goo/animation/state/AbstractTwoStateLerpTransition'],
	/** @lends FrozenTransitionState */
	function (AbstractTwoStateLerpTransition) {
	"use strict";

	/**
	 * @class A two state transition that freezes the starting state at its current position and blends that over time with a target state. The target
	 *        state moves forward in time during the blend as normal.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function FrozenTransitionState(targetState, fadeTime, blendType) {
		AbstractTwoStateLerpTransition.call(this, targetState, fadeTime, blendType);
	}

	FrozenTransitionState.prototype = Object.create(AbstractTwoStateLerpTransition.prototype);

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	FrozenTransitionState.prototype.update = function (globalTime, layer) {
		AbstractTwoStateLerpTransition.prototype.update.call(this, globalTime, layer);

		// update only the B state - the first is frozen
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
	FrozenTransitionState.prototype.getTransitionState = function (callingState, layer) {
		// grab current time as our start
		this._start = layer._manager.getCurrentGlobalTime();
		// set "frozen" start state
		this.setStateA(callingState);
		// set "target" end state
		this.setStateB(layer._steadyStates[this._targetState]);
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
	FrozenTransitionState.prototype.postUpdate = function (layer) {
		// update only the B state - the first is frozen
		if (this._stateB != null) {
			this._stateB.postUpdate(layer);
		}
	};

	return FrozenTransitionState;
});
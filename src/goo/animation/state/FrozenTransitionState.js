define(['goo/animation/state/AbstractTransitionState'],
/** @lends */
function (AbstractTransitionState) {
	"use strict";

	/**
	 * @class A two state transition that freezes the starting state at its current position and blends that over time with a target state. The target
	 *        state moves forward in time during the blend as normal.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function FrozenTransitionState () {
		AbstractTransitionState.call(this);
	}

	FrozenTransitionState.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	FrozenTransitionState.prototype.update = function (globalTime) {
		AbstractTransitionState.prototype.update.call(this, globalTime);

		// update only the B state - the first is frozen
		if (this._targetState !== null) {
			this._targetState.update(globalTime);
		}
	};

	/**
	 * @description Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */
	FrozenTransitionState.prototype.postUpdate = function () {
		// update only the B state - the first is frozen
		if (this._targetState !== null) {
			this._targetState.postUpdate();
		}
	};

	FrozenTransitionState.prototype.resetClips = function(globalTime) {
		AbstractTransitionState.prototype.resetClips.call(this, globalTime);
		this._targetState.resetClips(globalTime);
	};

	return FrozenTransitionState;
});
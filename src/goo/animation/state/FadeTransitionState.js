define(['goo/animation/state/AbstractTransitionState'],
/** @lends */
function (AbstractTransitionState) {
	"use strict";

	/**
	 * @class A transition that blends over a given time from one animation state to another, beginning the target clip from local time 0 at the start
	 *        of the transition. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function FadeTransitionState () {
		AbstractTransitionState.call(this);
	}

	FadeTransitionState.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.update = function (globalTime) {
		AbstractTransitionState.prototype.update.call(this, globalTime);

		// update both of our states
		if (this._sourceState !== null) {
			this._sourceState.update(globalTime);
		}
		if (this._targetState !== null) {
			this._targetState.update(globalTime);
		}
	};

	/**
	 * @description Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.postUpdate = function () {
		// post update both of our states
		if (this._targetState !== null) {
			this._targetState.postUpdate();
		}
		if (this._targetState !== null) {
			this._targetState.postUpdate();
		}
	};

	FadeTransitionState.prototype.resetClips = function(globalTime) {
		AbstractTransitionState.prototype.resetClips.call(this, globalTime);
		if(this._targetState !== null) {
			this._targetState.resetClips(globalTime);
		}
	};

	return FadeTransitionState;
});
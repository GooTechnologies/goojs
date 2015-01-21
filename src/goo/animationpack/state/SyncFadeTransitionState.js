define([
	'goo/animationpack/state/FadeTransitionState'
], function (
	FadeTransitionState
) {
	'use strict';

	/**
	 * A transition that blends over a given time from one animation state to another, synchronizing the target state to the initial state's start time. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function SyncFadeTransitionState() {
		FadeTransitionState.call(this);
	}

	SyncFadeTransitionState.prototype = Object.create(FadeTransitionState.prototype);
	SyncFadeTransitionState.prototype.constructor = SyncFadeTransitionState;

	SyncFadeTransitionState.prototype.resetClips = function(globalTime) {
		FadeTransitionState.prototype.resetClips.call(this, globalTime);
		this._targetState.resetClips(this._sourceState._globalStartTime);
	};

	SyncFadeTransitionState.prototype.shiftClipTime = function(shiftTime) {
		FadeTransitionState.prototype.shiftClipTime.call(this, shiftTime);
		this._targetState.shiftClipTime(this._sourceState._globalStartTime + shiftTime);
		this._sourceState.shiftClipTime(shiftTime);
	};

	return SyncFadeTransitionState;
});
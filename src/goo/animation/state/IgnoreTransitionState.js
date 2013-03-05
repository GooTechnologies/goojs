define(['goo/animation/state/AbstractTransitionState'],
/** @lends IgnoreTransitionState */
function (AbstractTransitionState) {
	"use strict";

	/**
	 * @class Dummy transition - does not change current state.
	 */
	function IgnoreTransitionState () {
		AbstractTransitionState.call(this, null);
	}

	IgnoreTransitionState.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */

	// Was: function (globalTime, layer)
	IgnoreTransitionState.prototype.update = function () {
	};

	/**
	 * @description Do the transition logic for this transition state.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */

	// Was: function (callingState, layer)
	IgnoreTransitionState.prototype.getTransitionState = function (callingState) {
		// return calling state.
		return callingState;
	};

	// Was: function (manager)
	IgnoreTransitionState.prototype.getCurrentSourceData = function () {
		// ignored
		return null;
	};

	/**
	 * @description Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */

	// Was: function (layer)
	IgnoreTransitionState.prototype.postUpdate = function () {
	};

	return IgnoreTransitionState;
});
define(['goo/animation/state/AbstractFiniteState'],
/** @lends */
function (AbstractFiniteState) {
	"use strict";

	/**
	 * @class A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for
	 *        example.)
	 * @param {String} name Name of state
	 * @property {String} name Name of state
	 */
	function SteadyState (name) {
		AbstractFiniteState.call(this);

		this._name = name;
		this._transitions = {};
		this._endTransition = null;
		this._sourceTree = null;
	}

	SteadyState.prototype = Object.create(AbstractFiniteState.prototype);

	SteadyState.prototype.doTransition = function (key, globalTime) {
		var state = this._transitions[key];
		if (!state) {
			state = this._transitions["*"];
		} else {
			return state.doTransition(this, globalTime);
		}
		return null;
	};

	SteadyState.prototype.update = function (globalTime) {
		if (!this._sourceTree.setTime(globalTime)) {
			var lastOwner = this._lastOwner;
			if (this._endTransition !== null) {
				// time to move to end transition
				var newState = this._endTransition.doTransition(this, globalTime);
				if (newState) {
					newState.resetClips(globalTime);
					newState.update(globalTime);
				}
				if (this !== newState) {
					lastOwner.replaceState(this, newState);
				}
			}
		}
	};

	SteadyState.prototype.postUpdate = function () {
		if (!this._sourceTree.isActive()) {
			var lastOwner = this._lastOwner;
			if (this._endTransition === null) {
				// we're done. end.
				lastOwner.replaceState(this, null);
			}
		}
	};

	SteadyState.prototype.getCurrentSourceData = function () {
		return this._sourceTree.getSourceData();
	};

	SteadyState.prototype.resetClips = function (globalStartTime) {
		AbstractFiniteState.prototype.resetClips.call(this, globalStartTime);
		this._sourceTree.resetClips(globalStartTime);
	};

	return SteadyState;
});
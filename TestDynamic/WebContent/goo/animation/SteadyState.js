define(function() {
	"use strict";

	/**
	 * @name SteadyState
	 * @class A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for
	 *        example.)
	 * @param {String} name Name of state
	 * @property {String} name Name of state
	 */
	function SteadyState(name) {
		this.name = name;

		this._transitions = {};
		this._endTransition = null;
		this._sourceTree = null;
	}

	return SteadyState;
});
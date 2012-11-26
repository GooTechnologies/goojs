define(['goo/animation/AbstractFiniteState'], function(AbstractFiniteState) {
	"use strict";

	SteadyState.prototype = Object.create(AbstractFiniteState.prototype);

	/**
	 * @name SteadyState
	 * @class A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for
	 *        example.)
	 * @param {String} name Name of state
	 * @property {String} name Name of state
	 */
	function SteadyState(name) {
		AbstractFiniteState.call(this);

		this.name = name;

		this._transitions = {};
		this._endTransition = null;
		this._sourceTree = null;
	}

	SteadyState.prototype.update = function(globalTime, layer) {
		if (!this._sourceTree.setTime(globalTime, layer.manager)) {
			var lastOwner = this.getLastStateOwner();
			if (this._endTransition != null) {
				// time to move to end transition
				var newState = this._endTransition.doTransition(this, layer);
				if (newState != null) {
					newState.resetClips(layer.getManager());
					newState.update(globalTime, layer);
				}
				if (this !== newState) {
					lastOwner.replaceState(this, newState);
				}
			}
		}
	}

	return SteadyState;
});
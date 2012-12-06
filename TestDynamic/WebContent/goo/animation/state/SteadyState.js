define(['goo/animation/state/AbstractFiniteState'], function(AbstractFiniteState) {
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

		this._name = name;
		this._transitions = {};
		this._endTransition = null;
		this._sourceTree = null;
	}

	SteadyState.prototype.doTransition = function(key, layer) {
		var state = this._transitions[key];
		if (!state) {
			state = this._transitions["*"];
		} else {
			return state.doTransition(this, layer);
		}
		return null;
	};

	SteadyState.prototype.update = function(globalTime, layer) {
		if (!this._sourceTree.setTime(globalTime, layer._manager)) {
			var lastOwner = this._lastOwner;
			if (this._endTransition !== null) {
				// time to move to end transition
				var newState = this._endTransition.doTransition(this, layer);
				if (newState) {
					newState.resetClips(layer.getManager());
					newState.update(globalTime, layer);
				}
				if (this !== newState) {
					lastOwner.replaceState(this, newState);
				}
			}
		}
	};

	SteadyState.prototype.postUpdate = function(layer) {
		if (!this._sourceTree.isActive(layer._manager)) {
			var lastOwner = this._lastOwner;
			if (this._endTransition === null) {
				// we're done. end.
				lastOwner.replaceState(this, null);
			}
		}
	};

	SteadyState.prototype.getCurrentSourceData = function(manager) {
		return this._sourceTree.getSourceData(manager);
	};

	SteadyState.prototype.resetClips = function(manager, globalStartTime) {
		AbstractFiniteState.prototype.resetClips.call(this, manager, globalStartTime);
		this._sourceTree.resetClips(manager, this._globalStartTime);
	};

	return SteadyState;
});
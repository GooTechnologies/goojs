define(['goo/animation/state/AbstractTransitionState', 'goo/animation/state/StateBlendType', 'goo/animation/blendtree/BinaryLERPSource',
		'goo/math/MathUtils'],
/** @lends AbstractTwoStateLerpTransition */
function (AbstractTransitionState, StateBlendType, BinaryLERPSource, MathUtils) {
	"use strict";

	/**
	 * @class An abstract transition state that blends between two other states.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function AbstractTwoStateLerpTransition (targetState, fadeTime, blendType) {
		AbstractTransitionState.call(this, targetState);

		// The length of time for the transition.
		this._fadeTime = fadeTime;

		// The method to use in determining how much of each state to use based on the current time of the transition.
		this._type = blendType;

		// A percentage value of how much of each state to blend for our final result, generated based on time and blend type.
		this._percent = 0;

		// The global time when the transition started.
		this._start = 0;

		// Our initial or start state.
		this._stateA = null;

		// Our target or end state.
		this._stateB = null;

		// The blended source data.
		this._sourceData = null;
	}

	AbstractTwoStateLerpTransition.prototype = Object.create(AbstractTransitionState.prototype);

	/**
	 * @description Sanity checking setter for stateA.
	 * @param stateA sets the start state. Updates the state's owner to point to this transition.
	 */
	AbstractTwoStateLerpTransition.prototype.setStateA = function (stateA) {
		if (stateA === this) {
			throw new Error("Can not set state A to self.");
		}
		this._stateA = stateA;
		if (this._stateA !== null) {
			this._stateA._lastOwner = this;
		}

		// clear the _sourceData, the new state probably has different transform data
		if (this._sourceData) {
			// NB: assumes no one has a reference to this map already.
			this._sourceData = {};
		}
	};

	/**
	 * @description Sanity checking setter for stateB.
	 * @param stateA sets the start state. Updates the state's owner to point to this transition.
	 */
	AbstractTwoStateLerpTransition.prototype.setStateB = function (stateB) {
		if (stateB === this) {
			throw new Error("Can not set state B to self.");
		}
		this._stateB = stateB;
		if (this._stateB !== null) {
			this._stateB._lastOwner = this;
		}

		// clear the _sourceData, the new state probably has different transform data
		if (this._sourceData) {
			// NB: assumes no one has a reference to this map already.
			this._sourceData = {};
		}
	};

	/**
	 * @description Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	AbstractTwoStateLerpTransition.prototype.update = function (globalTime, layer) {
		var currentTime = globalTime - this._start;

		// if we're outside the fade time...
		if (currentTime > this._fadeTime) {
			// transition over to end state
			this._lastOwner.replaceState(this, this._stateB);
			return;
		}

		// figure out our weight using time, total time and fade type
		var percent = currentTime / this._fadeTime;

		switch (this._blendType) {
			case StateBlendType.SCurve3:
				this._percent = MathUtils.scurve3(percent);
				break;
			case StateBlendType.SCurve5:
				this._percent = MathUtils.scurve5(percent);
				break;
			case StateBlendType.Linear:
				this._percent = percent;
				break;
			default:
				this._percent = percent;
		}
	};

	/**
	 * @return the current map of source channel data for this layer.
	 */
	AbstractTwoStateLerpTransition.prototype.getCurrentSourceData = function (manager) {
		// grab our data maps from the two states
		var sourceAData = this._stateA ? this._stateA.getCurrentSourceData(manager) : null;
		var sourceBData = this._stateB ? this._stateB.getCurrentSourceData(manager) : null;

		// reuse previous _sourceData transforms to avoid re-creating
		// too many new transform data objects. This assumes that a
		// same state always returns the same transform data objects.
		if (!this._sourceData) {
			this._sourceData = {};
		}
		return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this._percent, this._sourceData);
	};

	/**
	 * @return the current map of source channel data for this layer.
	 */
	AbstractTwoStateLerpTransition.prototype.getCurrentSourceData = function (manager) {
		// grab our data maps from the two states
		var sourceAData = this._stateA ? this._stateA.getCurrentSourceData(manager) : null;
		var sourceBData = this._stateB ? this._stateB.getCurrentSourceData(manager) : null;

		// reuse previous _sourceData transforms to avoid re-creating
		// too many new transform data objects. This assumes that a
		// same state always returns the same transform data objects.
		if (!this._sourceData) {
			this._sourceData = {};
		}
		return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this._percent, this._sourceData);
	};

	/**
	 * @description Replace the given current state with the given new state
	 * @param currentState the state to replace
	 * @param newState the state to replace it with.
	 */
	AbstractTwoStateLerpTransition.prototype.replaceState = function (currentState, newState) {
		if (newState !== null) {
			if (this._stateA === currentState) {
				this._stateA = newState;
			} else if (this._stateB === currentState) {
				this._stateB = newState;
			}
		}
	};

	return AbstractTwoStateLerpTransition;
});
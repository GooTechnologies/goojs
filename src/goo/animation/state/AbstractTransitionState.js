define(['goo/animation/state/AbstractFiniteState'], function (AbstractFiniteState) {
	"use strict";

	/**
	 * @name AbstractTransitionState
	 * @class Base class for transition states - states responsible for moving between other finite states.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 */
	function AbstractTransitionState(targetState) {
		AbstractFiniteState.call(this);

		// the name of the steady state we want the Animation Layer to be in at the end of the transition.
		this._targetState = targetState;

		// start window value. If greater than 0, this transition is only valid if the current time is >= startWindow. Note that animations are
		// separate from states, so time scaling an animation will not affect transition windows directly and must be factored into the start/end
		// values.
		this._startWindow = -1;

		// end window value. If greater than 0, this transition is only valid if the current time is <= endWindow. Note that animations are separate
		// from states, so time scaling an animation will not affect transition windows directly and must be factored into the start/end values.
		this._endWindow = -1;
	}

	AbstractTransitionState.prototype = Object.create(AbstractFiniteState.prototype);

	/**
	 * @description Request that this state perform a transition to another.
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the new state to transition to. May be null if the transition was not possible or was ignored for some reason.
	 */
	AbstractTransitionState.prototype.doTransition = function (callingState, layer) {
		if (!layer._currentState) {
			return null;
		}
		var time = layer._manager.getCurrentGlobalTime() - layer._currentState._globalStartTime;
		if (this.isInTimeWindow(time)) {
			return this.getTransitionState(callingState, layer);
		} else {
			return null;
		}
	};

	AbstractTransitionState.prototype.isInTimeWindow = function (localTime) {
		if (this._startWindow <= 0) {
			if (this._endWindow <= 0) {
				// no window, so true
				return true;
			} else {
				// just check end
				return localTime <= this._endWindow;
			}
		} else {
			if (this._endWindow <= 0) {
				// just check start
				return localTime >= this._startWindow;
			} else if (this._startWindow <= this._endWindow) {
				// check between start and end
				return this._startWindow <= localTime && localTime <= this._endWindow;
			} else {
				// start is greater than end, so there are two windows.
				return localTime >= this._startWindow || localTime <= this._endWindow;
			}
		}
	};

	/**
	 * @description Do the transition logic for this transition state. (override in subclass)
	 * @param callingState the state calling for this transition.
	 * @param layer the layer our state belongs to.
	 * @return the state to transition to. Often ourselves.
	 */
	AbstractTransitionState.prototype.getTransitionState = function (callingState, layer) {
		return null;
	};

	return AbstractTransitionState;
});
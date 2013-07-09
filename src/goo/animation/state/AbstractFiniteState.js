define([
],
/** @lends */
function (
) {
	"use strict";

	/**
	 * @class Base class for a finite state in our finite state machine.
	 */
	function AbstractFiniteState () {
		this._globalStartTime = 0;
		this._lastOwner = null;
	}

	/**
	 * TODO...
	 */
	AbstractFiniteState.prototype.resetClips = function (globalTime) {
		this._globalStartTime = globalTime;
	};

	return AbstractFiniteState;
});
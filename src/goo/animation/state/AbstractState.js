define([
],
/** @lends */
function (
) {
	"use strict";

	/**
	 * @class Base class for a state in our animation system
	 */
	function AbstractState () {
		this._globalStartTime = 0;
	}

	AbstractState.prototype.update = function() {};
	AbstractState.prototype.postUpdate = function() {};
	AbstractState.prototype.getCurrentSourceData = function() {};

	AbstractState.prototype.resetClips = function (globalTime) {
		this._globalStartTime = globalTime;
	};

	return AbstractState;
});
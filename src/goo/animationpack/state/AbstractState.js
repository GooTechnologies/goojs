define([
], function (
) {
	'use strict';

	/**
	 * Base class for a state in our animation system
	 * @private
	 */
	function AbstractState () {
		this._globalStartTime = 0;
		this.onFinished = null;

		/**
		* Changes to this target state when the onFinished callback is run.
		*/
		this._targetState = null;
	}

	AbstractState.prototype.update = function() {};
	AbstractState.prototype.postUpdate = function() {};
	AbstractState.prototype.getCurrentSourceData = function() {};

	AbstractState.prototype.resetClips = function (globalTime) {
		this._globalStartTime = globalTime;
	};

	AbstractState.prototype.shiftClipTime = function (shiftTime) {
		this._globalStartTime += shiftTime;
	};

	return AbstractState;
});
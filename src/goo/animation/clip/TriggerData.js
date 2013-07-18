define(
/** @lends */
function () {
	"use strict";

	/**
	 * @class Transient class that maintains the current triggers and armed status for a TriggerChannel.
	 */
	function TriggerData () {
		this._currentTriggers = [];
		this._currentIndex = -1;
		this.armed = false;
	}

	/*
	 * Arms the data to be triggered on next animation loop
	 */
	TriggerData.prototype.arm = function (index, triggers) {
		if (triggers === null || triggers.length === 0) {
			this._currentTriggers.length = 0;
			this.armed = false;
		} else if (index !== this._currentIndex) {
			this._currentTriggers.length = 0;
			for ( var i = 0, max = triggers.length; i < max; i++) {
				if(triggers[i] && triggers[i] !== '') {
					this._currentTriggers.push(triggers[i]);
				}
			}
			this.armed = true;
		}
		this._currentIndex = index;
	};

	return TriggerData;
});
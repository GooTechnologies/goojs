define(function () {
	"use strict";

	/**
	 * @name TriggerData
	 * @class Transient class that maintains the current triggers and armed status for a TriggerChannel.
	 */
	function TriggerData() {
		this._currentTriggers = [];
		this._currentIndex = -1;
		this._armed = false;
	}

	TriggerData.prototype.getCurrentTrigger = function (instance) {
		return this._currentTriggers.length == 0 ? null : this._currentTriggers[this._currentTriggers.size() - 1];
	};

	TriggerData.prototype.arm = function (index, triggers) {
		if (triggers == null || triggers.length === 0) {
			this._currentTriggers.length = 0;
			this._armed = false;
		} else if (index !== _currentIndex) {
			this._currentTriggers.length = 0;
			for (var i = 0, max = triggers.length; i < max; i++) {
				this._currentTriggers.push(triggers[i]);
			}
			this._armed = true;
		}
		this._currentIndex = index;
	};

	return TriggerData;
});
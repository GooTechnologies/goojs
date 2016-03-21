/**
 * Transient class that maintains the current triggers and armed status for a {@link TriggerChannel}.
 * @private
 */
function TriggerData () {
	this._currentTriggers = [];
	this._currentIndex = -1;
	this.armed = false;
}

/*
 * Arms the data to be triggered on next animation loop
 * @param {number} index The index of the data in the {@link TriggerChannel}, so we only trigger once per triggerdata
 * @param {Array<string>} triggers String keys that will trigger callbacks in the {@link AnimationComponent}
 */
TriggerData.prototype.arm = function (index, triggers) {
	if (triggers === null || triggers.length === 0) {
		this._currentTriggers.length = 0;
		this.armed = false;
	} else if (index !== this._currentIndex) {
		this._currentTriggers.length = 0;
		for ( var i = 0, max = triggers.length; i < max; i++) {
			if (triggers[i] && triggers[i] !== '') {
				this._currentTriggers.push(triggers[i]);
			}
		}
		this.armed = true;
	}
	this._currentIndex = index;
};

module.exports = TriggerData;
define(['goo/animation/clip/TriggerChannel'],
/** @lends */
function (TriggerChannel) {
	"use strict";

	/**
	 * @class An animation source channel consisting of keyword samples indicating when a specific trigger condition is met. Each channel can only be
	 *        in one keyword "state" at a given moment in time. This channel guarantees that if we skip over a sample in this channel, we'll still arm
	 *        it after that fact. This channel should only be used with non-looping, forward moving clips.
	 * @param channelName the name of this channel.
	 * @param times the time samples
	 * @param keys our key samples. Entries may be null. Should have as many entries as the times array.
	 */
	function GuaranteedTriggerChannel (channelName, times, keys) {
		TriggerChannel.call(this, channelName, times, keys);
	}

	GuaranteedTriggerChannel.prototype = Object.create(TriggerChannel.prototype);

	GuaranteedTriggerChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, triggerData) {
		var oldIndex = triggerData.getCurrentIndex();

		// arm trigger
		var newIndex = progressPercent !== 1.0 ? sampleIndex : sampleIndex + 1;
		if (oldIndex === newIndex) {
			triggerData.arm(newIndex, this._keys[newIndex]);
		} else {
			var triggers = [];
			for ( var i = oldIndex + 1; i <= newIndex; i++) {
				if (!this._keys[i]) {
					triggers.push(this._keys[i]);
				}
			}
			triggerData.arm(newIndex, triggers);
		}
	};

	return GuaranteedTriggerChannel;
});
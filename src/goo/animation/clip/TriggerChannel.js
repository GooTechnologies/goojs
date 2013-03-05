define(['goo/animation/clip/AbstractAnimationChannel', 'goo/animation/clip/TriggerData'],
/** @lends TriggerChannel */
function (AbstractAnimationChannel, TriggerData) {
	"use strict";

	/**
	 * @class An animation source channel consisting of keyword samples indicating when a specific trigger condition is met. Each channel can only be
	 *        in one keyword "state" at a given moment in time.
	 * @param channelName the name of this channel.
	 * @param times the time samples
	 * @param keys our key samples. Entries may be null. Should have as many entries as the times array.
	 */
	function TriggerChannel (channelName, times, keys) {
		AbstractAnimationChannel.call(this, channelName, times);
		this._keys = keys ? keys.slice(0) : null;
	}

	TriggerChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	// Was: function (instance)
	TriggerChannel.prototype.createStateDataObject = function () {
		return new TriggerData();
	};

	TriggerChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, triggerData) {
		var index = progressPercent !== 1.0 ? sampleIndex : sampleIndex + 1;
		triggerData.arm(index, [this._keys[index]]);
	};

	return TriggerChannel;
});
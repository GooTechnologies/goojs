define(['goo/animation/clip/AbstractAnimationChannel',
	'goo/math/MathUtils'],
/** @lends */
function (AbstractAnimationChannel,
	MathUtils) {
	"use strict";

	/**
	 * @class An animation source channel consisting of float value samples. These samples are interpolated between key frames. Potential uses for
	 *        this channel include extracting and using forward motion from walk animations, animating colors or texture coordinates, etc.
	 * @param channelName the name of this channel.
	 * @param times the time samples
	 * @param values our value samples. Entries may be null. Should have as many entries as the times array.
	 */
	function InterpolatedFloatChannel (channelName, times, values, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);
		this._values = values ? values.slice(0) : null;
	}

	InterpolatedFloatChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	// Was: function (instance)
	InterpolatedFloatChannel.prototype.createStateDataObject = function () {
		return [0.0];
	};

	InterpolatedFloatChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, value) {
		value[0] = MathUtils.lerp(progressPercent, this._values[sampleIndex], this._values[sampleIndex + 1]);
	};

	InterpolatedFloatChannel.prototype.getData = function(index, store) {
		var rVal = store || [];
		rVal[0] = this._values[index];
		return rVal;
	};

	return InterpolatedFloatChannel;
});
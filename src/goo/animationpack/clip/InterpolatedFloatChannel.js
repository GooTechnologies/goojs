var AbstractAnimationChannel = require('../../animationpack/clip/AbstractAnimationChannel');
var MathUtils = require('../../math/MathUtils');

	'use strict';

	/**
	 * An animation source channel consisting of float value samples. These samples are interpolated between key frames. Potential uses for
	 *        this channel include extracting and using forward motion from walk animations, animating colors or texture coordinates, etc.
	 * @param {string} channelName the name of this channel.
	 * @param {Array<number>} times the time samples
	 * @param {Array<number>} values our value samples. Entries may be null. Should have as many entries as the times array.
	 * @private
	 */
	function InterpolatedFloatChannel (channelName, times, values, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);
		this._values = values ? values.slice(0) : null;
	}

	InterpolatedFloatChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/*
	 * Creates a data item for this type of channel
	 * @returns {Array<number>}
	 */
	InterpolatedFloatChannel.prototype.createStateDataObject = function () {
		return [0.0];
	};

	/*
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} progressPercent
	 * @param {Array<number>} value The data item to apply animation to
	 */
	InterpolatedFloatChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, value) {
		value[0] = MathUtils.lerp(progressPercent, this._values[sampleIndex], this._values[sampleIndex + 1]);
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {Array<number>} [store] the TransformData to store in. If null, a new one is created.
	 * @returns {Array<number>} our resulting TransformData.
	 */
	InterpolatedFloatChannel.prototype.getData = function (index, store) {
		var rVal = store || [];
		rVal[0] = this._values[index];
		return rVal;
	};

	module.exports = InterpolatedFloatChannel;
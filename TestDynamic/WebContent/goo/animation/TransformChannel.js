define(['goo/animation/AbstractAnimationChannel'], function(AbstractAnimationChannel) {
	"use strict";

	TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/**
	 * @name TransformChannel
	 * @class An animation channel consisting of a series of transforms interpolated over time.
	 * @param {String} channelName Name of channel
	 * @property {String} channelName Name of channel
	 */
	function TransformChannel(channelName, times, rotations, translations, scales) {
		AbstractAnimationChannel.call(this, channelName, times);

		if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
			throw new IllegalArgumentException("All provided arrays must be the same length (accounting for type)! Channel: " + channelName);
		}

		this._rotations = rotations.slice(0);
		this._translations = translations.slice(0);
		this._scales = scales.slice(0);
	}

	return TransformChannel;
});
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

	TransformChannel.prototype.createStateDataObject = function() {
		return new TransformData();
	};

	TransformChannel.prototype.setCurrentSample = function(sampleIndex, progressPercent, applyTo) {
		var transformData = applyTo;

		// shortcut if we are fully on one sample or the next
		var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
		var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
		if (progressPercent == 0.0) {
			transformData.setRotation(this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
				this._rotations[index4A + 3]);
			transformData.setTranslation(this._translations[index3A + 0], this._translations[index3A + 1], this._translations[index3A + 2]);
			transformData.setScale(this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]);
			return;
		} else if (progressPercent == 1.0) {
			transformData.setRotation(this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
				this._rotations[index4B + 3]);
			transformData.setTranslation(this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]);
			transformData.setScale(this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]);
			return;
		}

		// Apply (s)lerp and set in transform
		var startR = transformData._rotation.copy(this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
			this._rotations[index4A + 3]);
		var endR = new Quaternion(this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
			this._rotations[index4B + 3]);
		if (!startR.equals(endR)) {
			startR.slerpLocal(endR, progressPercent);
		}

		var startT = transformData.getTranslation().set(this._translations[index3A + 0], this._translations[index3A + 1],
			this._translations[index3A + 2]);
		var endT = new Vector3(this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]);
		if (!startT.equals(endT)) {
			startT.lerpLocal(endT, progressPercent);
		}

		var startS = transformData.getScale().set(this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]);
		var endS = new Vector3(this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]);
		if (!startS.equals(endS)) {
			startS.lerpLocal(endS, progressPercent);
		}
	};

	return TransformChannel;
});
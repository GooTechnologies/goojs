define(['goo/animation/clip/AbstractAnimationChannel', 'goo/animation/clip/TransformData', 'goo/math/Quaternion', 'goo/math/Vector3'], function (
	AbstractAnimationChannel, TransformData, Quaternion, Vector3) {
	"use strict";

	/**
	 * @name TransformChannel
	 * @class An animation channel consisting of a series of transforms interpolated over time.
	 * @param channelName our name.
	 * @param times our time offset values.
	 * @param rotations the rotations to set on this channel at each time offset.
	 * @param translations the translations to set on this channel at each time offset.
	 * @param scales the scales to set on this channel at each time offset.
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

	TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	TransformChannel.prototype.createStateDataObject = function () {
		return new TransformData();
	};

	TransformChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, applyTo) {
		var transformData = applyTo;

		// shortcut if we are fully on one sample or the next
		var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
		var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
		if (progressPercent === 0.0) {
			transformData._rotation.set([this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
					this._rotations[index4A + 3]]);
			transformData._translation.set([this._translations[index3A + 0], this._translations[index3A + 1], this._translations[index3A + 2]]);
			transformData._scale.set([this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]]);
			return;
		} else if (progressPercent === 1.0) {
			transformData._rotation.set([this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
					this._rotations[index4B + 3]]);
			transformData._translation.set([this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]]);
			transformData._scale.set([this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]]);
			return;
		}

		// Apply (s)lerp and set in transform
		var startR = transformData._rotation.set([this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
				this._rotations[index4A + 3]]);
		var endR = new Quaternion().set([this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
				this._rotations[index4B + 3]]);
		if (!startR.equals(endR)) {
			startR.slerp(endR, progressPercent);
		}

		var startT = transformData._translation.set([this._translations[index3A + 0], this._translations[index3A + 1],
				this._translations[index3A + 2]]);
		var endT = new Vector3().set([this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]]);
		if (!startT.equals(endT)) {
			startT.lerp(endT, progressPercent);
		}

		var startS = transformData._scale.set([this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]]);
		var endS = new Vector3().set([this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]]);
		if (!startS.equals(endS)) {
			startS.lerp(endS, progressPercent);
		}
	};

	/**
	 * @description Apply a specific index of this channel to a TransformData object.
	 * @param index the index to grab.
	 * @param store the TransformData to store in. If null, a new one is created.
	 * @return our resulting TransformData.
	 */
	TransformChannel.prototype.getTransformData = function (index, store) {
		var rVal = store ? store : new TransformData();
		rVal.setRotation(this._rotations[index]);
		rVal.setScale(this._scales[index]);
		rVal.setTranslation(this._translations[index]);
		return rVal;
	};

	return TransformChannel;
});
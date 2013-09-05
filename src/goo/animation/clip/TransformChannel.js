define(['goo/animation/clip/AbstractAnimationChannel', 'goo/animation/clip/TransformData', 'goo/math/Quaternion', 'goo/math/Vector3'],
/** @lends */
function (AbstractAnimationChannel, TransformData, Quaternion, Vector3) {
	"use strict";

	/**
	 * @class An animation channel consisting of a series of transforms interpolated over time.
	 * @param channelName our name.
	 * @param {Array} times our time offset values.
	 * @param {Array} rotations the rotations to set on this channel at each time offset.
	 * @param {Array} translations the translations to set on this channel at each time offset.
	 * @param {Array} scales the scales to set on this channel at each time offset.
	 */
	function TransformChannel (channelName, times, rotations, translations, scales, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);

		if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
			throw new Error("All provided arrays must be the same length (accounting for type)! Channel: " + channelName);
		}


		this._rotations = new Float32Array(rotations);
		this._translations = new Float32Array(translations);
		this._scales = new Float32Array(scales);

		this.tmpVec = new Vector3();
		this.tmpQuat = new Quaternion();
		this.tmpQuat2 = new Quaternion();
	}

	TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/*
	 * Creates a data item for this type of channel
	 * @returns {TransformData}
	 */
	TransformChannel.prototype.createStateDataObject = function () {
		return new TransformData();
	};

	/*
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} progressPercent
	 * @param {TransformData} value The data item to apply animation to
	 */

	//REVIEW: (nitpicking) "percent" goes from 0 to 100 as it is "per cent"
	// "fraction" would probably be more suited for the unit interval ([0, 1])
	TransformChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, applyTo) {
		var transformData = applyTo;

		// shortcut if we are fully on one sample or the next
		var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
		var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
		if (progressPercent === 0.0) {
			transformData._rotation.data[0] = this._rotations[index4A + 0];
			transformData._rotation.data[1] = this._rotations[index4A + 1];
			transformData._rotation.data[2] = this._rotations[index4A + 2];
			transformData._rotation.data[3] = this._rotations[index4A + 3];

			transformData._translation.data[0] = this._translations[index3A + 0];
			transformData._translation.data[1] = this._translations[index3A + 1];
			transformData._translation.data[2] = this._translations[index3A + 2];

			transformData._scale.data[0] = this._scales[index3A + 0];
			transformData._scale.data[1] = this._scales[index3A + 1];
			transformData._scale.data[2] = this._scales[index3A + 2];
			return;
		} else if (progressPercent === 1.0) {
			transformData._rotation.data[0] = this._rotations[index4B + 0];
			transformData._rotation.data[1] = this._rotations[index4B + 1];
			transformData._rotation.data[2] = this._rotations[index4B + 2];
			transformData._rotation.data[3] = this._rotations[index4B + 3];

			transformData._translation.data[0] = this._translations[index3B + 0];
			transformData._translation.data[1] = this._translations[index3B + 1];
			transformData._translation.data[2] = this._translations[index3B + 2];

			transformData._scale.data[0] = this._scales[index3B + 0];
			transformData._scale.data[1] = this._scales[index3B + 1];
			transformData._scale.data[2] = this._scales[index3B + 2];
			return;
		}

		// Apply (s)lerp and set in transform
		transformData._rotation.data[0] = this._rotations[index4A + 0];
		transformData._rotation.data[1] = this._rotations[index4A + 1];
		transformData._rotation.data[2] = this._rotations[index4A + 2];
		transformData._rotation.data[3] = this._rotations[index4A + 3];

		this.tmpQuat.data[0] = this._rotations[index4B + 0];
		this.tmpQuat.data[1] = this._rotations[index4B + 1];
		this.tmpQuat.data[2] = this._rotations[index4B + 2];
		this.tmpQuat.data[3] = this._rotations[index4B + 3];

		if (!transformData._rotation.equals(this.tmpQuat)) {
			Quaternion.slerp(transformData._rotation, this.tmpQuat, progressPercent, this.tmpQuat2);
			transformData._rotation.setv(this.tmpQuat2);
		}

		//REVIEW: split lines!
		transformData._translation.data[0] = (1 - progressPercent) * this._translations[index3A+0] + progressPercent * this._translations[index3B+0];
		transformData._translation.data[1] = (1 - progressPercent) * this._translations[index3A+1] + progressPercent * this._translations[index3B+1];
		transformData._translation.data[2] = (1 - progressPercent) * this._translations[index3A+2] + progressPercent * this._translations[index3B+2];

		transformData._scale.data[0] = (1 - progressPercent) * this._scales[index3A+0] + progressPercent * this._scales[index3B+0];
		transformData._scale.data[1] = (1 - progressPercent) * this._scales[index3A+1] + progressPercent * this._scales[index3B+1];
		transformData._scale.data[2] = (1 - progressPercent) * this._scales[index3A+2] + progressPercent * this._scales[index3B+2];
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {TransformData} [store] the TransformData to store in. If null, a new one is created.
	 * @return {TransformData} our resulting TransformData.
	 */
	TransformChannel.prototype.getData = function (index, store) {
		var rVal = store ? store : new TransformData();
		rVal.setRotation(this._rotations[index]);
		rVal.setScale(this._scales[index]);
		rVal.setTranslation(this._translations[index]);
		return rVal;
	};

	return TransformChannel;
});
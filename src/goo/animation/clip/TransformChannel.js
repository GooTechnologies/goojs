define(['goo/animation/clip/AbstractAnimationChannel', 'goo/animation/clip/TransformData', 'goo/math/Quaternion', 'goo/math/Vector3'],
/** @lends */
function (AbstractAnimationChannel, TransformData, Quaternion, Vector3) {
	"use strict";

	/**
	 * @class An animation channel consisting of a series of transforms interpolated over time.
	 * @param channelName our name.
	 * @param times our time offset values.
	 * @param rotations the rotations to set on this channel at each time offset.
	 * @param translations the translations to set on this channel at each time offset.
	 * @param scales the scales to set on this channel at each time offset.
	 */
	function TransformChannel (channelName, times, rotations, translations, scales, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);

		if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
			throw new Error("All provided arrays must be the same length (accounting for type)! Channel: " + channelName);
		}

		this._rotations = rotations.slice(0);
		this._translations = translations.slice(0);
		this._scales = scales.slice(0);

		this.tmpVec = new Vector3();
		this.tmpQuat = new Quaternion();
		this.tmpQuat2 = new Quaternion();
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
//			transformData._rotation.set([this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
//					this._rotations[index4A + 3]]);
			transformData._rotation.data[0] = this._rotations[index4A + 0];
			transformData._rotation.data[1] = this._rotations[index4A + 1];
			transformData._rotation.data[2] = this._rotations[index4A + 2];
			transformData._rotation.data[3] = this._rotations[index4A + 3];

//			transformData._translation.set([this._translations[index3A + 0], this._translations[index3A + 1], this._translations[index3A + 2]]);
			transformData._translation.data[0] = this._translations[index3A + 0];
			transformData._translation.data[1] = this._translations[index3A + 1];
			transformData._translation.data[2] = this._translations[index3A + 2];

//			transformData._scale.set([this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]]);
			transformData._scale.data[0] = this._scales[index3A + 0];
			transformData._scale.data[1] = this._scales[index3A + 1];
			transformData._scale.data[2] = this._scales[index3A + 2];
			return;
		} else if (progressPercent === 1.0) {
//			transformData._rotation.set([this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
//					this._rotations[index4B + 3]]);
			transformData._rotation.data[0] = this._rotations[index4B + 0];
			transformData._rotation.data[1] = this._rotations[index4B + 1];
			transformData._rotation.data[2] = this._rotations[index4B + 2];
			transformData._rotation.data[3] = this._rotations[index4B + 3];

//			transformData._translation.set([this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]]);
			transformData._translation.data[0] = this._translations[index3B + 0];
			transformData._translation.data[1] = this._translations[index3B + 1];
			transformData._translation.data[2] = this._translations[index3B + 2];

//			transformData._scale.set([this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]]);
			transformData._scale.data[0] = this._scales[index3B + 0];
			transformData._scale.data[1] = this._scales[index3B + 1];
			transformData._scale.data[2] = this._scales[index3B + 2];
			return;
		}

		// Apply (s)lerp and set in transform
//		var startR = transformData._rotation.set([this._rotations[index4A + 0], this._rotations[index4A + 1], this._rotations[index4A + 2],
//				this._rotations[index4A + 3]]);
		transformData._rotation.data[0] = this._rotations[index4A + 0];
		transformData._rotation.data[1] = this._rotations[index4A + 1];
		transformData._rotation.data[2] = this._rotations[index4A + 2];
		transformData._rotation.data[3] = this._rotations[index4A + 3];
//		var endR = this.tmpQuat.set([this._rotations[index4B + 0], this._rotations[index4B + 1], this._rotations[index4B + 2],
//				this._rotations[index4B + 3]]);
		this.tmpQuat.data[0] = this._rotations[index4B + 0];
		this.tmpQuat.data[1] = this._rotations[index4B + 1];
		this.tmpQuat.data[2] = this._rotations[index4B + 2];
		this.tmpQuat.data[3] = this._rotations[index4B + 3];
		if (!transformData._rotation.equals(this.tmpQuat)) {
			Quaternion.slerp(transformData._rotation, this.tmpQuat, progressPercent, this.tmpQuat2);
			transformData._rotation.setv(this.tmpQuat2);
		}

//		var startT = transformData._translation.set([this._translations[index3A + 0], this._translations[index3A + 1],
//				this._translations[index3A + 2]]);
		transformData._translation.data[0] = this._translations[index3A + 0];
		transformData._translation.data[1] = this._translations[index3A + 1];
		transformData._translation.data[2] = this._translations[index3A + 2];
//		var endT = this.tmpVec.set([this._translations[index3B + 0], this._translations[index3B + 1], this._translations[index3B + 2]]);
		this.tmpVec.data[0] = this._translations[index3B + 0];
		this.tmpVec.data[1] = this._translations[index3B + 1];
		this.tmpVec.data[2] = this._translations[index3B + 2];
		if (!transformData._translation.equals(this.tmpVec)) {
			transformData._translation.lerp(this.tmpVec, progressPercent);
		}

//		var startS = transformData._scale.set([this._scales[index3A + 0], this._scales[index3A + 1], this._scales[index3A + 2]]);
		transformData._scale.data[0] = this._scales[index3A + 0];
		transformData._scale.data[1] = this._scales[index3A + 1];
		transformData._scale.data[2] = this._scales[index3A + 2];
//		var endS = this.tmpVec.set([this._scales[index3B + 0], this._scales[index3B + 1], this._scales[index3B + 2]]);
		this.tmpVec.data[0] = this._scales[index3B + 0];
		this.tmpVec.data[1] = this._scales[index3B + 1];
		this.tmpVec.data[2] = this._scales[index3B + 2];
		if (!transformData._scale.equals(this.tmpVec)) {
			transformData._scale.lerp(this.tmpVec, progressPercent);
		}
	};

	/**
	 * @description Apply a specific index of this channel to a TransformData object.
	 * @param index the index to grab.
	 * @param {TransformData} store the TransformData to store in. If null, a new one is created.
	 * @return our resulting TransformData.
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
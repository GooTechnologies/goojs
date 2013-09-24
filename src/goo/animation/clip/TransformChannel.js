define([
	'goo/animation/clip/AbstractAnimationChannel',
	'goo/animation/clip/TransformData',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/animation/clip/LinearInterpolator'
	],
/** @lends */
function (
	AbstractAnimationChannel,
	TransformData,
	Quaternion,
	Vector3,
	LinearInterpolator
	) {
	"use strict";

	function getArray(times, data) {
		var ret = [];

		for (var i = 0; i < times.length; i++) {
			ret.push({
				time: times[i],
				value: data[i]
			});
		}

		return ret;
	}

	function every(everyN) {
		return function(start) {
			return function(arr) {
				//console.log(everyN, start, arr.length);
				var ret = [];
				for (var i = start; i < arr.length; i += everyN) {
					ret.push(arr[i]);
				}

				//console.log(ret.length);
				return ret;
			};
		}
	}

	/**
	 * @class An animation channel consisting of a series of transforms interpolated over time.
	 * @param channelName our name.
	 * @param {Array} times our time offset values.
	 * @param {Array} rotations the rotations to set on this channel at each time offset.
	 * @param {Array} translations the translations to set on this channel at each time offset.
	 * @param {Array} scales the scales to set on this channel at each time offset.
	 */
	// no more time
	function TransformChannel (channelName, times, rotations, translations, scales, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);
		/*
		if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
			throw new Error("All provided arrays must be the same length (accounting for type)! Channel: " + channelName);
		}
		*/

		var every3 = every(3);
		var every3Start0 = every3(0);
		var every3Start1 = every3(1);
		var every3Start2 = every3(2);


		// these become entries in an array
		this._rotations = new Float32Array(rotations);
		this._translationX = new LinearInterpolator(getArray(times, every3Start0(translations)));
		this._translationY = new LinearInterpolator(getArray(times, every3Start1(translations)));
		this._translationZ = new LinearInterpolator(getArray(times, every3Start2(translations)));
		this._scales = new Float32Array(scales);

		//this.tmpVec = new Vector3(); // unused?
		this.tmpQuat = new Quaternion();
		this.tmpQuat2 = new Quaternion();
	}

	TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/**
	 * Creates a data item for this type of channel
	 * @returns {TransformData}
	 */
	TransformChannel.prototype.createStateDataObject = function () {
		return new TransformData();
	};

	/**
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} fraction
	 * @param {TransformData} value The data item to apply animation to
	 */
	TransformChannel.prototype.setCurrentSample = function (sampleIndex, fraction, applyTo, time) {
		var transformData = applyTo;

		transformData._translation.data[0] = this._translationX.getAt(time);
		transformData._translation.data[1] = this._translationY.getAt(time);
		transformData._translation.data[2] = this._translationZ.getAt(time);

		// shortcut if we are fully on one sample or the next
		var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
		var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
		if (fraction === 0.0) {
			transformData._rotation.data[0] = this._rotations[index4A + 0];
			transformData._rotation.data[1] = this._rotations[index4A + 1];
			transformData._rotation.data[2] = this._rotations[index4A + 2];
			transformData._rotation.data[3] = this._rotations[index4A + 3];

//			transformData._translation.data[0] = this._translations[index3A + 0];
//			transformData._translation.data[1] = this._translations[index3A + 1];
//			transformData._translation.data[2] = this._translations[index3A + 2];

			transformData._scale.data[0] = this._scales[index3A + 0];
			transformData._scale.data[1] = this._scales[index3A + 1];
			transformData._scale.data[2] = this._scales[index3A + 2];
			return;
		} else if (fraction === 1.0) {
			transformData._rotation.data[0] = this._rotations[index4B + 0];
			transformData._rotation.data[1] = this._rotations[index4B + 1];
			transformData._rotation.data[2] = this._rotations[index4B + 2];
			transformData._rotation.data[3] = this._rotations[index4B + 3];

//			transformData._translation.data[0] = this._translations[index3B + 0];
//			transformData._translation.data[1] = this._translations[index3B + 1];
//			transformData._translation.data[2] = this._translations[index3B + 2];

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
			Quaternion.slerp(transformData._rotation, this.tmpQuat, fraction, this.tmpQuat2);
			transformData._rotation.setv(this.tmpQuat2);
		}

//		transformData._translation.data[0] = (1 - fraction) * this._translations[index3A + 0] + fraction * this._translations[index3B + 0];
//		transformData._translation.data[1] = (1 - fraction) * this._translations[index3A + 1] + fraction * this._translations[index3B + 1];
//		transformData._translation.data[2] = (1 - fraction) * this._translations[index3A + 2] + fraction * this._translations[index3B + 2];

		transformData._scale.data[0] = (1 - fraction) * this._scales[index3A + 0] + fraction * this._scales[index3B + 0];
		transformData._scale.data[1] = (1 - fraction) * this._scales[index3A + 1] + fraction * this._scales[index3B + 1];
		transformData._scale.data[2] = (1 - fraction) * this._scales[index3A + 2] + fraction * this._scales[index3B + 2];
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
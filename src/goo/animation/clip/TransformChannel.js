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

		var every4 = every(4);
		var every4Start0 = every4(0);
		var every4Start1 = every4(1);
		var every4Start2 = every4(2);
		var every4Start3 = every4(3);

		// these become entries in an array
		this._rotations = new Float32Array(rotations);
		this._translationX = new LinearInterpolator(getArray(times, every3Start0(translations)));
		this._translationY = new LinearInterpolator(getArray(times, every3Start1(translations)));
		this._translationZ = new LinearInterpolator(getArray(times, every3Start2(translations)));

		this._rotationX = new LinearInterpolator(getArray(times, every4Start0(rotations)));
		this._rotationY = new LinearInterpolator(getArray(times, every4Start1(rotations)));
		this._rotationZ = new LinearInterpolator(getArray(times, every4Start2(rotations)));
		this._rotationW = new LinearInterpolator(getArray(times, every4Start3(rotations)));

		this._scaleX = new LinearInterpolator(getArray(times, every3Start0(scales)));
		this._scaleY = new LinearInterpolator(getArray(times, every3Start1(scales)));
		this._scaleZ = new LinearInterpolator(getArray(times, every3Start2(scales)));

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

		transformData._rotation.data[0] = this._rotationX.getAt(time);
		transformData._rotation.data[1] = this._rotationY.getAt(time);
		transformData._rotation.data[2] = this._rotationZ.getAt(time);
		transformData._rotation.data[3] = this._rotationW.getAt(time);

		transformData._scale.data[0] = this._scaleX.getAt(time);
		transformData._scale.data[1] = this._scaleY.getAt(time);
		transformData._scale.data[2] = this._scaleZ.getAt(time);
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
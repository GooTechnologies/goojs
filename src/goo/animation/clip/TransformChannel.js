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

	function getNewArray(data) {
		var ret = [];
		if (!data) return ret;

		for (var i = 0; i < data.length; i += 4) {
			ret.push({
				time: data[i],
				value: data[i + 1]
			});
		}

		return ret;
	}

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
	function TransformChannel (channelName, translationX, translationY, translationZ, rotationX, rotationY, rotationZ, rotationW, scaleX, scaleY, scaleZ, blendType) {
		AbstractAnimationChannel.call(this, channelName, []/*times*/, blendType);

		this._translationX = new LinearInterpolator(getNewArray(translationX));
		this._translationY = new LinearInterpolator(getNewArray(translationY));
		this._translationZ = new LinearInterpolator(getNewArray(translationZ));

		this._rotationX = new LinearInterpolator(getNewArray(rotationX));
		this._rotationY = new LinearInterpolator(getNewArray(rotationY));
		this._rotationZ = new LinearInterpolator(getNewArray(rotationZ));
		this._rotationW = new LinearInterpolator(getNewArray(rotationW));

		this._scaleX = new LinearInterpolator(getNewArray(scaleX));
		this._scaleY = new LinearInterpolator(getNewArray(scaleY));
		this._scaleZ = new LinearInterpolator(getNewArray(scaleZ));

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

	TransformChannel.prototype.getMaxTime = function() {
		return Math.max(
			this._translationX.getMaxTime(),
			this._translationY.getMaxTime(),
			this._translationZ.getMaxTime(),
			this._rotationX.getMaxTime(),
			this._rotationY.getMaxTime(),
			this._rotationZ.getMaxTime(),
			this._rotationW.getMaxTime(),
			this._scaleX.getMaxTime(),
			this._scaleY.getMaxTime(),
			this._scaleZ.getMaxTime()
		);
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

		transformData._rotation.normalize();

		transformData._scale.data[0] = 1;
		transformData._scale.data[1] = 1;
		transformData._scale.data[2] = 1;
        /*
		transformData._scale.data[0] = this._scaleX.getAt(time);  // these return 0
		transformData._scale.data[1] = this._scaleY.getAt(time);
		transformData._scale.data[2] = this._scaleZ.getAt(time);
        */
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {TransformData} [store] the TransformData to store in. If null, a new one is created.
	 * @return {TransformData} our resulting TransformData.
	 */
	TransformChannel.prototype.getData = function (index, store) {
		console.log(';asd');
		var rVal = store ? store : new TransformData();
		rVal.setRotation(this._rotations[index]);
		rVal.setScale(this._scales[index]);
		rVal.setTranslation(this._translations[index]);
		return rVal;
	};

	return TransformChannel;
});
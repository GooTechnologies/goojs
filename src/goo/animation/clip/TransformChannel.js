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

	function TransformChannel (channelName, translationX, translationY, translationZ, rotationX, rotationY, rotationZ, rotationW, scaleX, scaleY, scaleZ, blendType) {
		AbstractAnimationChannel.call(this, channelName, []/*times*/, blendType);

		this._translationX = translationX ? new LinearInterpolator(getNewArray(translationX)) : undefined;
		this._translationY = translationY ? new LinearInterpolator(getNewArray(translationY)) : undefined;
		this._translationZ = translationZ ? new LinearInterpolator(getNewArray(translationZ)) : undefined;

		this._rotationX = rotationX ? new LinearInterpolator(getNewArray(rotationX)) : undefined;
		this._rotationY = rotationY ? new LinearInterpolator(getNewArray(rotationY)) : undefined;
		this._rotationZ = rotationZ ? new LinearInterpolator(getNewArray(rotationZ)) : undefined;
		this._rotationW = rotationW ? new LinearInterpolator(getNewArray(rotationW)) : undefined;

		this._scaleX = scaleX ? new LinearInterpolator(getNewArray(scaleX)) : undefined;
		this._scaleY = scaleY ? new LinearInterpolator(getNewArray(scaleY)) : undefined;
		this._scaleZ = scaleZ ? new LinearInterpolator(getNewArray(scaleZ)) : undefined;

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

	TransformChannel.prototype.setDefaultData = function (transform) {
		if (!this._translationX) { this._translationXDefault = transform.translation.data[0]; }
		if (!this._translationY) { this._translationYDefault = transform.translation.data[1]; }
		if (!this._translationZ) { this._translationZDefault = transform.translation.data[2]; }
		// fill with rotation and scale
	};

	TransformChannel.prototype.getMaxTime = function () {
		return Math.max(
			this._translationX ? this._translationX.getMaxTime() : 0,
			this._translationX ? this._translationY.getMaxTime() : 0,
			this._translationX ? this._translationZ.getMaxTime() : 0,
			this._rotationX ? this._rotationX.getMaxTime() : 0,
			this._rotationX ? this._rotationY.getMaxTime() : 0,
			this._rotationX ? this._rotationZ.getMaxTime() : 0,
			this._rotationX ? this._rotationW.getMaxTime() : 0,
			this._scaleX ? this._scaleX.getMaxTime() : 0,
			this._scaleX ? this._scaleY.getMaxTime() : 0,
			this._scaleX ? this._scaleZ.getMaxTime() : 0
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

		if(this._translationX) { transformData._translation.data[0] = this._translationX.getAt(time); }
		else { transformData._translation.data[0] = this._translationXDefault; }
		if(this._translationY) { transformData._translation.data[1] = this._translationY.getAt(time); }
		else { transformData._translation.data[1] = this._translationYDefault; }
		if(this._translationZ) { transformData._translation.data[2] = this._translationZ.getAt(time); }
		else { transformData._translation.data[2] = this._translationZDefault; }

		if(this._rotationX) { transformData._rotation.data[0] = this._rotationX.getAt(time); }
		if(this._rotationY) { transformData._rotation.data[1] = this._rotationY.getAt(time); }
		if(this._rotationZ) { transformData._rotation.data[2] = this._rotationZ.getAt(time); }
		if(this._rotationW) { transformData._rotation.data[3] = this._rotationW.getAt(time); }

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
		var rVal = store ? store : new TransformData();
		rVal.setRotation(this._rotations[index]);
		rVal.setScale(this._scales[index]);
		rVal.setTranslation(this._translations[index]);
		return rVal;
	};

	return TransformChannel;
});
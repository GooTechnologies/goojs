define([
	'goo/animation/clip/JointChannel',
	'goo/animation/clip/JointData',
	'goo/animation/clip/JointChannel',
	'goo/animation/clip/JointData'
],
/** @lends */
function (
	JointChannel,
	JointData,
	TransformChannel,
	TransformData
) {
	"use strict";

	/**
	 * @class This tree source maintains its own source data, which can be modified directly using setJointXXX. This source is meant to be used for
	 *        controlling a particular joint or set of joints programatically. Originally implemented BlendTreeSource.
	 * @param sourceName optional: name of source we were initialized from, if given.
	 */
	function ManagedTransformSource (sourceName) {
		this._sourceName = sourceName ? sourceName : null;
		this._data = {};
	}

	/**
	 * @description Sets a translation to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} translation the translation to set
	 */
	ManagedTransformSource.prototype.setTranslation = function (channelName, translation) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._translation.setv(translation);
		}
	};

	/**
	 * @description Sets a scale to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} scale the scale to set
	 */
	ManagedTransformSource.prototype.setScale = function (channelName, scale) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._scale.setv(scale);
		}
	};

	/**
	 * @description Sets a rotation to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Quaternion} rotation the rotation to set
	 */
	ManagedTransformSource.prototype.setRotation = function (channelName, rotation) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._rotation.set(rotation);
		}
	};

	/**
	 * @description Setup transform data for specific joints on this source, using the first frame from a given clip.
	 * @param {AnimationClip} clip the animation clip to pull data from
	 * @param {string[]} jointIndices the indices of the joints to initialize data for.
	 */
	ManagedTransformSource.prototype.initFromClip = function (clip, filter, channelNames) {
		if(filter === 'Include' && channelNames && channelNames.length) {
			for ( var i = 0, max = channelNames.length; i < max; i++) {
				var channelName = channelNames[i];
				var channel = clip.findChannelByName(channelName);
				var data = channel.getData(0);
				this._data[channelName] = data;
			}
		} else {
			for ( var i = 0, max = clip._channels.length; i < max; i++) {
				var channel = clip._channels[i];
				var channelName = channel._channelName;
				if(filter === 'Exclude'
					&& channelNames
					&& channelNames.length
					&& channelNames.indexOf(channelName) > -1) {
						var data = channel.getData(0);
						this._data[channelName] = data;
				}
			}
		}
	};

	/*
	 * This has no effect on clip source, but will be called by owning {@link SteadyState}
	 */
	ManagedTransformSource.prototype.resetClips = function () {
	};

	ManagedTransformSource.prototype.setTimeScale = function () {
	};

	/*
	 * This has no effect, but will be called by owning {@link SteadyState}
	 * @return true to stay active
	 */
	ManagedTransformSource.prototype.setTime = function () {
		return true;
	};

	/*
	 * ManagedTransformSource is always active
	 */
	ManagedTransformSource.prototype.isActive = function () {
		return true;
	};

	ManagedTransformSource.prototype.getChannelData = function (channelName) {
		return this._data[channelName];
	};

	/*
	 * @return a source data mapping for the channels in this clip source
	 */
	ManagedTransformSource.prototype.getSourceData = function () {
		return this._data;
	};

	return ManagedTransformSource;
});
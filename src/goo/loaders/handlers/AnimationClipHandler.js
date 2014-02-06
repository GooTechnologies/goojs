define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/clip/AnimationClip',
	'goo/loaders/JsonUtils',
	'goo/animation/clip/JointChannel',
	'goo/animation/clip/TransformChannel',
	'goo/animation/clip/InterpolatedFloatChannel',
	'goo/animation/clip/TriggerChannel',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil'
],
function(
	ConfigHandler,
	AnimationClip,
	JsonUtils,
	JointChannel,
	TransformChannel,
	InterpolatedFloatChannel,
	TriggerChannel,
	PromiseUtil,
	ArrayUtil
) {
	"use strict";

	/**
	* @class
	*/
	function AnimationClipHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	AnimationClipHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('clip', AnimationClipHandler);

	AnimationClipHandler.prototype._create = function(ref) {
		return this._objects[ref] = new AnimationClip();
	};

	AnimationClipHandler.prototype.update = function(ref, config) {
		var object = this._objects[ref] || this._create(ref);
		object._name = config.name;
		var clip, that = this;
		if (config.binaryRef) {
			return this.getConfig(config.binaryRef).then(function(bindata) {
				if (!bindata) {
					throw new Error("Binary clip data was empty");
				}
				return that._updateAnimationClip(config, bindata, object);
			});
		} else {
			clip = this._updateAnimationClip(config, null, object);
			return PromiseUtil.createDummyPromise(clip);
		}
	};

	AnimationClipHandler.prototype._updateAnimationClip = function(clipConfig, bindata, clip) {
		/* jshint bitwise:false */
		//console.debug("Creating animation clip");

		clip._channels = [];
		var useCompression = clipConfig.useCompression || false;

		var compressedAnimRange = null;
		if (useCompression) {
			compressedAnimRange = clipConfig.compressedRange || (1 << 15) - 1;
		}
		if (clipConfig.channels && clipConfig.channels.length) {
			for (var i = 0; i < clipConfig.channels.length; i++) {
				var channel, times, rots, trans, scales, blendType;
				var channelConfig = clipConfig.channels[i];

				if (bindata) {
					times = ArrayUtil.getTypedArray(bindata, channelConfig.times);
				} else {
					times = new Float32Array(JsonUtils.parseChannelTimes(channelConfig, useCompression));
				}
				var blendType = channelConfig.blendType;
				var type = channelConfig.type;
				if (type === 'Joint' || type === 'Transform') {
					if (bindata) {
						rots = ArrayUtil.getTypedArray(bindata, channelConfig.rotationSamples);
						trans = ArrayUtil.getTypedArray(bindata, channelConfig.translationSamples);
						scales = ArrayUtil.getTypedArray(bindata, channelConfig.scaleSamples);
					} else {
						rots = JsonUtils.parseRotationSamples(channelConfig, compressedAnimRange, useCompression);
						trans = JsonUtils.parseTranslationSamples(channelConfig, times.length, useCompression);
						scales = JsonUtils.parseScaleSamples(channelConfig, times.length, useCompression);
					}
				}
				if (type === 'Joint') {
					channel = new JointChannel(channelConfig.jointName, channelConfig.jointIndex, times, rots, trans, scales, blendType);
				} else if (channelConfig.type === 'Transform') {
					channel = new TransformChannel(channelConfig.name, times, rots, trans, scales, blendType);
				} else if (channelConfig.type === 'FloatLERP') {
					channel = new InterpolatedFloatChannel(channelConfig.name, times, JsonUtils.parseFloatLERPValues(channelConfig, useCompression), blendType);
				} else if (channelConfig.type === 'Trigger') {
					channel = new TriggerChannel(channelConfig.name, times, channelConfig.keys);
					if (channelConfig.guarantee) {
						channel.guarantee = true;
					}
				} else {
					console.warn("Unhandled channel type: " + channelConfig.type);
					continue;
				}
				clip.addChannel(channel);
			}
		}
		return clip;
	};

	return AnimationClipHandler;
});

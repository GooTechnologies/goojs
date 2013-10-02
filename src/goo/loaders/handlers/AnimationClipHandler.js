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
	'use strict';

	function AnimationClipHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationClipHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('clip', AnimationClipHandler);

	AnimationClipHandler.prototype.update = function(ref, config) {
		var clip, that = this;
		if (config.binaryRef) {
			return this.getConfig(config.binaryRef).then(function(bindata) {
				if (!bindata) {
					throw new Error("Binary clip data was empty");
				}
				return that._createAnimationClip(config, bindata);
			});
		} else {
			clip = this._createAnimationClip(config);
			return PromiseUtil.createDummyPromise(clip);
		}
	};

	function getOldFormatArray(times, data, period, offset) {
		var ret = [];
		for (var i = 0; i < times.length; i++) {
			ret.push(times[i], data[i * period + offset], 0.25, 0.25);
		}
		return ret;
	}

	AnimationClipHandler.prototype._createAnimationClip = function(clipConfig, bindata) {
		/* jshint bitwise:false */
		//console.debug("Creating animation clip");
		var clip = new AnimationClip(clipConfig.name);

		var useCompression = clipConfig.useCompression || false;

		var compressedAnimRange = null;
		if (useCompression) {
			compressedAnimRange = clipConfig.compressedRange || (1 << 15) - 1;
		}
		if (clipConfig.channels && clipConfig.channels.length) {
			for (var i = 0; i < clipConfig.channels.length; i++) {
				var channelConfig = clipConfig.channels[i];

				var channel;
				var translationX, translationY, translationZ;
				var rotationX, rotationY, rotationZ, rotationW;
				var scaleX, scaleY, scaleZ;
				var blendType;

				var blendType = channelConfig.blendType;
				var type = channelConfig.type;

				// backwards compatibility
				if (channelConfig.rotationSamples) {
					var times;
					if (bindata) {
						times = ArrayUtil.getTypedArray(bindata, channelConfig.times);
					} else {
						times = new Float32Array(JsonUtils.parseChannelTimes(channelConfig, useCompression));
					}

					var rots, trans, scales;
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

						translationX = getOldFormatArray(times, trans, 3, 0);
						translationY = getOldFormatArray(times, trans, 3, 1);
						translationZ = getOldFormatArray(times, trans, 3, 2);
						rotationX = getOldFormatArray(times, rots, 4, 0);
						rotationY = getOldFormatArray(times, rots, 4, 1);
						rotationZ = getOldFormatArray(times, rots, 4, 2);
						rotationW = getOldFormatArray(times, rots, 4, 3);
						scaleX = getOldFormatArray(times, scales, 3, 0);
						scaleY = getOldFormatArray(times, scales, 3, 1);
						scaleZ = getOldFormatArray(times, scales, 3, 2);
					}
					if (type === 'Joint') {
						channel = new JointChannel(
							channelConfig.jointName, channelConfig.jointIndex,
							translationX, translationY, translationZ,
							rotationX, rotationY, rotationZ, rotationW,
							scaleX, scaleY, scaleZ,
							blendType
						);
					} else if (channelConfig.type === 'Transform') {
						channel = new TransformChannel(channelConfig.name,
							translationX, translationY, translationZ,
							rotationX, rotationY, rotationZ, rotationW,
							scaleX, scaleY, scaleZ,
							blendType
						);
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
				} else {
					if (type === 'Joint' || type === 'Transform') {
						if (bindata) {
							if (channelConfig.properties.translationX) {
								translationX = ArrayUtil.getTypedArray(bindata, channelConfig.properties.translationX);
							}
							if (channelConfig.properties.translationY) {
								translationY = ArrayUtil.getTypedArray(bindata, channelConfig.properties.translationY);
							}
							if (channelConfig.properties.translationZ) {
								translationZ = ArrayUtil.getTypedArray(bindata, channelConfig.properties.translationZ);
							}

							if (channelConfig.properties.rotationX) {
								rotationX = ArrayUtil.getTypedArray(bindata, channelConfig.properties.rotationX);
							}
							if (channelConfig.properties.rotationY) {
								rotationY = ArrayUtil.getTypedArray(bindata, channelConfig.properties.rotationY);
							}
							if (channelConfig.properties.rotationZ) {
								rotationZ = ArrayUtil.getTypedArray(bindata, channelConfig.properties.rotationZ);
							}
							if (channelConfig.properties.rotationW) {
								rotationW = ArrayUtil.getTypedArray(bindata, channelConfig.properties.rotationW);
							}

							if (channelConfig.properties.scaleX) {
								scaleX = ArrayUtil.getTypedArray(bindata, channelConfig.properties.scaleX);
							}
							if (channelConfig.properties.scaleY) {
								scaleY = ArrayUtil.getTypedArray(bindata, channelConfig.properties.scaleY);
							}
							if (channelConfig.properties.scaleZ) {
								scaleZ = ArrayUtil.getTypedArray(bindata, channelConfig.properties.scaleZ);
							}
						} else {
							translationX = channelConfig.properties.translationX;
							translationY = channelConfig.properties.translationY;
							translationZ = channelConfig.properties.translationZ;

							rotationX = channelConfig.properties.rotationX;
							rotationY = channelConfig.properties.rotationY;
							rotationZ = channelConfig.properties.rotationZ;
							rotationW = channelConfig.properties.rotationW;

							scaleX = channelConfig.properties.scaleX;
							scaleY = channelConfig.properties.scaleY;
							scaleZ = channelConfig.properties.scaleZ;
						}
					}
					if (type === 'Joint') {
						channel = new JointChannel(
							channelConfig.jointName, channelConfig.jointIndex,
							translationX, translationY, translationZ,
							rotationX, rotationY, rotationZ, rotationW,
							scaleX, scaleY, scaleZ,
							blendType
						);
					} else if (channelConfig.type === 'Transform') {
						channel = new TransformChannel(channelConfig.name,
							translationX, translationY, translationZ,
							rotationX, rotationY, rotationZ, rotationW,
							scaleX, scaleY, scaleZ,
							blendType
						);
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
		}
		return clip;
	};

	return AnimationClipHandler;
});

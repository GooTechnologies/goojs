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

	AnimationClipHandler.prototype._createAnimationClip = function(clipConfig, bindata) {
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
				//console.log(channelConfig);

				var channel;
				var translationX, translationY, translationZ;
				var rotationX, rotationY, rotationZ, rotationW;
				var scaleX, scaleY, scaleZ;
				var blendType;

				var blendType = channelConfig.blendType;
				var type = channelConfig.type;
				if (type === 'Joint' || type === 'Transform') {
					if (bindata) {
						/* // animations exported from unity use this position instead of translation
						if (channelConfig.properties.positionX) {
							translationX = ArrayUtil.getTypedArray(bindata, channelConfig.properties.positionX);
						}
						if (channelConfig.properties.positionY) {
							translationY = ArrayUtil.getTypedArray(bindata, channelConfig.properties.positionY);
						}
						if (channelConfig.properties.positionZ) {
							translationZ = ArrayUtil.getTypedArray(bindata, channelConfig.properties.positionZ);
						}
						*/
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
						//translationX = channelConfig.properties.positionX;
						//translationY = channelConfig.properties.positionY;
						//translationZ = channelConfig.properties.positionZ;

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
		return clip;
	};

	return AnimationClipHandler;
});

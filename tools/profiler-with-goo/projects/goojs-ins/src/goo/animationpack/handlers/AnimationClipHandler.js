define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/animationpack/clip/AnimationClip',
    'goo/animationpack/clip/JointChannel',
    'goo/animationpack/clip/TransformChannel',
    'goo/animationpack/clip/InterpolatedFloatChannel',
    'goo/animationpack/clip/TriggerChannel',
    'goo/util/PromiseUtil',
    'goo/util/ArrayUtil'
], function (ConfigHandler, AnimationClip, JointChannel, TransformChannel, InterpolatedFloatChannel, TriggerChannel, PromiseUtil, ArrayUtil) {
    'use strict';
    __touch(2724);
    function AnimationClipHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(2733);
    }
    __touch(2725);
    AnimationClipHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(2726);
    AnimationClipHandler.prototype.constructor = AnimationClipHandler;
    __touch(2727);
    ConfigHandler._registerClass('clip', AnimationClipHandler);
    __touch(2728);
    AnimationClipHandler.prototype._create = function () {
        return new AnimationClip();
        __touch(2734);
    };
    __touch(2729);
    AnimationClipHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(2735);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (clip) {
            if (!clip) {
                return clip;
                __touch(2738);
            }
            return that.loadObject(config.binaryRef, options).then(function (bindata) {
                if (!bindata) {
                    throw new Error('Binary clip data was empty');
                    __touch(2740);
                }
                return that._updateAnimationClip(config, bindata, clip);
                __touch(2739);
            });
            __touch(2737);
        });
        __touch(2736);
    };
    __touch(2730);
    AnimationClipHandler.prototype._updateAnimationClip = function (clipConfig, bindata, clip) {
        clip._channels = [];
        __touch(2741);
        if (clipConfig.channels) {
            var keys = Object.keys(clipConfig.channels);
            __touch(2743);
            for (var i = 0; i < keys.length; i++) {
                var channelConfig = clipConfig.channels[keys[i]];
                __touch(2744);
                var times = ArrayUtil.getTypedArray(bindata, channelConfig.times);
                __touch(2745);
                var blendType = channelConfig.blendType;
                __touch(2746);
                var type = channelConfig.type;
                __touch(2747);
                var channel;
                __touch(2748);
                switch (type) {
                case 'Joint':
                case 'Transform':
                    var rots, trans, scales;
                    rots = ArrayUtil.getTypedArray(bindata, channelConfig.rotationSamples);
                    trans = ArrayUtil.getTypedArray(bindata, channelConfig.translationSamples);
                    scales = ArrayUtil.getTypedArray(bindata, channelConfig.scaleSamples);
                    if (type === 'Joint') {
                        channel = new JointChannel(channelConfig.jointIndex, channelConfig.name, times, rots, trans, scales, blendType);
                        __touch(2751);
                    } else {
                        channel = new TransformChannel(channelConfig.name, times, rots, trans, scales, blendType);
                        __touch(2752);
                    }
                    break;
                case 'FloatLERP':
                    channel = new InterpolatedFloatChannel(channelConfig.name, times, channelConfig.values, blendType);
                    break;
                case 'Trigger':
                    channel = new TriggerChannel(channelConfig.name, times, channelConfig.keys);
                    channel.guarantee = !!channelConfig.guarantee;
                    break;
                default:
                    console.warn('Unhandled channel type: ' + channelConfig.type);
                    continue;
                }
                __touch(2749);
                clip.addChannel(channel);
                __touch(2750);
            }
        }
        return clip;
        __touch(2742);
    };
    __touch(2731);
    return AnimationClipHandler;
    __touch(2732);
});
__touch(2723);
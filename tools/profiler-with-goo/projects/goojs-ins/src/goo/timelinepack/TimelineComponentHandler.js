define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/timelinepack/TimelineComponent',
    'goo/timelinepack/ValueChannel',
    'goo/timelinepack/EventChannel',
    'goo/util/PromiseUtil',
    'goo/util/ArrayUtil',
    'goo/entities/SystemBus',
    'goo/util/ObjectUtil'
], function (ComponentHandler, TimelineComponent, ValueChannel, EventChannel, PromiseUtil, ArrayUtil, SystemBus, _) {
    'use strict';
    __touch(21348);
    var TWEEN = window.TWEEN;
    __touch(21349);
    function TimelineComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(21363);
        this._type = 'TimelineComponent';
        __touch(21364);
    }
    __touch(21350);
    TimelineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(21351);
    TimelineComponentHandler.prototype.constructor = TimelineComponentHandler;
    __touch(21352);
    ComponentHandler._registerClass('timeline', TimelineComponentHandler);
    __touch(21353);
    TimelineComponentHandler.prototype._prepare = function () {
    };
    __touch(21354);
    TimelineComponentHandler.prototype._create = function () {
        return new TimelineComponent();
        __touch(21365);
    };
    __touch(21355);
    TimelineComponentHandler.tweenMap = {
        'translationX': ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 0),
        'translationY': ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 1),
        'translationZ': ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 2),
        'scaleX': ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 0),
        'scaleY': ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 1),
        'scaleZ': ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 2),
        'rotationX': ValueChannel.getRotationTweener.bind(null, 0),
        'rotationY': ValueChannel.getRotationTweener.bind(null, 1),
        'rotationZ': ValueChannel.getRotationTweener.bind(null, 2)
    };
    __touch(21356);
    function getEasingFunction(easingString) {
        if (!easingString) {
            return TWEEN.Easing.Linear.None;
            __touch(21370);
        }
        var separator = easingString.indexOf('.');
        __touch(21366);
        var easingType = easingString.substr(0, separator);
        __touch(21367);
        var easingDirection = easingString.substr(separator + 1);
        __touch(21368);
        return TWEEN.Easing[easingType][easingDirection];
        __touch(21369);
    }
    __touch(21357);
    function updateValueChannelKeyframe(keyframeConfig, keyframeId, channel) {
        var needsResorting = false;
        __touch(21371);
        var keyframe = ArrayUtil.find(channel.keyframes, function (keyframe) {
            return keyframe.id === keyframeId;
            __touch(21375);
        });
        __touch(21372);
        var easingFunction = getEasingFunction(keyframeConfig.easing);
        __touch(21373);
        if (!keyframe) {
            channel.addKeyframe(keyframeId, keyframeConfig.time, keyframeConfig.value, easingFunction);
            __touch(21376);
        } else {
            if (keyframe.time !== +keyframeConfig.time) {
                needsResorting = true;
                __touch(21380);
            }
            keyframe.time = +keyframeConfig.time;
            __touch(21377);
            keyframe.value = +keyframeConfig.value;
            __touch(21378);
            keyframe.easingFunction = easingFunction;
            __touch(21379);
        }
        return { needsResorting: needsResorting };
        __touch(21374);
    }
    __touch(21358);
    function updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig) {
        var needsResorting = false;
        __touch(21381);
        var callbackEntry = ArrayUtil.find(channel.keyframes, function (callbackEntry) {
            return callbackEntry.id === keyframeId;
            __touch(21385);
        });
        __touch(21382);
        var eventEmitter = function () {
            SystemBus.emit(channelConfig.eventName, keyframeConfig.value);
            __touch(21386);
        };
        __touch(21383);
        if (!callbackEntry) {
            channel.addCallback(keyframeId, keyframeConfig.time, eventEmitter);
            __touch(21387);
        } else {
            if (callbackEntry.time !== +keyframeConfig.time) {
                needsResorting = true;
                __touch(21390);
            }
            callbackEntry.time = +keyframeConfig.time;
            __touch(21388);
            callbackEntry.callback = eventEmitter;
            __touch(21389);
        }
        return { needsResorting: needsResorting };
        __touch(21384);
    }
    __touch(21359);
    function updateChannel(channelConfig, channelId, component, entityResolver, rotationMap) {
        var channel = ArrayUtil.find(component.channels, function (channel) {
            return channel.id === channelId;
            __touch(21395);
        });
        __touch(21391);
        if (!channel) {
            var key = channelConfig.propertyKey;
            __touch(21396);
            if (key) {
                var entityId = channelConfig.entityId;
                __touch(21398);
                if (entityId && !rotationMap[entityId]) {
                    rotationMap[entityId] = [
                        0,
                        0,
                        0
                    ];
                    __touch(21401);
                }
                var updateCallback = TimelineComponentHandler.tweenMap[key](entityId, entityResolver, rotationMap[entityId]);
                __touch(21399);
                channel = new ValueChannel(channelId, { callbackUpdate: updateCallback });
                __touch(21400);
            } else {
                channel = new EventChannel(channelId);
                __touch(21402);
            }
            component.channels.push(channel);
            __touch(21397);
        } else if (channelConfig.entityId && channel.callbackUpdate && channel.callbackUpdate.rotation) {
            var rotation = rotationMap[channelConfig.entityId] = channel.callbackUpdate.rotation;
            __touch(21403);
            rotation[0] = 0;
            __touch(21404);
            rotation[1] = 0;
            __touch(21405);
            rotation[2] = 0;
            __touch(21406);
        }
        channel.enabled = channelConfig.enabled !== false;
        __touch(21392);
        channel.keyframes = channel.keyframes.filter(function (keyframe) {
            return !!channelConfig.keyframes[keyframe.id];
            __touch(21407);
        });
        __touch(21393);
        var needsResorting = false;
        __touch(21394);
        if (channelConfig.propertyKey) {
            for (var keyframeId in channelConfig.keyframes) {
                var keyframeConfig = channelConfig.keyframes[keyframeId];
                __touch(21409);
                var updateResult = updateValueChannelKeyframe(keyframeConfig, keyframeId, channel, channelConfig);
                __touch(21410);
                needsResorting = needsResorting || updateResult.needsResorting;
                __touch(21411);
            }
            __touch(21408);
        } else {
            for (var keyframeId in channelConfig.keyframes) {
                var keyframeConfig = channelConfig.keyframes[keyframeId];
                __touch(21413);
                var updateResult = updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig);
                __touch(21414);
                needsResorting = needsResorting || updateResult.needsResorting;
                __touch(21415);
            }
            __touch(21412);
        }
        if (needsResorting) {
            channel.sort();
            __touch(21416);
        }
    }
    __touch(21360);
    TimelineComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(21417);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(21425);
            }
            if (!isNaN(config.duration)) {
                component.duration = +config.duration;
                __touch(21426);
            }
            component.loop = config.loop.enabled === true;
            __touch(21419);
            component.channels = component.channels.filter(function (channel) {
                return !!config.channels[channel.id];
                __touch(21427);
            });
            __touch(21420);
            var entityResolver = function (entityId) {
                return that.world.entityManager.getEntityById(entityId);
                __touch(21428);
            };
            __touch(21421);
            var rotationMap = {};
            __touch(21422);
            _.forEach(config.channels, function (channelConfig) {
                updateChannel(channelConfig, channelConfig.id, component, entityResolver, rotationMap);
                __touch(21429);
            }, null, 'sortValue');
            __touch(21423);
            return component;
            __touch(21424);
        });
        __touch(21418);
    };
    __touch(21361);
    return TimelineComponentHandler;
    __touch(21362);
});
__touch(21347);
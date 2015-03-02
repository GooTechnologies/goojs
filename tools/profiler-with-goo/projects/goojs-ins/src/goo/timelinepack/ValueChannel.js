define([
    'goo/timelinepack/AbstractTimelineChannel',
    'goo/math/MathUtils'
], function (AbstractTimelineChannel, MathUtils) {
    'use strict';
    __touch(21460);
    function ValueChannel(id, options) {
        AbstractTimelineChannel.call(this, id);
        __touch(21470);
        this.value = 0;
        __touch(21471);
        options = options || {};
        __touch(21472);
        this.callbackUpdate = options.callbackUpdate;
        __touch(21473);
        this.callbackEnd = options.callbackEnd;
        __touch(21474);
    }
    __touch(21461);
    ValueChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
    __touch(21462);
    ValueChannel.prototype.constructor = AbstractTimelineChannel;
    __touch(21463);
    ValueChannel.prototype.addKeyframe = function (id, time, value, easingFunction) {
        var newKeyframe = {
            id: id,
            time: time,
            value: value,
            easingFunction: easingFunction
        };
        __touch(21475);
        if (time > this.lastTime) {
            this.keyframes.push(newKeyframe);
            __touch(21477);
            this.lastTime = time;
            __touch(21478);
        } else if (!this.keyframes.length || time < this.keyframes[0].time) {
            this.keyframes.unshift(newKeyframe);
            __touch(21479);
        } else {
            var index = this._find(this.keyframes, time) + 1;
            __touch(21480);
            this.keyframes.splice(index, 0, newKeyframe);
            __touch(21481);
        }
        return this;
        __touch(21476);
    };
    __touch(21464);
    ValueChannel.prototype.update = function (time) {
        if (!this.enabled) {
            return this.value;
            __touch(21487);
        }
        if (!this.keyframes.length) {
            return this.value;
            __touch(21488);
        }
        var newValue;
        __touch(21482);
        var newEntryIndex;
        __touch(21483);
        if (time <= this.keyframes[0].time) {
            newValue = this.keyframes[0].value;
            __touch(21489);
        } else if (time >= this.keyframes[this.keyframes.length - 1].time) {
            newValue = this.keyframes[this.keyframes.length - 1].value;
            __touch(21490);
        } else {
            newEntryIndex = this._find(this.keyframes, time);
            __touch(21491);
            var newEntry = this.keyframes[newEntryIndex];
            __touch(21492);
            var nextEntry = this.keyframes[newEntryIndex + 1];
            __touch(21493);
            var progressInEntry = (time - newEntry.time) / (nextEntry.time - newEntry.time);
            __touch(21494);
            var progressValue = newEntry.easingFunction(progressInEntry);
            __touch(21495);
            newValue = MathUtils.lerp(progressValue, newEntry.value, nextEntry.value);
            __touch(21496);
        }
        this.value = newValue;
        __touch(21484);
        this.callbackUpdate(time, this.value, newEntryIndex);
        __touch(21485);
        return this;
        __touch(21486);
    };
    __touch(21465);
    ValueChannel.prototype.setTime = ValueChannel.prototype.update;
    __touch(21466);
    ValueChannel.getSimpleTransformTweener = function (type, dimensionIndex, entityId, resolver) {
        var entity;
        __touch(21497);
        return function (time, value) {
            if (!entity) {
                entity = resolver(entityId);
                __touch(21499);
            }
            if (entity) {
                entity.transformComponent.transform[type].data[dimensionIndex] = value;
                __touch(21500);
                entity.transformComponent.setUpdated();
                __touch(21501);
            }
        };
        __touch(21498);
    };
    __touch(21467);
    ValueChannel.getRotationTweener = function (angleIndex, entityId, resolver, rotation) {
        var entity;
        __touch(21502);
        var func = function (time, value) {
            if (!entity) {
                entity = resolver(entityId);
                __touch(21506);
            }
            if (entity) {
                var rotation = func.rotation;
                __touch(21507);
                rotation[angleIndex] = value * MathUtils.DEG_TO_RAD;
                __touch(21508);
                entity.transformComponent.transform.rotation.fromAngles(rotation[0], rotation[1], rotation[2]);
                __touch(21509);
                entity.transformComponent.setUpdated();
                __touch(21510);
            }
        };
        __touch(21503);
        func.rotation = rotation;
        __touch(21504);
        return func;
        __touch(21505);
    };
    __touch(21468);
    return ValueChannel;
    __touch(21469);
});
__touch(21459);
define([
    'goo/animationpack/clip/AbstractAnimationChannel',
    'goo/animationpack/clip/TriggerData'
], function (AbstractAnimationChannel, TriggerData) {
    'use strict';
    __touch(2608);
    function TriggerChannel(channelName, times, keys, blendType) {
        AbstractAnimationChannel.call(this, channelName, times, blendType);
        __touch(2614);
        this._keys = keys ? keys.slice(0) : null;
        __touch(2615);
        this.guarantee = false;
        __touch(2616);
    }
    __touch(2609);
    TriggerChannel.prototype = Object.create(AbstractAnimationChannel.prototype);
    __touch(2610);
    TriggerChannel.prototype.createStateDataObject = function () {
        return new TriggerData();
        __touch(2617);
    };
    __touch(2611);
    TriggerChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, triggerData) {
        var oldIndex = triggerData._currentIndex;
        __touch(2618);
        var newIndex = progressPercent !== 1 ? sampleIndex : sampleIndex + 1;
        __touch(2619);
        if (oldIndex === newIndex || !this.guarantee) {
            triggerData.arm(newIndex, [this._keys[newIndex]]);
            __touch(2620);
        } else {
            var triggers = [];
            __touch(2621);
            if (oldIndex > newIndex) {
                for (var i = oldIndex + 1; i < this._keys.length; i++) {
                    triggers.push(this._keys[i]);
                    __touch(2624);
                }
                oldIndex = -1;
                __touch(2623);
            }
            for (var i = oldIndex + 1; i <= newIndex; i++) {
                triggers.push(this._keys[i]);
                __touch(2625);
            }
            triggerData.arm(newIndex, triggers);
            __touch(2622);
        }
    };
    __touch(2612);
    return TriggerChannel;
    __touch(2613);
});
__touch(2607);
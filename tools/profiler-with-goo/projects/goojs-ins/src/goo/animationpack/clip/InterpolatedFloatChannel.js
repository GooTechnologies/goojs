define([
    'goo/animationpack/clip/AbstractAnimationChannel',
    'goo/math/MathUtils'
], function (AbstractAnimationChannel, MathUtils) {
    'use strict';
    __touch(2472);
    function InterpolatedFloatChannel(channelName, times, values, blendType) {
        AbstractAnimationChannel.call(this, channelName, times, blendType);
        __touch(2479);
        this._values = values ? values.slice(0) : null;
        __touch(2480);
    }
    __touch(2473);
    InterpolatedFloatChannel.prototype = Object.create(AbstractAnimationChannel.prototype);
    __touch(2474);
    InterpolatedFloatChannel.prototype.createStateDataObject = function () {
        return [0];
        __touch(2481);
    };
    __touch(2475);
    InterpolatedFloatChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, value) {
        value[0] = MathUtils.lerp(progressPercent, this._values[sampleIndex], this._values[sampleIndex + 1]);
        __touch(2482);
    };
    __touch(2476);
    InterpolatedFloatChannel.prototype.getData = function (index, store) {
        var rVal = store || [];
        __touch(2483);
        rVal[0] = this._values[index];
        __touch(2484);
        return rVal;
        __touch(2485);
    };
    __touch(2477);
    return InterpolatedFloatChannel;
    __touch(2478);
});
__touch(2471);
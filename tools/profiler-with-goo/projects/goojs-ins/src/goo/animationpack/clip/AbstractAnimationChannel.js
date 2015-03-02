define([], function () {
    'use strict';
    __touch(2377);
    function AbstractAnimationChannel(channelName, times, blendType) {
        this._blendType = blendType || 'Linear';
        __touch(2383);
        this._channelName = channelName;
        __touch(2384);
        if ((times instanceof Array || times instanceof Float32Array) && times.length) {
            this._times = new Float32Array(times);
            __touch(2386);
        } else {
            this._times = [];
            __touch(2387);
        }
        this._lastStartFrame = 0;
        __touch(2385);
    }
    __touch(2378);
    AbstractAnimationChannel.prototype.getSampleCount = function () {
        return this._times.length;
        __touch(2388);
    };
    __touch(2379);
    AbstractAnimationChannel.prototype.getMaxTime = function () {
        return this._times.length ? this._times[this._times.length - 1] : 0;
        __touch(2389);
    };
    __touch(2380);
    AbstractAnimationChannel.prototype.updateSample = function (clockTime, applyTo) {
        var timeCount = this._times.length;
        __touch(2390);
        if (!timeCount) {
            return;
            __touch(2392);
        }
        var lastFrame = timeCount - 1;
        __touch(2391);
        if (clockTime < 0 || timeCount === 1) {
            this.setCurrentSample(0, 0, applyTo);
            __touch(2393);
        } else if (clockTime >= this._times[lastFrame]) {
            this.setCurrentSample(lastFrame, 0, applyTo);
            __touch(2394);
        } else {
            var startFrame = 0;
            __touch(2395);
            if (clockTime >= this._times[this._lastStartFrame]) {
                startFrame = this._lastStartFrame;
                __touch(2399);
                for (var i = this._lastStartFrame; i < timeCount - 1; i++) {
                    if (this._times[i] >= clockTime) {
                        break;
                        __touch(2401);
                    }
                    startFrame = i;
                    __touch(2400);
                }
            } else {
                for (var i = 0; i < this._lastStartFrame; i++) {
                    if (this._times[i] >= clockTime) {
                        break;
                        __touch(2403);
                    }
                    startFrame = i;
                    __touch(2402);
                }
            }
            var progressPercent = (clockTime - this._times[startFrame]) / (this._times[startFrame + 1] - this._times[startFrame]);
            __touch(2396);
            this.setCurrentSample(startFrame, progressPercent, applyTo);
            __touch(2397);
            this._lastStartFrame = startFrame;
            __touch(2398);
        }
    };
    __touch(2381);
    return AbstractAnimationChannel;
    __touch(2382);
});
__touch(2376);
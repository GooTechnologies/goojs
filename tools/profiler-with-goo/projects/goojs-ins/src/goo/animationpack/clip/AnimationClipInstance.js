define(['goo/entities/World'], function (World) {
    'use strict';
    __touch(2439);
    function AnimationClipInstance() {
        this._active = true;
        __touch(2445);
        this._loopCount = 0;
        __touch(2446);
        this._timeScale = 1;
        __touch(2447);
        this._startTime = 0;
        __touch(2448);
        this._prevClockTime = 0;
        __touch(2449);
        this._prevUnscaledClockTime = 0;
        __touch(2450);
        this._clipStateObjects = {};
        __touch(2451);
    }
    __touch(2440);
    AnimationClipInstance.prototype.setTimeScale = function (scale, globalTime) {
        globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
        __touch(2452);
        if (this._active && this._timeScale !== scale) {
            if (this._timeScale !== 0 && scale !== 0) {
                var now = globalTime;
                __touch(2454);
                var timePassed = now - this._startTime;
                __touch(2455);
                timePassed *= this._timeScale;
                __touch(2456);
                timePassed /= scale;
                __touch(2457);
                this._startTime = now - timePassed;
                __touch(2458);
            } else if (this._timeScale === 0) {
                var now = globalTime;
                __touch(2459);
                this._startTime = now - this._prevUnscaledClockTime;
                __touch(2460);
            }
        }
        this._timeScale = scale;
        __touch(2453);
    };
    __touch(2441);
    AnimationClipInstance.prototype.getApplyTo = function (channel) {
        var channelName = channel._channelName;
        __touch(2461);
        var rVal = this._clipStateObjects[channelName];
        __touch(2462);
        if (!rVal) {
            rVal = channel.createStateDataObject();
            __touch(2464);
            this._clipStateObjects[channelName] = rVal;
            __touch(2465);
        }
        return rVal;
        __touch(2463);
    };
    __touch(2442);
    AnimationClipInstance.prototype.clone = function () {
        var cloned = new AnimationClipInstance();
        __touch(2466);
        cloned._active = this._active;
        __touch(2467);
        cloned._loopCount = this._loopCount;
        __touch(2468);
        cloned._timeScale = this._timeScale;
        __touch(2469);
        return cloned;
        __touch(2470);
    };
    __touch(2443);
    return AnimationClipInstance;
    __touch(2444);
});
__touch(2438);
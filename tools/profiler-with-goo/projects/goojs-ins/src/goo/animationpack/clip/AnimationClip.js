define(function () {
    'use strict';
    __touch(2405);
    function AnimationClip(name, channels) {
        this._name = name;
        __touch(2414);
        this._channels = channels || [];
        __touch(2415);
        this._maxTime = -1;
        __touch(2416);
        this.updateMaxTimeIndex();
        __touch(2417);
    }
    __touch(2406);
    AnimationClip.prototype.update = function (clockTime, instance) {
        for (var i = 0, max = this._channels.length; i < max; ++i) {
            var channel = this._channels[i];
            __touch(2418);
            var applyTo = instance.getApplyTo(channel);
            __touch(2419);
            channel.updateSample(clockTime, applyTo);
            __touch(2420);
        }
    };
    __touch(2407);
    AnimationClip.prototype.addChannel = function (channel) {
        this._channels.push(channel);
        __touch(2421);
        this.updateMaxTimeIndex();
        __touch(2422);
    };
    __touch(2408);
    AnimationClip.prototype.removeChannel = function (channel) {
        var idx = this._channels.indexOf(channel);
        __touch(2423);
        if (idx >= 0) {
            this._channels.splice(idx, 1);
            __touch(2425);
            this.updateMaxTimeIndex();
            __touch(2426);
            return true;
            __touch(2427);
        }
        return false;
        __touch(2424);
    };
    __touch(2409);
    AnimationClip.prototype.findChannelByName = function (channelName) {
        for (var i = 0, max = this._channels.length; i < max; ++i) {
            var channel = this._channels[i];
            __touch(2429);
            if (channelName === channel._channelName) {
                return channel;
                __touch(2430);
            }
        }
        return null;
        __touch(2428);
    };
    __touch(2410);
    AnimationClip.prototype.updateMaxTimeIndex = function () {
        this._maxTime = -1;
        __touch(2431);
        var max;
        __touch(2432);
        for (var i = 0; i < this._channels.length; i++) {
            var channel = this._channels[i];
            __touch(2433);
            max = channel.getMaxTime();
            __touch(2434);
            if (max > this._maxTime) {
                this._maxTime = max;
                __touch(2435);
            }
        }
    };
    __touch(2411);
    AnimationClip.prototype.toString = function () {
        return this._name + ': ' + this._channels.map(function (channel) {
            return channel._channelName;
            __touch(2437);
        });
        __touch(2436);
    };
    __touch(2412);
    return AnimationClip;
    __touch(2413);
});
__touch(2404);
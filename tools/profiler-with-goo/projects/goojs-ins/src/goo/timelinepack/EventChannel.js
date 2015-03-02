define(['goo/timelinepack/AbstractTimelineChannel'], function (AbstractTimelineChannel) {
    'use strict';
    __touch(21279);
    function EventChannel(id) {
        AbstractTimelineChannel.call(this, id);
        __touch(21287);
        this.oldTime = 0;
        __touch(21288);
        this.callbackIndex = 0;
        __touch(21289);
    }
    __touch(21280);
    EventChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
    __touch(21281);
    EventChannel.prototype.constructor = AbstractTimelineChannel;
    __touch(21282);
    EventChannel.prototype.addCallback = function (id, time, callback) {
        var newCallback = {
            id: id,
            time: time,
            callback: callback
        };
        __touch(21290);
        if (time > this.lastTime) {
            this.keyframes.push(newCallback);
            __touch(21292);
            this.lastTime = time;
            __touch(21293);
        } else if (!this.keyframes.length || time < this.keyframes[0].time) {
            this.keyframes.unshift(newCallback);
            __touch(21294);
        } else {
            var index = this._find(this.keyframes, time) + 1;
            __touch(21295);
            this.keyframes.splice(index, 0, newCallback);
            __touch(21296);
        }
        return this;
        __touch(21291);
    };
    __touch(21283);
    EventChannel.prototype.update = function (time) {
        if (!this.enabled) {
            return this;
            __touch(21300);
        }
        if (!this.keyframes.length) {
            return this;
            __touch(21301);
        }
        if (time < this.oldTime) {
            while (this.callbackIndex < this.keyframes.length) {
                this.keyframes[this.callbackIndex].callback();
                __touch(21304);
                this.callbackIndex++;
                __touch(21305);
            }
            __touch(21302);
            this.callbackIndex = 0;
            __touch(21303);
        }
        while (this.callbackIndex < this.keyframes.length && time > this.keyframes[this.callbackIndex].time) {
            this.keyframes[this.callbackIndex].callback();
            __touch(21306);
            this.callbackIndex++;
            __touch(21307);
        }
        __touch(21297);
        this.oldTime = time;
        __touch(21298);
        return this;
        __touch(21299);
    };
    __touch(21284);
    EventChannel.prototype.setTime = function (time) {
        if (!this.enabled) {
            return this;
            __touch(21310);
        }
        if (!this.keyframes.length) {
            return this;
            __touch(21311);
        }
        if (time <= this.keyframes[0].time) {
            this.callbackIndex = 0;
            __touch(21312);
        } else {
            this.callbackIndex = this._find(this.keyframes, time) + 1;
            __touch(21313);
        }
        this.oldTime = time;
        __touch(21308);
        return this;
        __touch(21309);
    };
    __touch(21285);
    return EventChannel;
    __touch(21286);
});
__touch(21278);
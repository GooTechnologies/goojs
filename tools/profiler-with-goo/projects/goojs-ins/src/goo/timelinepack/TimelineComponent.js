define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(21315);
    function TimelineComponent() {
        this.type = 'TimelineComponent';
        __touch(21324);
        this.channels = [];
        __touch(21325);
        this.time = 0;
        __touch(21326);
        this.duration = 0;
        __touch(21327);
        this.loop = false;
        __touch(21328);
    }
    __touch(21316);
    TimelineComponent.prototype = Object.create(Component.prototype);
    __touch(21317);
    TimelineComponent.prototype.constructor = TimelineComponent;
    __touch(21318);
    TimelineComponent.prototype.addChannel = function (channel) {
        this.channels.push(channel);
        __touch(21329);
        return this;
        __touch(21330);
    };
    __touch(21319);
    TimelineComponent.prototype.update = function (tpf) {
        var time = this.time + tpf;
        __touch(21331);
        if (time > this.duration) {
            if (this.loop) {
                time = time % this.duration;
                __touch(21334);
            } else {
                time = this.duration;
                __touch(21335);
            }
        }
        if (time === this.time) {
            return this;
            __touch(21336);
        }
        this.time = time;
        __touch(21332);
        for (var i = 0; i < this.channels.length; i++) {
            var channel = this.channels[i];
            __touch(21337);
            channel.update(this.time);
            __touch(21338);
        }
        return this;
        __touch(21333);
    };
    __touch(21320);
    TimelineComponent.prototype.setTime = function (time) {
        this.time = time;
        __touch(21339);
        for (var i = 0; i < this.channels.length; i++) {
            var channel = this.channels[i];
            __touch(21341);
            channel.setTime(this.time);
            __touch(21342);
        }
        return this;
        __touch(21340);
    };
    __touch(21321);
    TimelineComponent.prototype.getValues = function () {
        var retVal = {};
        __touch(21343);
        for (var i = 0; i < this.channels.length; i++) {
            var channel = this.channels[i];
            __touch(21345);
            if (typeof channel.value !== 'undefined' && channel.keyframes.length) {
                retVal[channel.id] = channel.value;
                __touch(21346);
            }
        }
        return retVal;
        __touch(21344);
    };
    __touch(21322);
    return TimelineComponent;
    __touch(21323);
});
__touch(21314);
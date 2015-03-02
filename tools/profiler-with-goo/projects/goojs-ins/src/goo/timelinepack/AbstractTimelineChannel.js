define([], function () {
    'use strict';
    __touch(21255);
    function AbstractTimelineChannel(id) {
        this.id = id;
        __touch(21260);
        this.enabled = true;
        __touch(21261);
        this.keyframes = [];
        __touch(21262);
        this.lastTime = 0;
        __touch(21263);
    }
    __touch(21256);
    AbstractTimelineChannel.prototype._find = function (sortedArray, time) {
        var start = 0;
        __touch(21264);
        var end = sortedArray.length - 1;
        __touch(21265);
        var lastTime = sortedArray[sortedArray.length - 1].time;
        __touch(21266);
        if (time > lastTime) {
            return end;
            __touch(21269);
        }
        while (end - start > 1) {
            var mid = Math.floor((end + start) / 2);
            __touch(21270);
            var midTime = sortedArray[mid].time;
            __touch(21271);
            if (time > midTime) {
                start = mid;
                __touch(21272);
            } else {
                end = mid;
                __touch(21273);
            }
        }
        __touch(21267);
        return start;
        __touch(21268);
    };
    __touch(21257);
    AbstractTimelineChannel.prototype.sort = function () {
        this.keyframes.sort(function (a, b) {
            return a.time - b.time;
            __touch(21277);
        });
        __touch(21274);
        this.lastTime = this.keyframes[this.keyframes.length - 1].time;
        __touch(21275);
        return this;
        __touch(21276);
    };
    __touch(21258);
    return AbstractTimelineChannel;
    __touch(21259);
});
__touch(21254);
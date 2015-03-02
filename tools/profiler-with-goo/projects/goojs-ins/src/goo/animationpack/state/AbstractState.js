define([], function () {
    'use strict';
    __touch(3012);
    function AbstractState() {
        this._globalStartTime = 0;
        __touch(3020);
        this.onFinished = null;
        __touch(3021);
    }
    __touch(3013);
    AbstractState.prototype.update = function () {
    };
    __touch(3014);
    AbstractState.prototype.postUpdate = function () {
    };
    __touch(3015);
    AbstractState.prototype.getCurrentSourceData = function () {
    };
    __touch(3016);
    AbstractState.prototype.resetClips = function (globalTime) {
        this._globalStartTime = globalTime;
        __touch(3022);
    };
    __touch(3017);
    AbstractState.prototype.shiftClipTime = function (shiftTime) {
        this._globalStartTime += shiftTime;
        __touch(3023);
    };
    __touch(3018);
    return AbstractState;
    __touch(3019);
});
__touch(3011);
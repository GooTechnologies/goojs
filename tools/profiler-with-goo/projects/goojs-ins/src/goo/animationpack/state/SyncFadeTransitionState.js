define(['goo/animationpack/state/FadeTransitionState'], function (FadeTransitionState) {
    'use strict';
    __touch(3139);
    function SyncFadeTransitionState() {
        FadeTransitionState.call(this);
        __touch(3146);
    }
    __touch(3140);
    SyncFadeTransitionState.prototype = Object.create(FadeTransitionState.prototype);
    __touch(3141);
    SyncFadeTransitionState.prototype.constructor = SyncFadeTransitionState;
    __touch(3142);
    SyncFadeTransitionState.prototype.resetClips = function (globalTime) {
        FadeTransitionState.prototype.resetClips.call(this, globalTime);
        __touch(3147);
        this._targetState.resetClips(this._sourceState._globalStartTime);
        __touch(3148);
    };
    __touch(3143);
    SyncFadeTransitionState.prototype.shiftClipTime = function (shiftTime) {
        FadeTransitionState.prototype.shiftClipTime.call(this, shiftTime);
        __touch(3149);
        this._targetState.shiftClipTime(this._sourceState._globalStartTime + shiftTime);
        __touch(3150);
        this._sourceState.shiftClipTime(shiftTime);
        __touch(3151);
    };
    __touch(3144);
    return SyncFadeTransitionState;
    __touch(3145);
});
__touch(3138);
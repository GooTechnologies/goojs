define(['goo/animationpack/state/AbstractTransitionState'], function (AbstractTransitionState) {
    'use strict';
    __touch(3069);
    function FadeTransitionState() {
        AbstractTransitionState.call(this);
        __touch(3078);
    }
    __touch(3070);
    FadeTransitionState.prototype = Object.create(AbstractTransitionState.prototype);
    __touch(3071);
    FadeTransitionState.prototype.constructor = FadeTransitionState;
    __touch(3072);
    FadeTransitionState.prototype.update = function (globalTime) {
        AbstractTransitionState.prototype.update.call(this, globalTime);
        __touch(3079);
        if (this._sourceState) {
            this._sourceState.update(globalTime);
            __touch(3080);
        }
        if (this._targetState) {
            this._targetState.update(globalTime);
            __touch(3081);
        }
    };
    __touch(3073);
    FadeTransitionState.prototype.postUpdate = function () {
        if (this._sourceState) {
            this._sourceState.postUpdate();
            __touch(3082);
        }
        if (this._targetState) {
            this._targetState.postUpdate();
            __touch(3083);
        }
    };
    __touch(3074);
    FadeTransitionState.prototype.resetClips = function (globalTime) {
        AbstractTransitionState.prototype.resetClips.call(this, globalTime);
        __touch(3084);
        if (this._targetState) {
            this._targetState.resetClips(globalTime);
            __touch(3085);
        }
    };
    __touch(3075);
    FadeTransitionState.prototype.shiftClipTime = function (shiftTime) {
        AbstractTransitionState.prototype.shiftClipTime.call(this, shiftTime);
        __touch(3086);
        if (this._targetState) {
            this._targetState.shiftClipTime(shiftTime);
            __touch(3087);
        }
        if (this._sourceState) {
            this._sourceState.shiftClipTime(shiftTime);
            __touch(3088);
        }
    };
    __touch(3076);
    return FadeTransitionState;
    __touch(3077);
});
__touch(3068);
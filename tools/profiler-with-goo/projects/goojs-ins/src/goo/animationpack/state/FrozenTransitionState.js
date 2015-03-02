define(['goo/animationpack/state/AbstractTransitionState'], function (AbstractTransitionState) {
    'use strict';
    __touch(3090);
    function FrozenTransitionState() {
        AbstractTransitionState.call(this);
        __touch(3099);
    }
    __touch(3091);
    FrozenTransitionState.prototype = Object.create(AbstractTransitionState.prototype);
    __touch(3092);
    FrozenTransitionState.prototype.constructor = FrozenTransitionState;
    __touch(3093);
    FrozenTransitionState.prototype.update = function (globalTime) {
        AbstractTransitionState.prototype.update.call(this, globalTime);
        __touch(3100);
        if (this._targetState) {
            this._targetState.update(globalTime);
            __touch(3101);
        }
    };
    __touch(3094);
    FrozenTransitionState.prototype.postUpdate = function () {
        if (this._targetState) {
            this._targetState.postUpdate();
            __touch(3102);
        }
    };
    __touch(3095);
    FrozenTransitionState.prototype.resetClips = function (globalTime) {
        AbstractTransitionState.prototype.resetClips.call(this, globalTime);
        __touch(3103);
        this._targetState.resetClips(globalTime);
        __touch(3104);
    };
    __touch(3096);
    FrozenTransitionState.prototype.shiftClipTime = function (shiftTime) {
        AbstractTransitionState.prototype.shiftClipTime.call(this, shiftTime);
        __touch(3105);
        this._targetState.shiftClipTime(shiftTime);
        __touch(3106);
    };
    __touch(3097);
    return FrozenTransitionState;
    __touch(3098);
});
__touch(3089);
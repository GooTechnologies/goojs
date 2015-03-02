define(['goo/animationpack/state/AbstractState'], function (AbstractState) {
    'use strict';
    __touch(3108);
    function SteadyState(name) {
        AbstractState.call(this);
        __touch(3120);
        this.id = null;
        __touch(3121);
        this._name = name;
        __touch(3122);
        this._transitions = {};
        __touch(3123);
        this._sourceTree = null;
        __touch(3124);
    }
    __touch(3109);
    SteadyState.prototype = Object.create(AbstractState.prototype);
    __touch(3110);
    SteadyState.prototype.constructor = SteadyState;
    __touch(3111);
    SteadyState.prototype.setClipSource = function (clipSource) {
        this._sourceTree = clipSource;
        __touch(3125);
    };
    __touch(3112);
    SteadyState.prototype.update = function (globalTime) {
        if (!this._sourceTree.setTime(globalTime)) {
            if (this.onFinished) {
                this.onFinished();
                __touch(3126);
            }
        }
    };
    __touch(3113);
    SteadyState.prototype.getCurrentSourceData = function () {
        return this._sourceTree.getSourceData();
        __touch(3127);
    };
    __touch(3114);
    SteadyState.prototype.resetClips = function (globalStartTime) {
        AbstractState.prototype.resetClips.call(this, globalStartTime);
        __touch(3128);
        this._sourceTree.resetClips(globalStartTime);
        __touch(3129);
    };
    __touch(3115);
    SteadyState.prototype.shiftClipTime = function (shiftTime) {
        AbstractState.prototype.shiftClipTime.call(this, shiftTime);
        __touch(3130);
        this._sourceTree.shiftClipTime(shiftTime);
        __touch(3131);
    };
    __touch(3116);
    SteadyState.prototype.setTimeScale = function (timeScale) {
        this._sourceTree.setTimeScale(timeScale);
        __touch(3132);
    };
    __touch(3117);
    SteadyState.prototype.clone = function () {
        var cloned = new SteadyState(this._name);
        __touch(3133);
        for (var key in this._transitions) {
            cloned._transitions[key] = this._transitions[key];
            __touch(3137);
        }
        __touch(3134);
        cloned._sourceTree = this._sourceTree.clone();
        __touch(3135);
        return cloned;
        __touch(3136);
    };
    __touch(3118);
    return SteadyState;
    __touch(3119);
});
__touch(3107);
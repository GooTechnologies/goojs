define([
    'goo/animationpack/state/AbstractState',
    'goo/animationpack/blendtree/BinaryLERPSource',
    'goo/math/MathUtils'
], function (AbstractState, BinaryLERPSource, MathUtils) {
    'use strict';
    __touch(3025);
    function AbstractTransitionState() {
        AbstractState.call(this);
        __touch(3037);
        this._sourceState = null;
        __touch(3038);
        this._targetState = null;
        __touch(3039);
        this._percent = 0;
        __touch(3040);
        this._sourceData = null;
        __touch(3041);
        this._fadeTime = 0;
        __touch(3042);
        this._blendType = 'Linear';
        __touch(3043);
    }
    __touch(3026);
    AbstractTransitionState.prototype = Object.create(AbstractState.prototype);
    __touch(3027);
    AbstractTransitionState.prototype.constructor = AbstractTransitionState;
    __touch(3028);
    AbstractTransitionState.prototype.update = function (globalTime) {
        var currentTime = globalTime - this._globalStartTime;
        __touch(3044);
        if (currentTime > this._fadeTime && this.onFinished) {
            this.onFinished();
            __touch(3047);
            return;
            __touch(3048);
        }
        var percent = currentTime / this._fadeTime;
        __touch(3045);
        switch (this._blendType) {
        case 'SCurve3':
            this._percent = MathUtils.scurve3(percent);
            break;
        case 'SCurve5':
            this._percent = MathUtils.scurve5(percent);
            break;
        default:
            this._percent = percent;
        }
        __touch(3046);
    };
    __touch(3029);
    AbstractTransitionState.prototype.readFromConfig = function (config) {
        if (config) {
            if (config.fadeTime !== undefined) {
                this._fadeTime = config.fadeTime;
                __touch(3049);
            }
            if (config.blendType !== undefined) {
                this._blendType = config.blendType;
                __touch(3050);
            }
        }
    };
    __touch(3030);
    AbstractTransitionState.prototype.getCurrentSourceData = function () {
        var sourceAData = this._sourceState ? this._sourceState.getCurrentSourceData() : null;
        __touch(3051);
        var sourceBData = this._targetState ? this._targetState.getCurrentSourceData() : null;
        __touch(3052);
        if (!this._sourceData) {
            this._sourceData = {};
            __touch(3054);
        }
        return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this._percent, this._sourceData);
        __touch(3053);
    };
    __touch(3031);
    AbstractTransitionState.prototype.isValid = function (timeWindow, globalTime) {
        var localTime = globalTime - this._sourceState._globalStartTime;
        __touch(3055);
        var start = timeWindow[0];
        __touch(3056);
        var end = timeWindow[1];
        __touch(3057);
        if (start <= 0) {
            if (end <= 0) {
                return true;
                __touch(3058);
            } else {
                return localTime <= end;
                __touch(3059);
            }
        } else {
            if (end <= 0) {
                return localTime >= start;
                __touch(3060);
            } else if (start <= end) {
                return start <= localTime && localTime <= end;
                __touch(3061);
            } else {
                return localTime >= start || localTime <= end;
                __touch(3062);
            }
        }
    };
    __touch(3032);
    AbstractTransitionState.prototype.resetClips = function (globalTime) {
        AbstractState.prototype.resetClips.call(this, globalTime);
        __touch(3063);
        this._percent = 0;
        __touch(3064);
    };
    __touch(3033);
    AbstractTransitionState.prototype.shiftClipTime = function (shiftTime) {
        AbstractState.prototype.shiftClipTime.call(this, shiftTime);
        __touch(3065);
    };
    __touch(3034);
    AbstractTransitionState.prototype.setTimeScale = function (timeScale) {
        if (this._sourceState) {
            this._sourceState.setTimeScale(timeScale);
            __touch(3066);
        }
        if (this._targetState) {
            this._targetState.setTimeScale(timeScale);
            __touch(3067);
        }
    };
    __touch(3035);
    return AbstractTransitionState;
    __touch(3036);
});
__touch(3024);
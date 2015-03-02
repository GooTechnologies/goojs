define([
    'goo/animationpack/state/FadeTransitionState',
    'goo/animationpack/state/SyncFadeTransitionState',
    'goo/animationpack/state/FrozenTransitionState',
    'goo/animationpack/state/SteadyState',
    'goo/animationpack/layer/LayerLERPBlender',
    'goo/entities/World',
    'goo/math/MathUtils'
], function (FadeTransitionState, SyncFadeTransitionState, FrozenTransitionState, SteadyState, LayerLERPBlender, World, MathUtils) {
    'use strict';
    __touch(2891);
    function AnimationLayer(name, key) {
        this.id = key;
        __touch(2917);
        this._name = name;
        __touch(2918);
        this._steadyStates = {};
        __touch(2919);
        this._currentState = null;
        __touch(2920);
        this._layerBlender = new LayerLERPBlender();
        __touch(2921);
        this._transitions = {};
        __touch(2922);
        this._transitionStates = {};
        __touch(2923);
    }
    __touch(2892);
    AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';
    __touch(2893);
    AnimationLayer.prototype.getStates = function () {
        return Object.keys(this._steadyStates);
        __touch(2924);
    };
    __touch(2894);
    AnimationLayer.prototype.setState = function (stateKey, state) {
        this._steadyStates[stateKey] = state;
        __touch(2925);
    };
    __touch(2895);
    AnimationLayer.prototype.setBlendWeight = function (weight) {
        if (this._layerBlender) {
            this._layerBlender._blendWeight = MathUtils.clamp(weight, 0, 1);
            __touch(2926);
        }
    };
    __touch(2896);
    AnimationLayer.prototype.getTransitions = function () {
        var transitions;
        __touch(2927);
        if (this._currentState) {
            transitions = Object.keys(this._currentState._transitions);
            __touch(2930);
        } else {
            transitions = [];
            __touch(2931);
        }
        if (this._transitions) {
            for (var key in this._transitions) {
                if (transitions.indexOf(key) === -1) {
                    transitions.push(key);
                    __touch(2933);
                }
            }
            __touch(2932);
        }
        transitions.sort();
        __touch(2928);
        return transitions;
        __touch(2929);
    };
    __touch(2897);
    AnimationLayer.prototype.update = function (globalTime) {
        if (this._currentState) {
            this._currentState.update(typeof globalTime !== 'undefined' ? globalTime : World.time);
            __touch(2934);
        }
    };
    __touch(2898);
    AnimationLayer.prototype.postUpdate = function () {
        if (this._currentState) {
            this._currentState.postUpdate();
            __touch(2935);
        }
    };
    __touch(2899);
    AnimationLayer.prototype.transitionTo = function (state, globalTime, finishCallback) {
        globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
        __touch(2936);
        var cState = this._currentState;
        __touch(2937);
        var transition;
        __touch(2938);
        if (this._steadyStates[state] === cState) {
            return false;
            __touch(2940);
        }
        if (!this._steadyStates[state]) {
            return false;
            __touch(2941);
        }
        if (cState && cState._transitions) {
            transition = cState._transitions[state] || cState._transitions['*'];
            __touch(2942);
        }
        if (!transition && this._transitions) {
            transition = this._transitions[state] || this._transitions['*'];
            __touch(2943);
        }
        if (cState instanceof SteadyState && transition) {
            var transitionState = this._getTransitionByType(transition.type);
            __touch(2944);
            this._doTransition(transitionState, cState, this._steadyStates[state], transition, globalTime, finishCallback);
            __touch(2945);
            return true;
            __touch(2946);
        } else if (!cState) {
            transition = this._transitions[state];
            __touch(2947);
            if (transition) {
                var transitionState = this._getTransitionByType(transition.type);
                __touch(2948);
                if (transitionState) {
                    this._doTransition(transitionState, null, this._steadyStates[state], transition, globalTime, finishCallback);
                    __touch(2949);
                    return true;
                    __touch(2950);
                }
            }
        }
        return false;
        __touch(2939);
    };
    __touch(2900);
    AnimationLayer.prototype._doTransition = function (transition, source, target, config, globalTime, finishCallback) {
        if (source) {
            transition._sourceState = source;
            __touch(2954);
            var timeWindow = config.timeWindow || [
                -1,
                -1
            ];
            __touch(2955);
            if (!transition.isValid(timeWindow, globalTime)) {
                console.warn('State not in allowed time window');
                __touch(2957);
                return;
                __touch(2958);
            }
            source.onFinished = null;
            __touch(2956);
        }
        transition._targetState = target;
        __touch(2951);
        transition.readFromConfig(config);
        __touch(2952);
        this.setCurrentState(transition, true, globalTime, finishCallback);
        __touch(2953);
    };
    __touch(2901);
    AnimationLayer.prototype.setCurrentState = function (state, rewind, globalTime, finishCallback) {
        globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
        __touch(2959);
        this._currentState = state;
        __touch(2960);
        if (state) {
            if (rewind) {
                state.resetClips(globalTime);
                __touch(2962);
            }
            state.onFinished = function () {
                this.setCurrentState(state._targetState || null, false, undefined, finishCallback);
                __touch(2963);
                if (state instanceof SteadyState && finishCallback instanceof Function) {
                    finishCallback();
                    __touch(2965);
                }
                this.update();
                __touch(2964);
            }.bind(this);
            __touch(2961);
        }
    };
    __touch(2902);
    AnimationLayer.prototype.getCurrentState = function () {
        return this._currentState;
        __touch(2966);
    };
    __touch(2903);
    AnimationLayer.prototype.setCurrentStateById = function (id, rewind, globalTime, callback) {
        var state = this.getStateById(id);
        __touch(2967);
        this.setCurrentState(state, rewind, globalTime, callback);
        __touch(2968);
    };
    __touch(2904);
    AnimationLayer.prototype.getStateById = function (id) {
        return this._steadyStates[id];
        __touch(2969);
    };
    __touch(2905);
    AnimationLayer.prototype.getStateByName = function (name) {
        for (var id in this._steadyStates) {
            var state = this._steadyStates[id];
            __touch(2971);
            if (state._name === name) {
                return this._steadyStates[id];
                __touch(2972);
            }
        }
        __touch(2970);
    };
    __touch(2906);
    AnimationLayer.prototype.setCurrentStateByName = function (stateName, rewind, globalTime) {
        if (stateName) {
            var state = this.getStateByName(stateName);
            __touch(2974);
            if (state) {
                this.setCurrentState(state, rewind, globalTime);
                __touch(2975);
                return true;
                __touch(2976);
            } else {
                console.warn('unable to find SteadyState named: ' + stateName);
                __touch(2977);
            }
        }
        return false;
        __touch(2973);
    };
    __touch(2907);
    AnimationLayer.prototype.getCurrentSourceData = function () {
        if (this._layerBlender) {
            return this._layerBlender.getBlendedSourceData();
            __touch(2978);
        }
        if (this._currentState) {
            return this._currentState.getCurrentSourceData();
            __touch(2979);
        } else {
            return null;
            __touch(2980);
        }
    };
    __touch(2908);
    AnimationLayer.prototype.updateLayerBlending = function (previousLayer) {
        if (this._layerBlender) {
            this._layerBlender._layerA = previousLayer;
            __touch(2981);
            this._layerBlender._layerB = this;
            __touch(2982);
        }
    };
    __touch(2909);
    AnimationLayer.prototype.clearCurrentState = function () {
        this.setCurrentState(null);
        __touch(2983);
    };
    __touch(2910);
    AnimationLayer.prototype.resetClips = function (globalTime) {
        if (this._currentState) {
            this._currentState.resetClips(typeof globalTime !== 'undefined' ? globalTime : World.time);
            __touch(2984);
        }
    };
    __touch(2911);
    AnimationLayer.prototype.shiftClipTime = function (shiftTime) {
        if (this._currentState) {
            this._currentState.shiftClipTime(typeof shiftTime !== 'undefined' ? shiftTime : 0);
            __touch(2985);
        }
    };
    __touch(2912);
    AnimationLayer.prototype.setTimeScale = function (timeScale) {
        if (this._currentState) {
            this._currentState.setTimeScale(timeScale);
            __touch(2986);
        }
    };
    __touch(2913);
    AnimationLayer.prototype._getTransitionByType = function (type) {
        if (this._transitionStates[type]) {
            return this._transitionStates[type];
            __touch(2990);
        }
        var transition;
        __touch(2987);
        switch (type) {
        case 'Fade':
            transition = new FadeTransitionState();
            break;
        case 'SyncFade':
            transition = new SyncFadeTransitionState();
            break;
        case 'Frozen':
            transition = new FrozenTransitionState();
            break;
        default:
            console.log('Defaulting to frozen transition type');
            transition = new FrozenTransitionState();
        }
        __touch(2988);
        return this._transitionStates[type] = transition;
        __touch(2989);
    };
    __touch(2914);
    AnimationLayer.prototype.clone = function () {
        var cloned = new AnimationLayer(this._name);
        __touch(2991);
        for (var key in this._steadyStates) {
            cloned._steadyStates[key] = this._steadyStates[key].clone();
            __touch(2996);
            if (this._steadyStates[key] === this._currentState) {
                cloned._currentState = cloned._steadyStates[key];
                __touch(2997);
            }
        }
        __touch(2992);
        for (var key in this._transitions) {
            cloned._transitions[key] = this._transitions[key];
            __touch(2998);
        }
        __touch(2993);
        for (var key in this._transitionStates) {
            cloned._transitionStates[key] = new this._transitionStates[key].constructor();
            __touch(2999);
        }
        __touch(2994);
        return cloned;
        __touch(2995);
    };
    __touch(2915);
    return AnimationLayer;
    __touch(2916);
});
__touch(2890);
define([
    'goo/entities/components/Component',
    'goo/entities/World',
    'goo/animationpack/layer/AnimationLayer',
    'goo/animationpack/clip/JointData',
    'goo/animationpack/clip/TransformData',
    'goo/animationpack/clip/TriggerData'
], function (Component, World, AnimationLayer, JointData, TransformData, TriggerData) {
    'use strict';
    __touch(2641);
    function AnimationComponent(pose) {
        this.type = 'AnimationComponent';
        __touch(2662);
        this.layers = [];
        __touch(2663);
        this.floats = {};
        __touch(2664);
        this._updateRate = 1 / 60;
        __touch(2665);
        this._lastUpdate = 0;
        __touch(2666);
        this._triggerCallbacks = {};
        __touch(2667);
        var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
        __touch(2668);
        this.layers.push(layer);
        __touch(2669);
        this._skeletonPose = pose;
        __touch(2670);
        this.paused = false;
        __touch(2671);
        this.lastTimeOfPause = -1;
        __touch(2672);
    }
    __touch(2642);
    AnimationComponent.prototype = Object.create(Component.prototype);
    __touch(2643);
    AnimationComponent.prototype.transitionTo = function (stateKey, allowDirectSwitch, callback) {
        if (this.layers[0].transitionTo(stateKey, undefined, callback)) {
            return true;
            __touch(2674);
        }
        if (!allowDirectSwitch) {
            return false;
            __touch(2675);
        }
        return this.layers[0].setCurrentStateById(stateKey, true, undefined, callback);
        __touch(2673);
    };
    __touch(2644);
    AnimationComponent.prototype.getStates = function () {
        return this.layers[0].getStates();
        __touch(2676);
    };
    __touch(2645);
    AnimationComponent.prototype.getCurrentState = function () {
        return this.layers[0].getCurrentState();
        __touch(2677);
    };
    __touch(2646);
    AnimationComponent.prototype.getTransitions = function () {
        return this.layers[0].getTransitions();
        __touch(2678);
    };
    __touch(2647);
    AnimationComponent.prototype.update = function (globalTime) {
        if (this.paused) {
            return;
            __touch(2680);
        }
        globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
        __touch(2679);
        if (this._updateRate !== 0) {
            if (globalTime > this._lastUpdate && globalTime - this._lastUpdate < this._updateRate) {
                return;
                __touch(2682);
            }
            this._lastUpdate = globalTime - (globalTime - this._lastUpdate) % this._updateRate;
            __touch(2681);
        }
        for (var i = 0, max = this.layers.length; i < max; i++) {
            this.layers[i].update(globalTime);
            __touch(2683);
        }
    };
    __touch(2648);
    AnimationComponent.prototype.apply = function (transformComponent) {
        var data = this.getCurrentSourceData();
        __touch(2684);
        var pose = this._skeletonPose;
        __touch(2685);
        if (data) {
            var keys = Object.keys(data);
            __touch(2686);
            for (var i = 0, l = keys.length; i < l; i++) {
                var key = keys[i];
                __touch(2687);
                var value = data[key];
                __touch(2688);
                if (value instanceof JointData) {
                    if (pose && value._jointIndex >= 0) {
                        value.applyTo(pose._localTransforms[value._jointIndex]);
                        __touch(2689);
                    }
                } else if (value instanceof TransformData) {
                    if (transformComponent) {
                        value.applyTo(transformComponent.transform);
                        __touch(2690);
                        transformComponent.updateTransform();
                        __touch(2691);
                        this._updateWorldTransform(transformComponent);
                        __touch(2692);
                    }
                } else if (value instanceof TriggerData) {
                    if (value.armed) {
                        for (var i = 0, maxI = value._currentTriggers.length; i < maxI; i++) {
                            var callbacks = this._triggerCallbacks[value._currentTriggers[i]];
                            __touch(2694);
                            if (callbacks && callbacks.length) {
                                for (var j = 0, maxJ = callbacks.length; j < maxJ; j++) {
                                    callbacks[j]();
                                    __touch(2695);
                                }
                            }
                        }
                        value.armed = false;
                        __touch(2693);
                    }
                } else if (value instanceof Array) {
                    this.floats[key] = value[0];
                    __touch(2696);
                }
            }
            if (pose) {
                pose.updateTransforms();
                __touch(2697);
            }
        }
    };
    __touch(2649);
    AnimationComponent.prototype._updateWorldTransform = function (transformComponent) {
        transformComponent.updateWorldTransform();
        __touch(2698);
        for (var i = 0; i < transformComponent.children.length; i++) {
            this._updateWorldTransform(transformComponent.children[i]);
            __touch(2699);
        }
    };
    __touch(2650);
    AnimationComponent.prototype.postUpdate = function () {
        for (var i = 0, max = this.layers.length; i < max; i++) {
            this.layers[i].postUpdate();
            __touch(2700);
        }
    };
    __touch(2651);
    AnimationComponent.prototype.getCurrentSourceData = function () {
        if (this.layers.length === 0) {
            return [];
            __touch(2704);
        }
        var last = this.layers.length - 1;
        __touch(2701);
        this.layers[0]._layerBlender = null;
        __touch(2702);
        for (var i = 0; i < last; i++) {
            this.layers[i + 1].updateLayerBlending(this.layers[i]);
            __touch(2705);
        }
        return this.layers[last].getCurrentSourceData();
        __touch(2703);
    };
    __touch(2652);
    AnimationComponent.prototype.addLayer = function (layer, index) {
        if (!isNaN(index)) {
            this.layers.splice(index, 0, layer);
            __touch(2706);
        } else {
            this.layers.push(layer);
            __touch(2707);
        }
    };
    __touch(2653);
    AnimationComponent.prototype.resetClips = function (globalTime) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].resetClips(globalTime);
            __touch(2708);
        }
    };
    __touch(2654);
    AnimationComponent.prototype.shiftClipTime = function (shiftTime) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].shiftClipTime(shiftTime);
            __touch(2709);
        }
    };
    __touch(2655);
    AnimationComponent.prototype.setTimeScale = function (timeScale) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].setTimeScale(timeScale);
            __touch(2710);
        }
    };
    __touch(2656);
    AnimationComponent.prototype.pause = function () {
        if (!this.paused) {
            this.lastTimeOfPause = World.time;
            __touch(2711);
            this.paused = true;
            __touch(2712);
        }
    };
    __touch(2657);
    AnimationComponent.prototype.stop = function () {
        if (this._skeletonPose) {
            this._skeletonPose.setToBindPose();
            __touch(2715);
        }
        this.paused = true;
        __touch(2713);
        this.lastTimeOfPause = -1;
        __touch(2714);
    };
    __touch(2658);
    AnimationComponent.prototype.resume = function () {
        if (this.paused || this.lastTimeOfPause === -1) {
            if (this.lastTimeOfPause === -1) {
                this.resetClips(World.time);
                __touch(2717);
            } else {
                this.shiftClipTime(World.time - this.lastTimeOfPause);
                __touch(2718);
            }
        }
        this.paused = false;
        __touch(2716);
    };
    __touch(2659);
    AnimationComponent.prototype.clone = function () {
        var cloned = new AnimationComponent();
        __touch(2719);
        cloned.layers = this.layers.map(function (layer) {
            return layer.clone();
            __touch(2722);
        });
        __touch(2720);
        return cloned;
        __touch(2721);
    };
    __touch(2660);
    return AnimationComponent;
    __touch(2661);
});
__touch(2640);
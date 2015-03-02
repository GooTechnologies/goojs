define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/animationpack/components/AnimationComponent',
    'goo/util/rsvp'
], function (ComponentHandler, AnimationComponent, RSVP) {
    'use strict';
    __touch(2754);
    function AnimationComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(2762);
        this._type = 'AnimationComponent';
        __touch(2763);
    }
    __touch(2755);
    AnimationComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(2756);
    AnimationComponentHandler.prototype.constructor = AnimationComponentHandler;
    __touch(2757);
    ComponentHandler._registerClass('animation', AnimationComponentHandler);
    __touch(2758);
    AnimationComponentHandler.prototype._create = function () {
        return new AnimationComponent();
        __touch(2764);
    };
    __touch(2759);
    AnimationComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(2765);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(2772);
            }
            var promises = [];
            __touch(2767);
            var p;
            __touch(2768);
            var poseRef = config.poseRef;
            __touch(2769);
            if (poseRef) {
                p = that._load(poseRef, options).then(function (pose) {
                    component._skeletonPose = pose;
                    __touch(2775);
                });
                __touch(2773);
                promises.push(p);
                __touch(2774);
            }
            var layersRef = config.layersRef;
            __touch(2770);
            if (layersRef) {
                p = that._load(layersRef, options).then(function (layers) {
                    component.layers = layers;
                    __touch(2778);
                    component._layersId = layersRef;
                    __touch(2779);
                });
                __touch(2776);
                promises.push(p);
                __touch(2777);
            }
            return RSVP.all(promises).then(function () {
                return component;
                __touch(2780);
            });
            __touch(2771);
        });
        __touch(2766);
    };
    __touch(2760);
    return AnimationComponentHandler;
    __touch(2761);
});
__touch(2753);
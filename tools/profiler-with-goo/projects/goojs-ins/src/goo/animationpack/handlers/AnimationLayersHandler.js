define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/animationpack/layer/AnimationLayer',
    'goo/animationpack/layer/LayerLERPBlender',
    'goo/animationpack/state/FadeTransitionState',
    'goo/animationpack/state/SyncFadeTransitionState',
    'goo/animationpack/state/FrozenTransitionState',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ConfigHandler, AnimationLayer, LayerLERPBlender, FadeTransitionState, SyncFadeTransitionState, FrozenTransitionState, RSVP, PromiseUtil, _) {
    'use strict';
    __touch(2782);
    function AnimationLayersHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(2792);
    }
    __touch(2783);
    AnimationLayersHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(2784);
    AnimationLayersHandler.prototype.constructor = AnimationLayersHandler;
    __touch(2785);
    ConfigHandler._registerClass('animation', AnimationLayersHandler);
    __touch(2786);
    AnimationLayersHandler.prototype._create = function (ref) {
        return this._objects[ref] = [];
        __touch(2793);
    };
    __touch(2787);
    AnimationLayersHandler.prototype._setInitialState = function (layer, stateKey) {
        if (stateKey) {
            var state = layer.getStateById(stateKey);
            __touch(2794);
            if (layer._currentState !== state) {
                layer.setCurrentStateById(stateKey, true);
                __touch(2795);
            }
        } else {
            layer.setCurrentState();
            __touch(2796);
        }
    };
    __touch(2788);
    AnimationLayersHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(2797);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (object) {
            if (!object) {
                return;
                __touch(2803);
            }
            var promises = [];
            __touch(2799);
            var i = 0;
            __touch(2800);
            _.forEach(config.layers, function (layerCfg) {
                promises.push(that._parseLayer(layerCfg, object[i++], options));
                __touch(2804);
            }, null, 'sortValue');
            __touch(2801);
            return RSVP.all(promises).then(function (layers) {
                object.length = layers.length;
                __touch(2805);
                for (var i = 0; i < layers.length; i++) {
                    object[i] = layers[i];
                    __touch(2807);
                }
                return object;
                __touch(2806);
            });
            __touch(2802);
        });
        __touch(2798);
    };
    __touch(2789);
    AnimationLayersHandler.prototype._parseLayer = function (layerConfig, layer, options) {
        var that = this;
        __touch(2808);
        if (!layer) {
            layer = new AnimationLayer(layerConfig.name);
            __touch(2814);
        } else {
            layer._name = layerConfig.name;
            __touch(2815);
        }
        layer.id = layerConfig.id;
        __touch(2809);
        layer._transitions = _.deepClone(layerConfig.transitions);
        __touch(2810);
        if (layer._layerBlender) {
            if (layerConfig.blendWeight !== undefined) {
                layer._layerBlender._blendWeight = layerConfig.blendWeight;
                __touch(2816);
            } else {
                layer._layerBlender._blendWeight = 1;
                __touch(2817);
            }
        }
        var promises = [];
        __touch(2811);
        _.forEach(layerConfig.states, function (stateCfg) {
            promises.push(that.loadObject(stateCfg.stateRef, options).then(function (state) {
                layer.setState(state.id, state);
                __touch(2819);
            }));
            __touch(2818);
        }, null, 'sortValue');
        __touch(2812);
        return RSVP.all(promises).then(function () {
            that._setInitialState(layer, layerConfig.initialStateRef);
            __touch(2820);
            return layer;
            __touch(2821);
        });
        __touch(2813);
    };
    __touch(2790);
    return AnimationLayersHandler;
    __touch(2791);
});
__touch(2781);
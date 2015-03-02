define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/animationpack/state/SteadyState',
    'goo/animationpack/blendtree/ClipSource',
    'goo/animationpack/blendtree/ManagedTransformSource',
    'goo/animationpack/blendtree/BinaryLERPSource',
    'goo/animationpack/blendtree/FrozenClipSource',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ConfigHandler, SteadyState, ClipSource, ManagedTransformSource, BinaryLERPSource, FrozenClipSource, RSVP, PromiseUtil, _) {
    'use strict';
    __touch(2823);
    function AnimationStateHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(2832);
    }
    __touch(2824);
    AnimationStateHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(2825);
    AnimationStateHandler.prototype.constructor = AnimationStateHandler;
    __touch(2826);
    ConfigHandler._registerClass('animstate', AnimationStateHandler);
    __touch(2827);
    AnimationStateHandler.prototype._create = function (ref) {
        return this._objects[ref] = new SteadyState();
        __touch(2833);
    };
    __touch(2828);
    AnimationStateHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(2834);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (state) {
            if (!state) {
                return;
                __touch(2840);
            }
            state._name = config.name;
            __touch(2836);
            state.id = config.id;
            __touch(2837);
            state._transitions = _.deepClone(config.transitions);
            __touch(2838);
            return that._parseClipSource(config.clipSource, state._sourceTree, options).then(function (source) {
                state._sourceTree = source;
                __touch(2841);
                return state;
                __touch(2842);
            });
            __touch(2839);
        });
        __touch(2835);
    };
    __touch(2829);
    AnimationStateHandler.prototype._parseClipSource = function (cfg, clipSource, options) {
        switch (cfg.type) {
        case 'Clip':
            return this.loadObject(cfg.clipRef, options).then(function (clip) {
                if (!clipSource || !clipSource instanceof ClipSource) {
                    clipSource = new ClipSource(clip, cfg.filter, cfg.channels);
                    __touch(2848);
                } else {
                    clipSource._clip = clip;
                    __touch(2849);
                    clipSource.setFilter(cfg.filter, cfg.channels);
                    __touch(2850);
                }
                if (cfg.loopCount !== undefined) {
                    clipSource._clipInstance._loopCount = +cfg.loopCount;
                    __touch(2851);
                }
                if (cfg.timeScale !== undefined) {
                    clipSource._clipInstance._timeScale = cfg.timeScale;
                    __touch(2852);
                }
                clipSource._startTime = cfg.startTime || 0;
                __touch(2844);
                var minTime = Infinity;
                __touch(2845);
                for (var i = 0; i < clip._channels.length; i++) {
                    var channel = clip._channels[i];
                    __touch(2853);
                    for (var j = 0; j < channel._times.length; j++) {
                        var time = channel._times[j];
                        __touch(2854);
                        if (time < minTime) {
                            minTime = time;
                            __touch(2855);
                        }
                    }
                }
                clipSource._startTime = Math.max(clipSource._startTime, minTime);
                __touch(2846);
                return clipSource;
                __touch(2847);
            });
        case 'Managed':
            if (!clipSource || !clipSource instanceof ManagedTransformSource) {
                clipSource = new ManagedTransformSource();
                __touch(2856);
            }
            if (cfg.clipRef) {
                return this.loadObject(cfg.clipRef, options).then(function (clip) {
                    clipSource.initFromClip(clip, cfg.filter, cfg.channels);
                    __touch(2858);
                    return clipSource;
                    __touch(2859);
                });
                __touch(2857);
            } else {
                return PromiseUtil.resolve(clipSource);
                __touch(2860);
            }
            break;
        case 'Lerp':
            var promises = [
                this._parseClipSource(cfg.clipSourceA, null, options),
                this._parseClipSource(cfg.clipSourceB, null, options)
            ];
            return RSVP.all(promises).then(function (clipSources) {
                clipSource = new BinaryLERPSource(clipSources[0], clipSources[1]);
                __touch(2861);
                if (cfg.blendWeight) {
                    clipSource.blendWeight = cfg.blendWeight;
                    __touch(2863);
                }
                return clipSource;
                __touch(2862);
            });
        case 'Frozen':
            return this._parseClipSource(cfg.clipSource).then(function (subClipSource) {
                if (!clipSource || !(clipSource instanceof FrozenClipSource)) {
                    clipSource = new FrozenClipSource(subClipSource, cfg.frozenTime || 0);
                    __touch(2865);
                } else {
                    clipSource._source = subClipSource;
                    __touch(2866);
                    clipSource._time = cfg.frozenTime || 0;
                    __touch(2867);
                }
                return clipSource;
                __touch(2864);
            });
        default:
            console.error('Unable to parse clip source');
            return PromiseUtil.resolve();
        }
        __touch(2843);
    };
    __touch(2830);
    return AnimationStateHandler;
    __touch(2831);
});
__touch(2822);
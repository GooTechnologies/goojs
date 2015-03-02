define([
    'goo/math/MathUtils',
    'goo/animationpack/clip/AnimationClipInstance'
], function (MathUtils, AnimationClipInstance) {
    'use strict';
    __touch(2232);
    function ClipSource(clip, filter, channelNames) {
        this._clip = clip;
        __touch(2243);
        this._clipInstance = new AnimationClipInstance();
        __touch(2244);
        this._filterChannels = {};
        __touch(2245);
        this._filter = null;
        __touch(2246);
        this.setFilter(filter, channelNames);
        __touch(2247);
        this._startTime = -Infinity;
        __touch(2248);
        this._endTime = Infinity;
        __touch(2249);
    }
    __touch(2233);
    ClipSource.prototype.setFilter = function (filter, channelNames) {
        if (filter && channelNames) {
            this._filter = [
                'Exclude',
                'Include'
            ].indexOf(filter) > -1 ? filter : null;
            __touch(2250);
            for (var i = 0; i < channelNames.length; i++) {
                this._filterChannels[channelNames[i]] = true;
                __touch(2251);
            }
        } else {
            this._filter = null;
            __touch(2252);
        }
    };
    __touch(2234);
    ClipSource.prototype.setTime = function (globalTime) {
        var instance = this._clipInstance;
        __touch(2253);
        if (typeof instance._startTime !== 'number') {
            instance._startTime = globalTime;
            __touch(2257);
        }
        var clockTime;
        __touch(2254);
        var duration;
        __touch(2255);
        if (instance._active) {
            if (instance._timeScale !== 0) {
                instance._prevUnscaledClockTime = globalTime - instance._startTime;
                __touch(2262);
                clockTime = instance._timeScale * instance._prevUnscaledClockTime;
                __touch(2263);
                instance._prevClockTime = clockTime;
                __touch(2264);
            } else {
                clockTime = instance._prevClockTime;
                __touch(2265);
            }
            var maxTime = Math.min(this._clip._maxTime, this._endTime);
            __touch(2258);
            var minTime = Math.max(this._startTime, 0);
            __touch(2259);
            duration = maxTime - minTime;
            __touch(2260);
            if (maxTime === -1) {
                return false;
                __touch(2266);
            }
            if (maxTime !== 0) {
                if (instance._loopCount === -1) {
                    if (clockTime < 0) {
                        clockTime *= -1;
                        __touch(2267);
                        clockTime %= duration;
                        __touch(2268);
                        clockTime = duration - clockTime;
                        __touch(2269);
                        clockTime += minTime;
                        __touch(2270);
                    } else {
                        clockTime %= duration;
                        __touch(2271);
                        clockTime += minTime;
                        __touch(2272);
                    }
                } else if (instance._loopCount > 0 && duration * instance._loopCount >= Math.abs(clockTime)) {
                    if (clockTime < 0) {
                        clockTime *= -1;
                        __touch(2273);
                        clockTime %= duration;
                        __touch(2274);
                        clockTime = duration - clockTime;
                        __touch(2275);
                        clockTime += minTime;
                        __touch(2276);
                    } else {
                        clockTime %= duration;
                        __touch(2277);
                        clockTime += minTime;
                        __touch(2278);
                    }
                }
                if (clockTime > maxTime || clockTime < minTime) {
                    clockTime = MathUtils.clamp(clockTime, minTime, maxTime);
                    __touch(2279);
                    instance._active = false;
                    __touch(2280);
                }
            }
            this._clip.update(clockTime, instance);
            __touch(2261);
        }
        return instance._active;
        __touch(2256);
    };
    __touch(2235);
    ClipSource.prototype.resetClips = function (globalTime) {
        this._clipInstance._startTime = typeof globalTime !== 'undefined' ? globalTime : 0;
        __touch(2281);
        this._clipInstance._active = true;
        __touch(2282);
    };
    __touch(2236);
    ClipSource.prototype.shiftClipTime = function (shiftTime) {
        this._clipInstance._startTime += shiftTime;
        __touch(2283);
        this._clipInstance._active = true;
        __touch(2284);
    };
    __touch(2237);
    ClipSource.prototype.setTimeScale = function (timeScale) {
        this._clipInstance.setTimeScale(timeScale);
        __touch(2285);
    };
    __touch(2238);
    ClipSource.prototype.isActive = function () {
        return this._clipInstance._active && this._clip._maxTime !== -1;
        __touch(2286);
    };
    __touch(2239);
    ClipSource.prototype.getSourceData = function () {
        if (!this._filter || !this._filterChannels) {
            return this._clipInstance._clipStateObjects;
            __touch(2292);
        }
        var cso = this._clipInstance._clipStateObjects;
        __touch(2287);
        var rVal = {};
        __touch(2288);
        var filter = this._filter === 'Include';
        __touch(2289);
        for (var key in cso) {
            if (this._filterChannels[key] !== undefined === filter) {
                rVal[key] = cso[key];
                __touch(2293);
            }
        }
        __touch(2290);
        return rVal;
        __touch(2291);
    };
    __touch(2240);
    ClipSource.prototype.clone = function () {
        var cloned = new ClipSource(this._clip);
        __touch(2294);
        cloned._clipInstance = this._clipInstance.clone();
        __touch(2295);
        cloned._filter = this._filter;
        __touch(2296);
        for (var key in this._filterChannels) {
            cloned._filterChannels[key] = this._filterChannels[key];
            __touch(2301);
        }
        __touch(2297);
        cloned._startTime = this._startTime;
        __touch(2298);
        cloned._endTime = this._endTime;
        __touch(2299);
        return cloned;
        __touch(2300);
    };
    __touch(2241);
    return ClipSource;
    __touch(2242);
});
__touch(2231);
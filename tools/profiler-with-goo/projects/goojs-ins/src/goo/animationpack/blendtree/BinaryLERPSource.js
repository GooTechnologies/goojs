define([
    'goo/math/MathUtils',
    'goo/animationpack/clip/TransformData'
], function (MathUtils, TransformData) {
    'use strict';
    __touch(2178);
    function BinaryLERPSource(sourceA, sourceB, blendWeight) {
        this._sourceA = sourceA ? sourceA : null;
        __touch(2190);
        this._sourceB = sourceB ? sourceB : null;
        __touch(2191);
        this.blendWeight = blendWeight ? blendWeight : null;
        __touch(2192);
    }
    __touch(2179);
    BinaryLERPSource.prototype.getSourceData = function () {
        var sourceAData = this._sourceA ? this._sourceA.getSourceData() : null;
        __touch(2193);
        var sourceBData = this._sourceB ? this._sourceB.getSourceData() : null;
        __touch(2194);
        return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this.blendWeight);
        __touch(2195);
    };
    __touch(2180);
    BinaryLERPSource.prototype.setTime = function (globalTime) {
        var activeA = false;
        __touch(2196);
        var activeB = false;
        __touch(2197);
        if (this._sourceA) {
            activeA = this._sourceA.setTime(globalTime);
            __touch(2199);
        }
        if (this._sourceB) {
            activeB = this._sourceB.setTime(globalTime);
            __touch(2200);
        }
        return activeA || activeB;
        __touch(2198);
    };
    __touch(2181);
    BinaryLERPSource.prototype.resetClips = function (globalStartTime) {
        if (this._sourceA) {
            this._sourceA.resetClips(globalStartTime);
            __touch(2201);
        }
        if (this._sourceB) {
            this._sourceB.resetClips(globalStartTime);
            __touch(2202);
        }
    };
    __touch(2182);
    BinaryLERPSource.prototype.shiftClipTime = function (shiftTime) {
        if (this._sourceA) {
            this._sourceA.shiftClipTime(shiftTime);
            __touch(2203);
        }
        if (this._sourceB) {
            this._sourceB.shiftClipTime(shiftTime);
            __touch(2204);
        }
    };
    __touch(2183);
    BinaryLERPSource.prototype.setTimeScale = function (timeScale) {
        this._sourceA.setTimeScale(timeScale);
        __touch(2205);
        this._sourceB.setTimeScale(timeScale);
        __touch(2206);
    };
    __touch(2184);
    BinaryLERPSource.prototype.isActive = function () {
        var foundActive = false;
        __touch(2207);
        if (this._sourceA) {
            foundActive = foundActive || this._sourceA.isActive();
            __touch(2209);
        }
        if (this._sourceB) {
            foundActive = foundActive || this._sourceB.isActive();
            __touch(2210);
        }
        return foundActive;
        __touch(2208);
    };
    __touch(2185);
    BinaryLERPSource.combineSourceData = function (sourceAData, sourceBData, blendWeight, store) {
        if (!sourceBData) {
            return sourceAData;
            __touch(2215);
        } else if (!sourceAData) {
            return sourceBData;
            __touch(2216);
        }
        var rVal = store ? store : {};
        __touch(2211);
        for (var key in sourceAData) {
            var dataA = sourceAData[key];
            __touch(2217);
            var dataB = sourceBData[key];
            __touch(2218);
            if (!isNaN(dataA)) {
                BinaryLERPSource.blendFloatValues(rVal, key, blendWeight, dataA, dataB);
                __touch(2219);
                continue;
                __touch(2220);
            } else if (!(dataA instanceof TransformData)) {
                rVal[key] = dataA;
                __touch(2221);
                continue;
                __touch(2222);
            }
            if (dataB) {
                rVal[key] = dataA.blend(dataB, blendWeight, rVal[key]);
                __touch(2223);
            } else {
                if (!rVal[key]) {
                    rVal[key] = new dataA.constructor(dataA);
                    __touch(2224);
                } else {
                    rVal[key].set(dataA);
                    __touch(2225);
                }
            }
        }
        __touch(2212);
        for (var key in sourceBData) {
            if (rVal[key]) {
                continue;
                __touch(2227);
            }
            rVal[key] = sourceBData[key];
            __touch(2226);
        }
        __touch(2213);
        return rVal;
        __touch(2214);
    };
    __touch(2186);
    BinaryLERPSource.blendFloatValues = function (rVal, key, blendWeight, dataA, dataB) {
        if (isNaN(dataB)) {
            rVal[key] = dataA;
            __touch(2228);
        } else {
            rVal[key] = MathUtils.lerp(blendWeight, dataA[0], dataB[0]);
            __touch(2229);
        }
    };
    __touch(2187);
    BinaryLERPSource.prototype.clone = function () {
        return new BinaryLERPSource(this._sourceA, this._sourceB, this._blendWeight);
        __touch(2230);
    };
    __touch(2188);
    return BinaryLERPSource;
    __touch(2189);
});
__touch(2177);
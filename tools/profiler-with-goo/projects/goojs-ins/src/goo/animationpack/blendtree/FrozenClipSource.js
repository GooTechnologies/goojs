define(function () {
    'use strict';
    __touch(2303);
    function FrozenClipSource(source, frozenTime) {
        this._source = source;
        __touch(2312);
        this._time = frozenTime;
        __touch(2313);
    }
    __touch(2304);
    FrozenClipSource.prototype.getSourceData = function () {
        return this._source.getSourceData();
        __touch(2314);
    };
    __touch(2305);
    FrozenClipSource.prototype.resetClips = function () {
        this._source.resetClips(0);
        __touch(2315);
    };
    __touch(2306);
    FrozenClipSource.prototype.setTime = function () {
        this._source.setTime(this._time);
        __touch(2316);
        return true;
        __touch(2317);
    };
    __touch(2307);
    FrozenClipSource.prototype.isActive = function () {
        return true;
        __touch(2318);
    };
    __touch(2308);
    FrozenClipSource.prototype.setTimeScale = function () {
    };
    __touch(2309);
    FrozenClipSource.prototype.clone = function () {
        var cloned = new FrozenClipSource(this._source.clone(), this._time);
        __touch(2319);
        return cloned;
        __touch(2320);
    };
    __touch(2310);
    return FrozenClipSource;
    __touch(2311);
});
__touch(2302);
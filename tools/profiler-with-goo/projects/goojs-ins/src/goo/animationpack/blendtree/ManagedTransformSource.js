define([
    'goo/animationpack/clip/JointChannel',
    'goo/animationpack/clip/JointData',
    'goo/animationpack/clip/JointChannel',
    'goo/animationpack/clip/JointData',
    'goo/math/Vector3',
    'goo/math/Quaternion'
], function (JointChannel, JointData, TransformChannel, TransformData, Vector3, Quaternion) {
    'use strict';
    __touch(2322);
    function ManagedTransformSource(sourceName) {
        this._sourceName = sourceName ? sourceName : null;
        __touch(2339);
        this._data = {};
        __touch(2340);
    }
    __touch(2323);
    ManagedTransformSource.prototype.setTranslation = function (channelName, translation) {
        var channel = this._data[channelName];
        __touch(2341);
        if (channel instanceof TransformData) {
            channel._translation.setv(translation);
            __touch(2342);
        }
    };
    __touch(2324);
    ManagedTransformSource.prototype.getTranslation = function (channelName, store) {
        var channel = this._data[channelName];
        __touch(2343);
        if (channel instanceof TransformData) {
            store = store || new Vector3();
            __touch(2345);
            store.setv(channel._translation);
            __touch(2346);
        }
        return store;
        __touch(2344);
    };
    __touch(2325);
    ManagedTransformSource.prototype.setScale = function (channelName, scale) {
        var channel = this._data[channelName];
        __touch(2347);
        if (channel instanceof TransformData) {
            channel._scale.setv(scale);
            __touch(2348);
        }
    };
    __touch(2326);
    ManagedTransformSource.prototype.getScale = function (channelName, store) {
        var channel = this._data[channelName];
        __touch(2349);
        if (channel instanceof TransformData) {
            store = store || new Vector3();
            __touch(2351);
            store.setv(channel._scale);
            __touch(2352);
        }
        return store;
        __touch(2350);
    };
    __touch(2327);
    ManagedTransformSource.prototype.setRotation = function (channelName, rotation) {
        var channel = this._data[channelName];
        __touch(2353);
        if (channel instanceof TransformData) {
            channel._rotation.set(rotation);
            __touch(2354);
        }
    };
    __touch(2328);
    ManagedTransformSource.prototype.getRotation = function (channelName, store) {
        var channel = this._data[channelName];
        __touch(2355);
        if (channel instanceof TransformData) {
            store = store || new Quaternion();
            __touch(2357);
            store.setv(channel._rotation);
            __touch(2358);
        }
        return store;
        __touch(2356);
    };
    __touch(2329);
    ManagedTransformSource.prototype.initFromClip = function (clip, filter, channelNames) {
        if (filter === 'Include' && channelNames && channelNames.length) {
            for (var i = 0, max = channelNames.length; i < max; i++) {
                var channelName = channelNames[i];
                __touch(2359);
                var channel = clip.findChannelByName(channelName);
                __touch(2360);
                if (channel) {
                    var data = channel.getData(0);
                    __touch(2361);
                    this._data[channelName] = data;
                    __touch(2362);
                } else {
                    console.error('Channel not in clip: ' + channelName);
                    __touch(2363);
                }
            }
        } else {
            for (var i = 0, max = clip._channels.length; i < max; i++) {
                var channel = clip._channels[i];
                __touch(2364);
                var channelName = channel._channelName;
                __touch(2365);
                if (filter === 'Exclude' && channelNames && channelNames.length && channelNames.indexOf(channelName) > -1) {
                    var data = channel.getData(0);
                    __touch(2366);
                    this._data[channelName] = data;
                    __touch(2367);
                }
            }
        }
    };
    __touch(2330);
    ManagedTransformSource.prototype.resetClips = function () {
    };
    __touch(2331);
    ManagedTransformSource.prototype.setTimeScale = function () {
    };
    __touch(2332);
    ManagedTransformSource.prototype.setTime = function () {
        return true;
        __touch(2368);
    };
    __touch(2333);
    ManagedTransformSource.prototype.isActive = function () {
        return true;
        __touch(2369);
    };
    __touch(2334);
    ManagedTransformSource.prototype.getChannelData = function (channelName) {
        return this._data[channelName];
        __touch(2370);
    };
    __touch(2335);
    ManagedTransformSource.prototype.getSourceData = function () {
        return this._data;
        __touch(2371);
    };
    __touch(2336);
    ManagedTransformSource.prototype.clone = function () {
        var clonedData = {};
        __touch(2372);
        for (var key in this._data) {
            clonedData[key] = this._data[key].clone();
            __touch(2375);
        }
        __touch(2373);
        return new ManagedTransformSource(this._sourceName, clonedData);
        __touch(2374);
    };
    __touch(2337);
    return ManagedTransformSource;
    __touch(2338);
});
__touch(2321);
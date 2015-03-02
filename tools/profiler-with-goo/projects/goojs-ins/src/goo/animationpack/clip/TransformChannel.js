define([
    'goo/animationpack/clip/AbstractAnimationChannel',
    'goo/animationpack/clip/TransformData',
    'goo/math/Quaternion'
], function (AbstractAnimationChannel, TransformData, Quaternion) {
    'use strict';
    __touch(2525);
    function TransformChannel(channelName, times, rotations, translations, scales, blendType) {
        AbstractAnimationChannel.call(this, channelName, times, blendType);
        __touch(2534);
        if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
            throw new Error('All provided arrays must be the same length (accounting for type)! Channel: ' + channelName);
            __touch(2538);
        }
        this._rotations = new Float32Array(rotations);
        __touch(2535);
        this._translations = new Float32Array(translations);
        __touch(2536);
        this._scales = new Float32Array(scales);
        __touch(2537);
    }
    __touch(2526);
    var tmpQuat = new Quaternion();
    __touch(2527);
    var tmpQuat2 = new Quaternion();
    __touch(2528);
    TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);
    __touch(2529);
    TransformChannel.prototype.createStateDataObject = function () {
        return new TransformData();
        __touch(2539);
    };
    __touch(2530);
    TransformChannel.prototype.setCurrentSample = function (sampleIndex, fraction, applyTo) {
        var transformData = applyTo;
        __touch(2540);
        var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
        __touch(2541);
        var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
        __touch(2542);
        if (fraction === 0) {
            transformData._rotation.data[0] = this._rotations[index4A + 0];
            __touch(2557);
            transformData._rotation.data[1] = this._rotations[index4A + 1];
            __touch(2558);
            transformData._rotation.data[2] = this._rotations[index4A + 2];
            __touch(2559);
            transformData._rotation.data[3] = this._rotations[index4A + 3];
            __touch(2560);
            transformData._translation.data[0] = this._translations[index3A + 0];
            __touch(2561);
            transformData._translation.data[1] = this._translations[index3A + 1];
            __touch(2562);
            transformData._translation.data[2] = this._translations[index3A + 2];
            __touch(2563);
            transformData._scale.data[0] = this._scales[index3A + 0];
            __touch(2564);
            transformData._scale.data[1] = this._scales[index3A + 1];
            __touch(2565);
            transformData._scale.data[2] = this._scales[index3A + 2];
            __touch(2566);
            return;
            __touch(2567);
        } else if (fraction === 1) {
            transformData._rotation.data[0] = this._rotations[index4B + 0];
            __touch(2568);
            transformData._rotation.data[1] = this._rotations[index4B + 1];
            __touch(2569);
            transformData._rotation.data[2] = this._rotations[index4B + 2];
            __touch(2570);
            transformData._rotation.data[3] = this._rotations[index4B + 3];
            __touch(2571);
            transformData._translation.data[0] = this._translations[index3B + 0];
            __touch(2572);
            transformData._translation.data[1] = this._translations[index3B + 1];
            __touch(2573);
            transformData._translation.data[2] = this._translations[index3B + 2];
            __touch(2574);
            transformData._scale.data[0] = this._scales[index3B + 0];
            __touch(2575);
            transformData._scale.data[1] = this._scales[index3B + 1];
            __touch(2576);
            transformData._scale.data[2] = this._scales[index3B + 2];
            __touch(2577);
            return;
            __touch(2578);
        }
        transformData._rotation.data[0] = this._rotations[index4A + 0];
        __touch(2543);
        transformData._rotation.data[1] = this._rotations[index4A + 1];
        __touch(2544);
        transformData._rotation.data[2] = this._rotations[index4A + 2];
        __touch(2545);
        transformData._rotation.data[3] = this._rotations[index4A + 3];
        __touch(2546);
        tmpQuat.data[0] = this._rotations[index4B + 0];
        __touch(2547);
        tmpQuat.data[1] = this._rotations[index4B + 1];
        __touch(2548);
        tmpQuat.data[2] = this._rotations[index4B + 2];
        __touch(2549);
        tmpQuat.data[3] = this._rotations[index4B + 3];
        __touch(2550);
        if (!transformData._rotation.equals(tmpQuat)) {
            Quaternion.slerp(transformData._rotation, tmpQuat, fraction, tmpQuat2);
            __touch(2579);
            transformData._rotation.setv(tmpQuat2);
            __touch(2580);
        }
        transformData._translation.data[0] = (1 - fraction) * this._translations[index3A + 0] + fraction * this._translations[index3B + 0];
        __touch(2551);
        transformData._translation.data[1] = (1 - fraction) * this._translations[index3A + 1] + fraction * this._translations[index3B + 1];
        __touch(2552);
        transformData._translation.data[2] = (1 - fraction) * this._translations[index3A + 2] + fraction * this._translations[index3B + 2];
        __touch(2553);
        transformData._scale.data[0] = (1 - fraction) * this._scales[index3A + 0] + fraction * this._scales[index3B + 0];
        __touch(2554);
        transformData._scale.data[1] = (1 - fraction) * this._scales[index3A + 1] + fraction * this._scales[index3B + 1];
        __touch(2555);
        transformData._scale.data[2] = (1 - fraction) * this._scales[index3A + 2] + fraction * this._scales[index3B + 2];
        __touch(2556);
    };
    __touch(2531);
    TransformChannel.prototype.getData = function (index, store) {
        var rVal = store ? store : new TransformData();
        __touch(2581);
        this.setCurrentSample(index, 0, rVal);
        __touch(2582);
        return rVal;
        __touch(2583);
    };
    __touch(2532);
    return TransformChannel;
    __touch(2533);
});
__touch(2524);
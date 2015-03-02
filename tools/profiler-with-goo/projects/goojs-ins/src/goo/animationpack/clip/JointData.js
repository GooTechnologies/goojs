define(['goo/animationpack/clip/TransformData'], function (TransformData) {
    'use strict';
    __touch(2506);
    function JointData(source) {
        TransformData.call(this, source);
        __touch(2514);
        this._jointIndex = source ? source._jointIndex : 0;
        __touch(2515);
    }
    __touch(2507);
    JointData.prototype = Object.create(TransformData.prototype);
    __touch(2508);
    JointData.prototype.constructor = JointData;
    __touch(2509);
    JointData.prototype.set = function (jointData) {
        TransformData.prototype.set.call(this, jointData);
        __touch(2516);
        this._jointIndex = jointData._jointIndex;
        __touch(2517);
    };
    __touch(2510);
    JointData.prototype.blend = function (blendTo, blendWeight, store) {
        var rVal = store;
        __touch(2518);
        if (!rVal) {
            rVal = new JointData();
            __touch(2520);
            rVal._jointIndex = this._jointIndex;
            __touch(2521);
        } else if (rVal instanceof JointData) {
            rVal._jointIndex = this._jointIndex;
            __touch(2522);
        }
        return TransformData.prototype.blend.call(this, blendTo, blendWeight, rVal);
        __touch(2519);
    };
    __touch(2511);
    JointData.prototype.clone = function () {
        return new JointData(this);
        __touch(2523);
    };
    __touch(2512);
    return JointData;
    __touch(2513);
});
__touch(2505);
define([
    'goo/animationpack/clip/TransformChannel',
    'goo/animationpack/clip/JointData'
], function (TransformChannel, JointData) {
    'use strict';
    __touch(2487);
    function JointChannel(jointIndex, jointName, times, rotations, translations, scales, blendType) {
        TransformChannel.call(this, jointName, times, rotations, translations, scales, blendType);
        __touch(2495);
        this._jointName = jointName;
        __touch(2496);
        this._jointIndex = jointIndex;
        __touch(2497);
    }
    __touch(2488);
    JointChannel.prototype = Object.create(TransformChannel.prototype);
    __touch(2489);
    JointChannel.JOINT_CHANNEL_NAME = '_jnt';
    __touch(2490);
    JointChannel.prototype.createStateDataObject = function () {
        return new JointData();
        __touch(2498);
    };
    __touch(2491);
    JointChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, jointData) {
        TransformChannel.prototype.setCurrentSample.call(this, sampleIndex, progressPercent, jointData);
        __touch(2499);
        jointData._jointIndex = this._jointIndex;
        __touch(2500);
    };
    __touch(2492);
    JointChannel.prototype.getData = function (index, store) {
        var rVal = store ? store : new JointData();
        __touch(2501);
        TransformChannel.prototype.getData.call(this, index, rVal);
        __touch(2502);
        rVal._jointIndex = this._jointIndex;
        __touch(2503);
        return rVal;
        __touch(2504);
    };
    __touch(2493);
    return JointChannel;
    __touch(2494);
});
__touch(2486);
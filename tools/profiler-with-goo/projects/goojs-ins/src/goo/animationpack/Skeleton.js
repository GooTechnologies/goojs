define(['goo/animationpack/Joint'], function (Joint) {
    'use strict';
    __touch(2130);
    function Skeleton(name, joints) {
        this._name = name;
        __touch(2134);
        this._joints = joints;
        __touch(2135);
    }
    __touch(2131);
    Skeleton.prototype.clone = function () {
        var name = this._name;
        __touch(2136);
        var jointArray = this._joints;
        __touch(2137);
        var joints = [];
        __touch(2138);
        for (var j = 0, maxJ = jointArray.length; j < maxJ; j++) {
            var jointObj = jointArray[j];
            __touch(2140);
            var jName = jointObj._name;
            __touch(2141);
            var joint = new Joint(jName);
            __touch(2142);
            joint._index = jointObj._index;
            __touch(2143);
            joint._parentIndex = jointObj._parentIndex;
            __touch(2144);
            joint._inverseBindPose.copy(jointObj._inverseBindPose);
            __touch(2145);
            joint._inverseBindPose.update();
            __touch(2146);
            joints[j] = joint;
            __touch(2147);
        }
        return new Skeleton(name, joints);
        __touch(2139);
    };
    __touch(2132);
    return Skeleton;
    __touch(2133);
});
__touch(2129);
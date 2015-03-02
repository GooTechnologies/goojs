define([
    'goo/math/Transform',
    'goo/animationpack/Joint',
    'goo/math/Matrix4x4'
], function (Transform, Joint, Matrix4x4) {
    'use strict';
    __touch(2149);
    function SkeletonPose(skeleton) {
        this._skeleton = skeleton;
        __touch(2156);
        this._localTransforms = [];
        __touch(2157);
        this._globalTransforms = [];
        __touch(2158);
        this._matrixPalette = [];
        __touch(2159);
        this._poseListeners = [];
        __touch(2160);
        var jointCount = this._skeleton._joints.length;
        __touch(2161);
        for (var i = 0; i < jointCount; i++) {
            this._localTransforms[i] = new Transform();
            __touch(2163);
        }
        for (var i = 0; i < jointCount; i++) {
            this._globalTransforms[i] = new Transform();
            __touch(2164);
        }
        for (var i = 0; i < jointCount; i++) {
            this._matrixPalette[i] = new Matrix4x4();
            __touch(2165);
        }
        this.setToBindPose();
        __touch(2162);
    }
    __touch(2150);
    SkeletonPose.prototype.setToBindPose = function () {
        for (var i = 0; i < this._localTransforms.length; i++) {
            this._localTransforms[i].matrix.copy(this._skeleton._joints[i]._inverseBindPose.matrix).invert();
            __touch(2167);
            var parentIndex = this._skeleton._joints[i]._parentIndex;
            __touch(2168);
            if (parentIndex !== Joint.NO_PARENT) {
                Matrix4x4.combine(this._skeleton._joints[parentIndex]._inverseBindPose.matrix, this._localTransforms[i].matrix, this._localTransforms[i].matrix);
                __touch(2169);
            }
        }
        this.updateTransforms();
        __touch(2166);
    };
    __touch(2151);
    SkeletonPose.prototype.updateTransforms = function () {
        for (var i = 0; i < this._skeleton._joints.length; i++) {
            var parentIndex = this._skeleton._joints[i]._parentIndex;
            __touch(2171);
            if (parentIndex !== Joint.NO_PARENT) {
                Matrix4x4.combine(this._globalTransforms[parentIndex].matrix, this._localTransforms[i].matrix, this._globalTransforms[i].matrix);
                __touch(2173);
            } else {
                this._globalTransforms[i].matrix.copy(this._localTransforms[i].matrix);
                __touch(2174);
            }
            Matrix4x4.combine(this._globalTransforms[i].matrix, this._skeleton._joints[i]._inverseBindPose.matrix, this._matrixPalette[i]);
            __touch(2172);
        }
        this.firePoseUpdated();
        __touch(2170);
    };
    __touch(2152);
    SkeletonPose.prototype.firePoseUpdated = function () {
        for (var i = this._poseListeners.length - 1; i >= 0; i--) {
            this._poseListeners[i].poseUpdated(this);
            __touch(2175);
        }
    };
    __touch(2153);
    SkeletonPose.prototype.clone = function () {
        return new SkeletonPose(this._skeleton);
        __touch(2176);
    };
    __touch(2154);
    return SkeletonPose;
    __touch(2155);
});
__touch(2148);
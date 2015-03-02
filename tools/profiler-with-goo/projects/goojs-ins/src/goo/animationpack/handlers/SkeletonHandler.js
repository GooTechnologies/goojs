define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/animationpack/Joint',
    'goo/animationpack/Skeleton',
    'goo/animationpack/SkeletonPose',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ConfigHandler, Joint, Skeleton, SkeletonPose, PromiseUtil, _) {
    'use strict';
    __touch(2869);
    function SkeletonHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(2876);
    }
    __touch(2870);
    SkeletonHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(2871);
    SkeletonHandler.prototype.constructor = SkeletonHandler;
    __touch(2872);
    ConfigHandler._registerClass('skeleton', SkeletonHandler);
    __touch(2873);
    SkeletonHandler.prototype._update = function (ref, config) {
        if (!this._objects[ref]) {
            if (!config) {
                return PromiseUtil.resolve();
                __touch(2884);
            }
            var joints = [];
            __touch(2878);
            _.forEach(config.joints, function (jointConfig) {
                var joint = new Joint(jointConfig.name);
                __touch(2885);
                joint._index = jointConfig.index;
                __touch(2886);
                joint._parentIndex = jointConfig.parentIndex;
                __touch(2887);
                joint._inverseBindPose.matrix.data.set(jointConfig.inverseBindPose);
                __touch(2888);
                joints.push(joint);
                __touch(2889);
            }, null, 'index');
            __touch(2879);
            var skeleton = new Skeleton(config.name, joints);
            __touch(2880);
            var pose = new SkeletonPose(skeleton);
            __touch(2881);
            pose.setToBindPose();
            __touch(2882);
            this._objects[ref] = pose;
            __touch(2883);
        }
        return PromiseUtil.resolve(this._objects[ref]);
        __touch(2877);
    };
    __touch(2874);
    return SkeletonHandler;
    __touch(2875);
});
__touch(2868);
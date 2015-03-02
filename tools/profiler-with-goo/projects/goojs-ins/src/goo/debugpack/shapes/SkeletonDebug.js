define([
    'goo/shapes/Box',
    'goo/math/Transform',
    'goo/animationpack/Joint',
    'goo/util/MeshBuilder',
    'goo/renderer/MeshData'
], function (Box, Transform, Joint, MeshBuilder, MeshData) {
    'use strict';
    __touch(3673);
    function SkeletonDebug() {
    }
    __touch(3674);
    var calcTrans = new Transform();
    __touch(3675);
    SkeletonDebug.prototype.getMesh = function (pose) {
        var joints = pose._skeleton._joints;
        __touch(3682);
        return [
            this._buildLines(joints),
            this._buildBoxes(joints)
        ];
        __touch(3683);
    };
    __touch(3676);
    SkeletonDebug.prototype._buildBoxes = function (joints) {
        var boxBuilder = new MeshBuilder();
        __touch(3684);
        var box = new Box(2, 2, 2);
        __touch(3685);
        box.attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float');
        __touch(3686);
        box.attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Float');
        __touch(3687);
        box.rebuildData();
        __touch(3688);
        box.rebuild();
        __touch(3689);
        for (var i = 0; i < joints.length; i++) {
            calcTrans.matrix.copy(joints[i]._inverseBindPose.matrix).invert();
            __touch(3694);
            this._stuffBox(box, joints[i]);
            __touch(3695);
            boxBuilder.addMeshData(box, calcTrans);
            __touch(3696);
        }
        var meshes = boxBuilder.build();
        __touch(3690);
        var boxes = meshes[0];
        __touch(3691);
        this._buildPaletteMap(boxes, joints);
        __touch(3692);
        return boxes;
        __touch(3693);
    };
    __touch(3677);
    SkeletonDebug.prototype._buildLines = function (joints) {
        var positions = [], weights = [], jointIds = [], indices = [], count = 0, td = calcTrans.matrix.data;
        __touch(3697);
        for (var i = 0; i < joints.length; i++) {
            var joint = joints[i];
            __touch(3706);
            if (joint._parentIndex !== Joint.NO_PARENT) {
                var parentJoint = joints[joint._parentIndex];
                __touch(3707);
                weights.push(1, 0, 0, 0, 1, 0, 0, 0);
                __touch(3708);
                jointIds.push(joint._index, 0, 0, 0, parentJoint._index, 0, 0, 0);
                __touch(3709);
                indices.push(count * 2, count * 2 + 1);
                __touch(3710);
                count++;
                __touch(3711);
                calcTrans.matrix.copy(joint._inverseBindPose.matrix).invert();
                __touch(3712);
                positions.push(td[12], td[13], td[14]);
                __touch(3713);
                calcTrans.matrix.copy(parentJoint._inverseBindPose.matrix).invert();
                __touch(3714);
                positions.push(td[12], td[13], td[14]);
                __touch(3715);
            }
        }
        var line = new MeshData(MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.WEIGHTS,
            MeshData.JOINTIDS
        ]), positions.length / 3, indices.length);
        __touch(3698);
        line.indexModes = ['Lines'];
        __touch(3699);
        line.getAttributeBuffer(MeshData.POSITION).set(positions);
        __touch(3700);
        line.getAttributeBuffer(MeshData.WEIGHTS).set(weights);
        __touch(3701);
        line.getAttributeBuffer(MeshData.JOINTIDS).set(jointIds);
        __touch(3702);
        line.getIndexBuffer().set(indices);
        __touch(3703);
        this._buildPaletteMap(line, joints);
        __touch(3704);
        return line;
        __touch(3705);
    };
    __touch(3678);
    SkeletonDebug.prototype._stuffBox = function (box, joint) {
        var weights = box.getAttributeBuffer('WEIGHTS');
        __touch(3716);
        var jointIds = box.getAttributeBuffer('JOINTIDS');
        __touch(3717);
        for (var i = 0; i < weights.length; i += 4) {
            weights[i] = 1;
            __touch(3718);
            jointIds[i] = joint._index;
            __touch(3719);
        }
    };
    __touch(3679);
    SkeletonDebug.prototype._buildPaletteMap = function (meshData, joints) {
        var paletteMap = [];
        __touch(3720);
        for (var i = 0; i < joints.length; i++) {
            paletteMap[i] = joints[i]._index;
            __touch(3723);
        }
        meshData.paletteMap = paletteMap;
        __touch(3721);
        meshData.weightsPerVertex = 4;
        __touch(3722);
    };
    __touch(3680);
    return SkeletonDebug;
    __touch(3681);
});
__touch(3672);
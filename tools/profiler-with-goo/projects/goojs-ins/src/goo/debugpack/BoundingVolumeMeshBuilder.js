define([
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere',
    'goo/util/MeshBuilder',
    'goo/renderer/MeshData',
    'goo/math/Transform'
], function (BoundingBox, BoundingSphere, MeshBuilder, MeshData, Transform) {
    'use strict';
    __touch(3176);
    function BoundingVolumeMeshBuilder() {
    }
    __touch(3177);
    function buildBox(dx, dy, dz) {
        var verts = [
            dx,
            dy,
            dz,
            dx,
            dy,
            -dz,
            dx,
            -dy,
            dz,
            dx,
            -dy,
            -dz,
            -dx,
            dy,
            dz,
            -dx,
            dy,
            -dz,
            -dx,
            -dy,
            dz,
            -dx,
            -dy,
            -dz
        ];
        __touch(3185);
        var indices = [
            0,
            1,
            0,
            2,
            1,
            3,
            2,
            3,
            4,
            5,
            4,
            6,
            5,
            7,
            6,
            7,
            0,
            4,
            1,
            5,
            2,
            6,
            3,
            7
        ];
        __touch(3186);
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
        __touch(3187);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3188);
        meshData.getIndexBuffer().set(indices);
        __touch(3189);
        meshData.indexLengths = null;
        __touch(3190);
        meshData.indexModes = ['Lines'];
        __touch(3191);
        return meshData;
        __touch(3192);
    }
    __touch(3178);
    BoundingVolumeMeshBuilder.buildBox = function (boundingBox) {
        var boxMeshData = buildBox(boundingBox.xExtent, boundingBox.yExtent, boundingBox.zExtent);
        __touch(3193);
        return boxMeshData;
        __touch(3194);
    };
    __touch(3179);
    function buildCircle(radius, nSegments) {
        radius = radius || 1;
        __touch(3195);
        nSegments = nSegments || 8;
        __touch(3196);
        var verts = [];
        __touch(3197);
        var indices = [];
        __touch(3198);
        var ak = Math.PI * 2 / nSegments;
        __touch(3199);
        for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
            verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
            __touch(3207);
            indices.push(i, i + 1);
            __touch(3208);
        }
        indices[indices.length - 1] = 0;
        __touch(3200);
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);
        __touch(3201);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3202);
        meshData.getIndexBuffer().set(indices);
        __touch(3203);
        meshData.indexLengths = null;
        __touch(3204);
        meshData.indexModes = ['Lines'];
        __touch(3205);
        return meshData;
        __touch(3206);
    }
    __touch(3180);
    function buildSphere(radius) {
        radius = radius || 1;
        __touch(3209);
        var meshBuilder = new MeshBuilder();
        __touch(3210);
        var nSegments = 128;
        __touch(3211);
        var circle = buildCircle(radius, nSegments);
        __touch(3212);
        var transform;
        __touch(3213);
        transform = new Transform();
        __touch(3214);
        meshBuilder.addMeshData(circle, transform);
        __touch(3215);
        transform = new Transform();
        __touch(3216);
        transform.rotation.fromAngles(0, Math.PI / 2, 0);
        __touch(3217);
        transform.update();
        __touch(3218);
        meshBuilder.addMeshData(circle, transform);
        __touch(3219);
        transform = new Transform();
        __touch(3220);
        transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
        __touch(3221);
        transform.update();
        __touch(3222);
        meshBuilder.addMeshData(circle, transform);
        __touch(3223);
        var meshDatas = meshBuilder.build();
        __touch(3224);
        return meshDatas[0];
        __touch(3225);
    }
    __touch(3181);
    BoundingVolumeMeshBuilder.buildSphere = function (boundingSphere) {
        var sphereMeshData = buildSphere(boundingSphere.radius);
        __touch(3226);
        return sphereMeshData;
        __touch(3227);
    };
    __touch(3182);
    BoundingVolumeMeshBuilder.build = function (boundingVolume) {
        if (boundingVolume instanceof BoundingBox) {
            return BoundingVolumeMeshBuilder.buildBox(boundingVolume);
            __touch(3228);
        } else if (boundingVolume instanceof BoundingSphere) {
            return BoundingVolumeMeshBuilder.buildSphere(boundingVolume);
            __touch(3229);
        }
    };
    __touch(3183);
    return BoundingVolumeMeshBuilder;
    __touch(3184);
});
__touch(3175);
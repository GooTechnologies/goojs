define([
    'goo/renderer/MeshData',
    'goo/util/MeshBuilder',
    'goo/math/Transform',
    'goo/shapes/Box',
    'goo/shapes/Cylinder'
], function (MeshData, MeshBuilder, Transform, Box, Cylinder) {
    'use strict';
    __touch(3461);
    function CameraDebug() {
        this._camera = CameraDebug.buildCamera();
        __touch(3467);
    }
    __touch(3462);
    CameraDebug.prototype.getMesh = function (camera, options) {
        return options.full ? [
            this._camera,
            CameraDebug.buildFrustum(camera)
        ] : [this._camera];
        __touch(3468);
    };
    __touch(3463);
    CameraDebug.buildFrustum = function (camera) {
        var near = camera.near;
        __touch(3469);
        var far = camera.far;
        __touch(3470);
        var aspect = camera.aspect;
        __touch(3471);
        var tanFar, tanNear;
        __touch(3472);
        if (camera.projectionMode === 0) {
            var tan = Math.tan(camera.fov / 2 * Math.PI / 180);
            __touch(3511);
            tanFar = tan * far;
            __touch(3512);
            tanNear = tan * near;
            __touch(3513);
        } else {
            var size = camera.size || 100;
            __touch(3514);
            tanFar = size;
            __touch(3515);
            tanNear = size;
            __touch(3516);
        }
        var f0, f1, f2, f3;
        __touch(3473);
        f0 = {
            x: -tanFar * aspect,
            y: tanFar,
            z: -far
        };
        __touch(3474);
        f1 = {
            x: -tanFar * aspect,
            y: -tanFar,
            z: -far
        };
        __touch(3475);
        f2 = {
            x: tanFar * aspect,
            y: -tanFar,
            z: -far
        };
        __touch(3476);
        f3 = {
            x: tanFar * aspect,
            y: tanFar,
            z: -far
        };
        __touch(3477);
        var n0, n1, n2, n3;
        __touch(3478);
        n0 = {
            x: -tanNear * aspect,
            y: tanNear,
            z: -near
        };
        __touch(3479);
        n1 = {
            x: -tanNear * aspect,
            y: -tanNear,
            z: -near
        };
        __touch(3480);
        n2 = {
            x: tanNear * aspect,
            y: -tanNear,
            z: -near
        };
        __touch(3481);
        n3 = {
            x: tanNear * aspect,
            y: tanNear,
            z: -near
        };
        __touch(3482);
        var verts = [];
        __touch(3483);
        verts.push(f0.x, f0.y, f0.z);
        __touch(3484);
        verts.push(f1.x, f1.y, f1.z);
        __touch(3485);
        verts.push(f2.x, f2.y, f2.z);
        __touch(3486);
        verts.push(f3.x, f3.y, f3.z);
        __touch(3487);
        verts.push(n0.x, n0.y, n0.z);
        __touch(3488);
        verts.push(n1.x, n1.y, n1.z);
        __touch(3489);
        verts.push(n2.x, n2.y, n2.z);
        __touch(3490);
        verts.push(n3.x, n3.y, n3.z);
        __touch(3491);
        var indices = [];
        __touch(3492);
        indices.push(0, 1);
        __touch(3493);
        indices.push(1, 2);
        __touch(3494);
        indices.push(2, 3);
        __touch(3495);
        indices.push(3, 0);
        __touch(3496);
        indices.push(4, 5);
        __touch(3497);
        indices.push(5, 6);
        __touch(3498);
        indices.push(6, 7);
        __touch(3499);
        indices.push(7, 4);
        __touch(3500);
        indices.push(0, 4);
        __touch(3501);
        indices.push(1, 5);
        __touch(3502);
        indices.push(2, 6);
        __touch(3503);
        indices.push(3, 7);
        __touch(3504);
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 8, 24);
        __touch(3505);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3506);
        meshData.getIndexBuffer().set(indices);
        __touch(3507);
        meshData.indexLengths = null;
        __touch(3508);
        meshData.indexModes = ['Lines'];
        __touch(3509);
        return meshData;
        __touch(3510);
    };
    __touch(3464);
    CameraDebug.buildCamera = function () {
        var meshBuilder = new MeshBuilder();
        __touch(3517);
        var transform = new Transform();
        __touch(3518);
        var cameraBox1 = new Cylinder(32, 0.6);
        __touch(3519);
        var cameraBox2 = new Cylinder(32, 0.6);
        __touch(3520);
        var cameraBox3 = new Box(0.3, 1, 1.6);
        __touch(3521);
        var cameraBox4 = new Box(0.2, 0.15, 0.7);
        __touch(3522);
        cameraBox4.applyFunction(MeshData.POSITION, function (vert) {
            return [
                vert.x + vert.x / ((vert.z + 1.1) * 0.3),
                vert.y + vert.y / ((vert.z + 1.1) * 0.3),
                vert.z
            ];
            __touch(3540);
        });
        __touch(3523);
        transform.translation.setd(0, 0, 0);
        __touch(3524);
        transform.update();
        __touch(3525);
        meshBuilder.addMeshData(cameraBox4, transform);
        __touch(3526);
        transform.translation.setd(0, 0, 1.3);
        __touch(3527);
        transform.update();
        __touch(3528);
        meshBuilder.addMeshData(cameraBox3, transform);
        __touch(3529);
        transform.scale.setd(1, 1, 0.5);
        __touch(3530);
        transform.setRotationXYZ(0, Math.PI / 2, 0);
        __touch(3531);
        transform.translation.setd(0, 1.2, 0.6);
        __touch(3532);
        transform.update();
        __touch(3533);
        meshBuilder.addMeshData(cameraBox1, transform);
        __touch(3534);
        transform.translation.setd(0, 1.2, 2);
        __touch(3535);
        transform.update();
        __touch(3536);
        meshBuilder.addMeshData(cameraBox2, transform);
        __touch(3537);
        var meshDatas = meshBuilder.build();
        __touch(3538);
        return meshDatas[0];
        __touch(3539);
    };
    __touch(3465);
    return CameraDebug;
    __touch(3466);
});
__touch(3460);
define([
    'goo/renderer/MeshData',
    'goo/util/MeshBuilder',
    'goo/math/Transform',
    'goo/shapes/Sphere',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight'
], function (MeshData, MeshBuilder, Transform, Sphere, PointLight, DirectionalLight, SpotLight) {
    'use strict';
    __touch(3542);
    function LightDebug() {
        this._ball = new Sphere(12, 12, 0.3);
        __touch(3555);
        this._pointLightMesh = LightDebug._buildPointLightMesh();
        __touch(3556);
        this._spotLightMesh = LightDebug._buildSpotLightMesh();
        __touch(3557);
        this._directionalLightMesh = LightDebug._buildDirectionalLightMesh();
        __touch(3558);
    }
    __touch(3543);
    LightDebug.prototype.getMesh = function (light, options) {
        if (light instanceof PointLight) {
            return options.full ? [
                this._ball,
                this._pointLightMesh
            ] : [this._ball];
            __touch(3559);
        } else if (light instanceof SpotLight) {
            return options.full ? [
                this._ball,
                this._spotLightMesh
            ] : [this._ball];
            __touch(3560);
        } else if (light instanceof DirectionalLight) {
            return options.full ? [
                this._ball,
                this._directionalLightMesh
            ] : [this._ball];
            __touch(3561);
        }
    };
    __touch(3544);
    LightDebug._buildPointLightMesh = function () {
        return buildBall();
        __touch(3562);
    };
    __touch(3545);
    LightDebug._buildSpotLightMesh = function () {
        return buildCone();
        __touch(3563);
    };
    __touch(3546);
    LightDebug._buildDirectionalLightMesh = function () {
        return buildColumn();
        __touch(3564);
    };
    __touch(3547);
    function buildCircle(radius, nSegments) {
        radius = radius || 1;
        __touch(3565);
        nSegments = nSegments || 8;
        __touch(3566);
        var verts = [];
        __touch(3567);
        var indices = [];
        __touch(3568);
        var ak = Math.PI * 2 / nSegments;
        __touch(3569);
        for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
            verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
            __touch(3577);
            indices.push(i, i + 1);
            __touch(3578);
        }
        indices[indices.length - 1] = 0;
        __touch(3570);
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);
        __touch(3571);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3572);
        meshData.getIndexBuffer().set(indices);
        __touch(3573);
        meshData.indexLengths = null;
        __touch(3574);
        meshData.indexModes = ['Lines'];
        __touch(3575);
        return meshData;
        __touch(3576);
    }
    __touch(3548);
    function buildBall() {
        var radius = 1;
        __touch(3579);
        var meshBuilder = new MeshBuilder();
        __touch(3580);
        var nSegments = 128;
        __touch(3581);
        var circle = buildCircle(radius, nSegments);
        __touch(3582);
        var transform;
        __touch(3583);
        transform = new Transform();
        __touch(3584);
        meshBuilder.addMeshData(circle, transform);
        __touch(3585);
        transform = new Transform();
        __touch(3586);
        transform.rotation.fromAngles(0, Math.PI / 2, 0);
        __touch(3587);
        transform.update();
        __touch(3588);
        meshBuilder.addMeshData(circle, transform);
        __touch(3589);
        transform = new Transform();
        __touch(3590);
        transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
        __touch(3591);
        transform.update();
        __touch(3592);
        meshBuilder.addMeshData(circle, transform);
        __touch(3593);
        var meshDatas = meshBuilder.build();
        __touch(3594);
        return meshDatas[0];
        __touch(3595);
    }
    __touch(3549);
    function buildUmbrella(nSegments) {
        nSegments = nSegments || 8;
        __touch(3596);
        var verts = [
            0,
            0,
            0
        ];
        __touch(3597);
        var indices = [];
        __touch(3598);
        var ak = Math.PI * 2 / nSegments;
        __touch(3599);
        for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
            verts.push(Math.cos(k), Math.sin(k), 1);
            __touch(3606);
            indices.push(0, i + 1);
            __touch(3607);
        }
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments + 1, indices.length);
        __touch(3600);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3601);
        meshData.getIndexBuffer().set(indices);
        __touch(3602);
        meshData.indexLengths = null;
        __touch(3603);
        meshData.indexModes = ['Lines'];
        __touch(3604);
        return meshData;
        __touch(3605);
    }
    __touch(3550);
    function buildCone() {
        var length = -1;
        __touch(3608);
        var meshBuilder = new MeshBuilder();
        __touch(3609);
        var nSegments = 64;
        __touch(3610);
        var nParallel = 2;
        __touch(3611);
        var dxParallel = length / 2;
        __touch(3612);
        var dyParallel = dxParallel;
        __touch(3613);
        for (var i = 1; i <= nParallel; i++) {
            var circle = buildCircle(dyParallel * i, nSegments);
            __touch(3621);
            var transform = new Transform();
            __touch(3622);
            transform.translation.set(0, 0, dxParallel * i);
            __touch(3623);
            transform.update();
            __touch(3624);
            meshBuilder.addMeshData(circle, transform);
            __touch(3625);
        }
        var umbrella = buildUmbrella(4);
        __touch(3614);
        var transform = new Transform();
        __touch(3615);
        transform.scale.set(dyParallel * nParallel, dyParallel * nParallel, dxParallel * nParallel);
        __touch(3616);
        transform.update();
        __touch(3617);
        meshBuilder.addMeshData(umbrella, transform);
        __touch(3618);
        var meshDatas = meshBuilder.build();
        __touch(3619);
        return meshDatas[0];
        __touch(3620);
    }
    __touch(3551);
    function buildTube(nSegments) {
        nSegments = nSegments || 8;
        __touch(3626);
        var verts = [];
        __touch(3627);
        var indices = [];
        __touch(3628);
        var ak = Math.PI * 2 / nSegments;
        __touch(3629);
        for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
            verts.push(Math.cos(k), Math.sin(k), 0);
            __touch(3636);
            verts.push(Math.cos(k), Math.sin(k), 1);
            __touch(3637);
            indices.push(i * 2, i * 2 + 1);
            __touch(3638);
        }
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments * 2, indices.length);
        __touch(3630);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3631);
        meshData.getIndexBuffer().set(indices);
        __touch(3632);
        meshData.indexLengths = null;
        __touch(3633);
        meshData.indexModes = ['Lines'];
        __touch(3634);
        return meshData;
        __touch(3635);
    }
    __touch(3552);
    function buildColumn() {
        var meshBuilder = new MeshBuilder();
        __touch(3639);
        var nSegments = 64;
        __touch(3640);
        var nParallel = 2;
        __touch(3641);
        var dxParallel = 10 / nParallel;
        __touch(3642);
        var radius = 1;
        __touch(3643);
        for (var i = 0; i < nParallel; i++) {
            var circle = buildCircle(radius, nSegments);
            __touch(3651);
            var transform = new Transform();
            __touch(3652);
            transform.translation.set(0, 0, -dxParallel * i);
            __touch(3653);
            transform.update();
            __touch(3654);
            meshBuilder.addMeshData(circle, transform);
            __touch(3655);
        }
        var tube = buildTube(4);
        __touch(3644);
        var transform = new Transform();
        __touch(3645);
        transform.scale.set(radius, radius, -dxParallel * nParallel);
        __touch(3646);
        transform.update();
        __touch(3647);
        meshBuilder.addMeshData(tube, transform);
        __touch(3648);
        var meshDatas = meshBuilder.build();
        __touch(3649);
        return meshDatas[0];
        __touch(3650);
    }
    __touch(3553);
    return LightDebug;
    __touch(3554);
});
__touch(3541);
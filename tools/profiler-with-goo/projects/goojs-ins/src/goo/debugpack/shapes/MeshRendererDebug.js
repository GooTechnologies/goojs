define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(3657);
    function MeshRendererDebug() {
        this._meshes = [
            buildBox(1, 1, 1),
            null
        ];
        __touch(3662);
    }
    __touch(3658);
    MeshRendererDebug.prototype.getMesh = function () {
        return this._meshes;
        __touch(3663);
    };
    __touch(3659);
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
        __touch(3664);
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
        __touch(3665);
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);
        __touch(3666);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(3667);
        meshData.getIndexBuffer().set(indices);
        __touch(3668);
        meshData.indexLengths = null;
        __touch(3669);
        meshData.indexModes = ['Lines'];
        __touch(3670);
        return meshData;
        __touch(3671);
    }
    __touch(3660);
    return MeshRendererDebug;
    __touch(3661);
});
__touch(3656);
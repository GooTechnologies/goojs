define([
    'goo/renderer/MeshData',
    'goo/math/MathUtils'
], function (MeshData, MathUtils) {
    'use strict';
    __touch(8181);
    function Triangle(verts) {
        this.verts = verts;
        __touch(8186);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL
        ]);
        __touch(8187);
        MeshData.call(this, attributeMap, 3, 3);
        __touch(8188);
        this.rebuild();
        __touch(8189);
    }
    __touch(8182);
    Triangle.prototype = Object.create(MeshData.prototype);
    __touch(8183);
    Triangle.prototype.rebuild = function () {
        this.getAttributeBuffer(MeshData.POSITION).set(this.verts);
        __touch(8190);
        var normals = MathUtils.getTriangleNormal(this.verts[0], this.verts[1], this.verts[2], this.verts[3], this.verts[4], this.verts[5], this.verts[6], this.verts[7], this.verts[8]);
        __touch(8191);
        this.getAttributeBuffer(MeshData.NORMAL).set([
            normals[0],
            normals[1],
            normals[2],
            normals[0],
            normals[1],
            normals[2],
            normals[0],
            normals[1],
            normals[2]
        ]);
        __touch(8192);
        this.getIndexBuffer().set([
            0,
            1,
            2
        ]);
        __touch(8193);
        return this;
        __touch(8194);
    };
    __touch(8184);
    return Triangle;
    __touch(8185);
});
__touch(8180);
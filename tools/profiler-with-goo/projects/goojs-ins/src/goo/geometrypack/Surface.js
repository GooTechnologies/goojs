define([
    'goo/renderer/MeshData',
    'goo/math/MathUtils'
], function (MeshData, MathUtils) {
    'use strict';
    __touch(8106);
    function Surface(verts, vertsPerLine, verticallyClosed) {
        this.verts = verts;
        __touch(8115);
        this.vertsPerLine = vertsPerLine || 2;
        __touch(8116);
        this.verticallyClosed = !!verticallyClosed;
        __touch(8117);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(8118);
        var nVerts = this.verts.length / 3;
        __touch(8119);
        var nLines = nVerts / this.vertsPerLine;
        __touch(8120);
        MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);
        __touch(8121);
        this.rebuild();
        __touch(8122);
    }
    __touch(8107);
    Surface.prototype = Object.create(MeshData.prototype);
    __touch(8108);
    Surface.prototype.constructor = Surface;
    __touch(8109);
    Surface.prototype.rebuild = function () {
        this.getAttributeBuffer(MeshData.POSITION).set(this.verts);
        __touch(8123);
        var indices = [];
        __touch(8124);
        var norms = [];
        __touch(8125);
        var normals = [];
        __touch(8126);
        var nVerts = this.verts.length / 3;
        __touch(8127);
        var nLines = nVerts / this.vertsPerLine;
        __touch(8128);
        for (var i = 0; i < nLines - 1; i++) {
            for (var j = 0; j < this.vertsPerLine - 1; j++) {
                var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
                __touch(8139);
                var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
                __touch(8140);
                var downRight = (i + 1) * this.vertsPerLine + (j + 1);
                __touch(8141);
                var upRight = (i + 0) * this.vertsPerLine + (j + 1);
                __touch(8142);
                indices.push(upLeft, downLeft, upRight, upRight, downLeft, downRight);
                __touch(8143);
                normals = MathUtils.getTriangleNormal(this.verts[upLeft * 3 + 0], this.verts[upLeft * 3 + 1], this.verts[upLeft * 3 + 2], this.verts[downLeft * 3 + 0], this.verts[downLeft * 3 + 1], this.verts[downLeft * 3 + 2], this.verts[upRight * 3 + 0], this.verts[upRight * 3 + 1], this.verts[upRight * 3 + 2]);
                __touch(8144);
                norms.push(normals[0], normals[1], normals[2]);
                __touch(8145);
            }
            if (this.verticallyClosed) {
                var upLeft = (i + 0) * this.vertsPerLine + (0 + 0);
                __touch(8146);
                var downLeft = (i + 1) * this.vertsPerLine + (0 + 0);
                __touch(8147);
                var upRight = (i + 0) * this.vertsPerLine + (0 + 1);
                __touch(8148);
                normals = MathUtils.getTriangleNormal(this.verts[upLeft * 3 + 0], this.verts[upLeft * 3 + 1], this.verts[upLeft * 3 + 2], this.verts[downLeft * 3 + 0], this.verts[downLeft * 3 + 1], this.verts[downLeft * 3 + 2], this.verts[upRight * 3 + 0], this.verts[upRight * 3 + 1], this.verts[upRight * 3 + 2]);
                __touch(8149);
                norms.push(normals[0], normals[1], normals[2]);
                __touch(8150);
            } else {
                norms.push(normals[0], normals[1], normals[2]);
                __touch(8151);
            }
        }
        i--;
        __touch(8129);
        for (var j = 0; j < this.vertsPerLine - 1; j++) {
            var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
            __touch(8152);
            var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
            __touch(8153);
            var upRight = (i + 0) * this.vertsPerLine + (j + 1);
            __touch(8154);
            normals = MathUtils.getTriangleNormal(this.verts[upLeft * 3 + 0], this.verts[upLeft * 3 + 1], this.verts[upLeft * 3 + 2], this.verts[downLeft * 3 + 0], this.verts[downLeft * 3 + 1], this.verts[downLeft * 3 + 2], this.verts[upRight * 3 + 0], this.verts[upRight * 3 + 1], this.verts[upRight * 3 + 2]);
            __touch(8155);
            norms.push(normals[0], normals[1], normals[2]);
            __touch(8156);
        }
        norms.push(normals[0], normals[1], normals[2]);
        __touch(8130);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(8131);
        this.getIndexBuffer().set(indices);
        __touch(8132);
        var tex = [];
        __touch(8133);
        var bounds = getBounds(this.verts);
        __touch(8134);
        var extentX = bounds.maxX - bounds.minX;
        __touch(8135);
        var extentY = bounds.maxY - bounds.minY;
        __touch(8136);
        for (var i = 0; i < this.verts.length; i += 3) {
            var x = (this.verts[i + 0] - bounds.minX) / extentX;
            __touch(8157);
            var y = (this.verts[i + 2] - bounds.minY) / extentY;
            __touch(8158);
            tex.push(x, y);
            __touch(8159);
        }
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(8137);
        return this;
        __touch(8138);
    };
    __touch(8110);
    function getBounds(verts) {
        var minX = verts[0];
        __touch(8160);
        var maxX = verts[0];
        __touch(8161);
        var minY = verts[1];
        __touch(8162);
        var maxY = verts[1];
        __touch(8163);
        for (var i = 3; i < verts.length; i += 3) {
            minX = minX < verts[i + 0] ? minX : verts[i + 0];
            __touch(8165);
            maxX = maxX > verts[i + 0] ? maxX : verts[i + 0];
            __touch(8166);
            minY = minY < verts[i + 2] ? minY : verts[i + 2];
            __touch(8167);
            maxY = maxY > verts[i + 2] ? maxY : verts[i + 2];
            __touch(8168);
        }
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        };
        __touch(8164);
    }
    __touch(8111);
    Surface.createFromHeightMap = function (heightMap, xScale, yScale, zScale) {
        xScale = xScale || 1;
        __touch(8169);
        yScale = yScale || 1;
        __touch(8170);
        zScale = zScale || 1;
        __touch(8171);
        var verts = [];
        __touch(8172);
        for (var i = 0; i < heightMap.length; i++) {
            for (var j = 0; j < heightMap[i].length; j++) {
                verts.push(i * xScale, heightMap[i][j] * yScale, j * zScale);
                __touch(8175);
            }
        }
        verts.reverse();
        __touch(8173);
        return new Surface(verts, heightMap[0].length);
        __touch(8174);
    };
    __touch(8112);
    Surface.createTessellatedFlat = function (xSize, ySize, xCount, yCount) {
        var verts = [];
        __touch(8176);
        for (var i = 0; i < xCount; i++) {
            for (var j = 0; j < yCount; j++) {
                verts.push(i * xSize / xCount - xSize * 0.5, j * ySize / yCount - ySize * 0.5, 0);
                __touch(8179);
            }
        }
        var surface = new Surface(verts, xCount);
        __touch(8177);
        return surface;
        __touch(8178);
    };
    __touch(8113);
    return Surface;
    __touch(8114);
});
__touch(8105);
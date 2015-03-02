define([
    'goo/renderer/MeshData',
    'goo/math/MathUtils'
], function (MeshData, MathUtils) {
    'use strict';
    __touch(1506);
    function TerrainSurface(heightMatrix, xWidth, yHeight, zWidth) {
        var verts = [];
        __touch(1511);
        for (var i = 0; i < heightMatrix.length; i++) {
            for (var j = 0; j < heightMatrix[i].length; j++) {
                verts.push(i * xWidth / (heightMatrix.length - 1), heightMatrix[i][j] * yHeight, j * zWidth / (heightMatrix.length - 1));
                __touch(1519);
            }
        }
        this.verts = verts;
        __touch(1512);
        this.vertsPerLine = heightMatrix[0].length;
        __touch(1513);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(1514);
        var nVerts = this.verts.length / 3;
        __touch(1515);
        var nLines = nVerts / this.vertsPerLine;
        __touch(1516);
        MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);
        __touch(1517);
        this.rebuild();
        __touch(1518);
    }
    __touch(1507);
    TerrainSurface.prototype = Object.create(MeshData.prototype);
    __touch(1508);
    TerrainSurface.prototype.rebuild = function () {
        this.getAttributeBuffer(MeshData.POSITION).set(this.verts);
        __touch(1520);
        var indices = [];
        __touch(1521);
        var norms = [];
        __touch(1522);
        var normals = [];
        __touch(1523);
        var nVerts = this.verts.length / 3;
        __touch(1524);
        var nLines = nVerts / this.vertsPerLine;
        __touch(1525);
        for (var i = 0; i < nLines - 1; i++) {
            for (var j = 0; j < this.vertsPerLine - 1; j++) {
                var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
                __touch(1536);
                var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
                __touch(1537);
                var downRight = (i + 1) * this.vertsPerLine + (j + 1);
                __touch(1538);
                var upRight = (i + 0) * this.vertsPerLine + (j + 1);
                __touch(1539);
                indices.push(downLeft, upLeft, upRight, downLeft, upRight, downRight);
                __touch(1540);
                normals = MathUtils.getTriangleNormal(this.verts[upLeft * 3 + 0], this.verts[upLeft * 3 + 1], this.verts[upLeft * 3 + 2], this.verts[upRight * 3 + 0], this.verts[upRight * 3 + 1], this.verts[upRight * 3 + 2], this.verts[downLeft * 3 + 0], this.verts[downLeft * 3 + 1], this.verts[downLeft * 3 + 2]);
                __touch(1541);
                norms.push(normals[0], normals[1], normals[2]);
                __touch(1542);
            }
            norms.push(normals[0], normals[1], normals[2]);
            __touch(1535);
        }
        i--;
        __touch(1526);
        for (var j = 0; j < this.vertsPerLine - 1; j++) {
            var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
            __touch(1543);
            var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
            __touch(1544);
            var upRight = (i + 0) * this.vertsPerLine + (j + 1);
            __touch(1545);
            normals = MathUtils.getTriangleNormal(this.verts[upLeft * 3 + 0], this.verts[upLeft * 3 + 1], this.verts[upLeft * 3 + 2], this.verts[upRight * 3 + 0], this.verts[upRight * 3 + 1], this.verts[upRight * 3 + 2], this.verts[downLeft * 3 + 0], this.verts[downLeft * 3 + 1], this.verts[downLeft * 3 + 2]);
            __touch(1546);
            norms.push(normals[0], normals[1], normals[2]);
            __touch(1547);
        }
        norms.push(normals[0], normals[1], normals[2]);
        __touch(1527);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(1528);
        this.getIndexBuffer().set(indices);
        __touch(1529);
        var tex = [];
        __touch(1530);
        var maxX = this.verts[this.verts.length - 3];
        __touch(1531);
        var maxZ = this.verts[this.verts.length - 1];
        __touch(1532);
        for (var i = 0; i < this.verts.length; i += 3) {
            var x = this.verts[i + 0] / maxX;
            __touch(1548);
            var z = this.verts[i + 2] / maxZ;
            __touch(1549);
            tex.push(x, z);
            __touch(1550);
        }
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(1533);
        return this;
        __touch(1534);
    };
    __touch(1509);
    return TerrainSurface;
    __touch(1510);
});
__touch(1505);
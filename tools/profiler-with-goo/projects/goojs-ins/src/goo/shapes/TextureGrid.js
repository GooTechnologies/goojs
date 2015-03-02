define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20972);
    function TextureGrid(matrix, textureUnitsPerLine) {
        this.matrix = matrix;
        __touch(20980);
        this.textureUnitsPerLine = textureUnitsPerLine || 8;
        __touch(20981);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20982);
        var nCells = countCells(matrix);
        __touch(20983);
        MeshData.call(this, attributeMap, nCells * 4, nCells * 6);
        __touch(20984);
        this.rebuild();
        __touch(20985);
    }
    __touch(20973);
    TextureGrid.prototype = Object.create(MeshData.prototype);
    __touch(20974);
    function countCells(matrix) {
        var count = 0;
        __touch(20986);
        for (var i = 0; i < matrix.length; i++) {
            count += matrix[i].length;
            __touch(20988);
        }
        return count;
        __touch(20987);
    }
    __touch(20975);
    TextureGrid.prototype.rebuild = function () {
        var verts = [];
        __touch(20989);
        var norms = [];
        __touch(20990);
        var indices = [];
        __touch(20991);
        var tex = [];
        __touch(20992);
        var indexCounter = 0;
        __touch(20993);
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                verts.push(j, -i - 1, 0, j, -i, 0, j + 1, -i, 0, j + 1, -i - 1, 0);
                __touch(20999);
                norms.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
                __touch(21000);
                var texX = this.matrix[i][j] % this.textureUnitsPerLine / this.textureUnitsPerLine;
                __touch(21001);
                var texY = Math.floor(this.matrix[i][j] / this.textureUnitsPerLine) / this.textureUnitsPerLine;
                __touch(21002);
                texY = 1 - texY;
                __touch(21003);
                tex.push(texX, texY - 1 / this.textureUnitsPerLine, texX, texY, texX + 1 / this.textureUnitsPerLine, texY, texX + 1 / this.textureUnitsPerLine, texY - 1 / this.textureUnitsPerLine);
                __touch(21004);
                indices.push(indexCounter + 3, indexCounter + 1, indexCounter + 0, indexCounter + 2, indexCounter + 1, indexCounter + 3);
                __touch(21005);
                indexCounter += 4;
                __touch(21006);
            }
        }
        this.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(20994);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(20995);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(20996);
        this.getIndexBuffer().set(indices);
        __touch(20997);
        return this;
        __touch(20998);
    };
    __touch(20976);
    function stringToMatrix(str) {
        var matrix = [];
        __touch(21007);
        var lineAr = str.split('\n');
        __touch(21008);
        lineAr.forEach(function (line) {
            var charAr = line.split('');
            __touch(21011);
            var matrixLine = charAr.map(function (ch) {
                return ch.charCodeAt(0);
                __touch(21014);
            });
            __touch(21012);
            matrix.push(matrixLine);
            __touch(21013);
        });
        __touch(21009);
        return matrix;
        __touch(21010);
    }
    __touch(20977);
    TextureGrid.fromString = function (str) {
        return new TextureGrid(stringToMatrix(str), 16);
        __touch(21015);
    };
    __touch(20978);
    return TextureGrid;
    __touch(20979);
});
__touch(20971);
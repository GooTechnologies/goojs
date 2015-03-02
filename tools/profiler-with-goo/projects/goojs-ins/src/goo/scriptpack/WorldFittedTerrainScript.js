define([
    'goo/scriptpack/HeightMapBoundingScript',
    'goo/math/Vector3'
], function (HeightMapBoundingScript, Vector3) {
    'use strict';
    __touch(20156);
    var calcVec1 = new Vector3();
    __touch(20157);
    var calcVec2 = new Vector3();
    __touch(20158);
    var _defaults = {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 50,
        minZ: 0,
        maxZ: 100
    };
    __touch(20159);
    function validateTerrainProperties(properties, heightMatrix) {
        if (properties.minX > properties.maxX) {
            throw {
                name: 'Terrain Exception',
                message: 'minX is larger than maxX'
            };
            __touch(20171);
        }
        if (properties.minY > properties.maxY) {
            throw {
                name: 'Terrain Exception',
                message: 'minY is larger than maxY'
            };
            __touch(20172);
        }
        if (properties.minZ > properties.maxZ) {
            throw {
                name: 'Terrain Exception',
                message: 'minZ is larger than maxZ'
            };
            __touch(20173);
        }
        if (!heightMatrix) {
            throw {
                name: 'Terrain Exception',
                message: 'No heightmap data specified'
            };
            __touch(20174);
        }
        if (heightMatrix.length !== heightMatrix[0].length) {
            throw {
                name: 'Terrain Exception',
                message: 'Heightmap data is not a square'
            };
            __touch(20175);
        }
        return true;
        __touch(20170);
    }
    __touch(20160);
    function registerHeightData(heightMatrix, dimensions, heightMapData) {
        dimensions = dimensions || _defaults;
        __touch(20176);
        validateTerrainProperties(dimensions, heightMatrix, heightMapData);
        __touch(20177);
        var scriptContainer = {
            dimensions: dimensions,
            sideQuadCount: heightMatrix.length - 1,
            script: new HeightMapBoundingScript(heightMatrix)
        };
        __touch(20178);
        return scriptContainer;
        __touch(20179);
    }
    __touch(20161);
    function WorldFittedTerrainScript() {
        this.heightMapData = [];
        __touch(20180);
        this.yMargin = 1;
        __touch(20181);
    }
    __touch(20162);
    WorldFittedTerrainScript.prototype.addHeightData = function (heightMatrix, dimensions) {
        var scriptContainer = registerHeightData(heightMatrix, dimensions, this.heightMapData);
        __touch(20182);
        this.heightMapData.push(scriptContainer);
        __touch(20183);
        return scriptContainer;
        __touch(20184);
    };
    __touch(20163);
    WorldFittedTerrainScript.prototype.getHeightDataForPosition = function (pos) {
        for (var i = 0; i < this.heightMapData.length; i++) {
            var dim = this.heightMapData[i].dimensions;
            __touch(20186);
            if (pos[0] <= dim.maxX && pos[0] >= dim.minX) {
                if (pos[1] < dim.maxY + this.yMargin && pos[1] > dim.minY - this.yMargin) {
                    if (pos[2] <= dim.maxZ && pos[2] >= dim.minZ) {
                        return this.heightMapData[i];
                        __touch(20187);
                    }
                }
            }
        }
        return null;
        __touch(20185);
    };
    __touch(20164);
    WorldFittedTerrainScript.prototype.displaceAxisDimensions = function (axPos, axMin, axMax, quadCount) {
        var matrixPos = axPos - axMin;
        __touch(20188);
        return quadCount * matrixPos / (axMax - axMin);
        __touch(20189);
    };
    __touch(20165);
    WorldFittedTerrainScript.prototype.returnToWorldDimensions = function (axPos, axMin, axMax, quadCount) {
        var quadSize = (axMax - axMin) / quadCount;
        __touch(20190);
        var insidePos = axPos * quadSize;
        __touch(20191);
        return axMin + insidePos;
        __touch(20192);
    };
    __touch(20166);
    WorldFittedTerrainScript.prototype.getTerrainHeightAt = function (pos) {
        var heightData = this.getHeightDataForPosition(pos);
        __touch(20193);
        if (heightData === null) {
            return null;
            __touch(20199);
        }
        var dims = heightData.dimensions;
        __touch(20194);
        var tx = this.displaceAxisDimensions(pos[0], dims.minX, dims.maxX, heightData.sideQuadCount);
        __touch(20195);
        var tz = this.displaceAxisDimensions(pos[2], dims.minZ, dims.maxZ, heightData.sideQuadCount);
        __touch(20196);
        var matrixHeight = heightData.script.getPreciseHeight(tx, tz);
        __touch(20197);
        return matrixHeight * (dims.maxY - dims.minY) + dims.minY;
        __touch(20198);
    };
    __touch(20167);
    WorldFittedTerrainScript.prototype.getTerrainNormalAt = function (pos) {
        var heightData = this.getHeightDataForPosition(pos);
        __touch(20200);
        if (!heightData) {
            return null;
            __touch(20210);
        }
        var dims = heightData.dimensions;
        __touch(20201);
        var x = this.displaceAxisDimensions(pos[0], dims.minX, dims.maxX, heightData.sideQuadCount);
        __touch(20202);
        var y = this.displaceAxisDimensions(pos[2], dims.minZ, dims.maxZ, heightData.sideQuadCount);
        __touch(20203);
        var tri = heightData.script.getTriangleAt(x, y);
        __touch(20204);
        for (var i = 0; i < tri.length; i++) {
            tri[i].x = this.returnToWorldDimensions(tri[i].x, dims.minX, dims.maxX, heightData.sideQuadCount);
            __touch(20211);
            tri[i].z = this.returnToWorldDimensions(tri[i].z, dims.minY, dims.maxY, 1);
            __touch(20212);
            tri[i].y = this.returnToWorldDimensions(tri[i].y, dims.minZ, dims.maxZ, heightData.sideQuadCount);
            __touch(20213);
        }
        calcVec1.set(tri[1].x - tri[0].x, tri[1].z - tri[0].z, tri[1].y - tri[0].y);
        __touch(20205);
        calcVec2.set(tri[2].x - tri[0].x, tri[2].z - tri[0].z, tri[2].y - tri[0].y);
        __touch(20206);
        calcVec1.cross(calcVec2);
        __touch(20207);
        if (calcVec1.data[1] < 0) {
            calcVec1.muld(-1, -1, -1);
            __touch(20214);
        }
        calcVec1.normalize();
        __touch(20208);
        return calcVec1;
        __touch(20209);
    };
    __touch(20168);
    return WorldFittedTerrainScript;
    __touch(20169);
});
__touch(20155);
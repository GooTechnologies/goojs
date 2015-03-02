define([
    'goo/math/Matrix4x4',
    'goo/math/Vector4',
    'goo/math/Vector2',
    'goo/renderer/scanline/OccludeeTriangleData'
], function (Matrix4x4, Vector4, Vector2, OccludeeTriangleData) {
    'use strict';
    __touch(13019);
    var INSIDE = 0;
    __touch(13020);
    var LEFT = 1;
    __touch(13021);
    var RIGHT = 2;
    __touch(13022);
    var BELOW = 4;
    __touch(13023);
    var ABOVE = 8;
    __touch(13024);
    var outCodes = new Uint8Array(8);
    __touch(13025);
    var positionArray = new Float32Array(8 * 4);
    __touch(13026);
    var minMaxArray = new Float32Array(5);
    __touch(13027);
    var triangleIndices = new Uint8Array([
        0,
        3,
        4,
        3,
        7,
        4,
        0,
        4,
        5,
        0,
        5,
        1,
        2,
        1,
        5,
        2,
        5,
        6,
        3,
        2,
        6,
        3,
        6,
        7,
        0,
        1,
        2,
        0,
        2,
        3,
        5,
        4,
        6,
        7,
        6,
        4
    ]);
    __touch(13028);
    var edgeIndices = new Uint8Array([
        0,
        1,
        1,
        2,
        2,
        3,
        3,
        0,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        0,
        0,
        4,
        1,
        5,
        2,
        6,
        3,
        7
    ]);
    __touch(13029);
    var triangleData = new OccludeeTriangleData({
        'numberOfPositions': 32,
        'numberOfIndices': 18
    });
    __touch(13030);
    var v1 = new Vector4(0, 0, 0, 1);
    __touch(13031);
    var v2 = new Vector4(0, 0, 0, 1);
    __touch(13032);
    var v3 = new Vector4(0, 0, 0, 1);
    __touch(13033);
    var indices = new Uint8Array(3);
    __touch(13034);
    var combinedMatrix = new Matrix4x4();
    __touch(13035);
    function BoundingBoxOcclusionChecker(renderer) {
        this.renderer = renderer;
        __touch(13048);
        this._clipY = renderer.height - 1;
        __touch(13049);
        this._clipX = renderer.width - 1;
        __touch(13050);
        this._halfClipX = this._clipX / 2;
        __touch(13051);
        this._halfClipY = this._clipY / 2;
        __touch(13052);
    }
    __touch(13036);
    BoundingBoxOcclusionChecker.prototype.occlusionCull = function (entity, cameraViewProjectionMatrix) {
        return this._doSSAABBOcclusionTest(entity, cameraViewProjectionMatrix);
        __touch(13053);
    };
    __touch(13037);
    BoundingBoxOcclusionChecker.prototype._doRenderedBoundingBoxOcclusionTest = function (entity, cameraViewProjectionMatrix) {
        this._copyEntityVerticesToPositionArray(entity);
        __touch(13054);
        if (!this._projectionTransformTriangleData(entity, cameraViewProjectionMatrix)) {
            return false;
            __touch(13061);
        }
        this._addVisibleTrianglesToTriangleData();
        __touch(13055);
        this._screenSpaceTransformTriangleData();
        __touch(13056);
        var maxIndices = triangleData.indexCount;
        __touch(13057);
        var tIndex = 0;
        __touch(13058);
        while (tIndex < maxIndices) {
            indices[0] = triangleData.indices[tIndex++];
            __touch(13062);
            indices[1] = triangleData.indices[tIndex++];
            __touch(13063);
            indices[2] = triangleData.indices[tIndex++];
            __touch(13064);
            if (!this.renderer.isRenderedTriangleOccluded(indices, triangleData.positions)) {
                return false;
                __touch(13065);
            }
        }
        __touch(13059);
        return true;
        __touch(13060);
    };
    __touch(13038);
    BoundingBoxOcclusionChecker.prototype._doSSAABBOcclusionTest = function (entity, cameraViewProjectionMatrix) {
        this._copyEntityVerticesToPositionArray(entity);
        __touch(13066);
        var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
        __touch(13067);
        Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix, combinedMatrix);
        __touch(13068);
        var p = 0;
        __touch(13069);
        while (p < 32) {
            var p1 = p++;
            __touch(13077);
            var p2 = p++;
            __touch(13078);
            var p3 = p++;
            __touch(13079);
            var p4 = p++;
            __touch(13080);
            v1.data[0] = positionArray[p1];
            __touch(13081);
            v1.data[1] = positionArray[p2];
            __touch(13082);
            v1.data[2] = positionArray[p3];
            __touch(13083);
            v1.data[3] = positionArray[p4];
            __touch(13084);
            combinedMatrix.applyPost(v1);
            __touch(13085);
            var wComponent = v1.data[3];
            __touch(13086);
            if (wComponent < this.renderer.camera.near) {
                return false;
                __touch(13093);
            }
            var div = 1 / wComponent;
            __touch(13087);
            v1.data[0] *= div;
            __touch(13088);
            v1.data[1] *= div;
            __touch(13089);
            positionArray[p1] = (v1.data[0] + 1) * this._halfClipX;
            __touch(13090);
            positionArray[p2] = (v1.data[1] + 1) * this._halfClipY;
            __touch(13091);
            positionArray[p4] = div;
            __touch(13092);
        }
        __touch(13070);
        this._clipBox(positionArray);
        __touch(13071);
        minMaxArray[0] = Math.floor(minMaxArray[0]);
        __touch(13072);
        minMaxArray[1] = Math.ceil(minMaxArray[1]);
        __touch(13073);
        minMaxArray[2] = Math.floor(minMaxArray[2]);
        __touch(13074);
        minMaxArray[3] = Math.ceil(minMaxArray[3]);
        __touch(13075);
        return this._isBoundingBoxScanlineOccluded(minMaxArray);
        __touch(13076);
    };
    __touch(13039);
    BoundingBoxOcclusionChecker.prototype._copyEntityVerticesToPositionArray = function (entity) {
        positionArray.set(entity.occludeeComponent.positionArray);
        __touch(13094);
    };
    __touch(13040);
    BoundingBoxOcclusionChecker.prototype._clipBox = function (positions) {
        var minX, maxX, minY, maxY, minDepth;
        __touch(13095);
        minX = Infinity;
        __touch(13096);
        maxX = -Infinity;
        __touch(13097);
        minY = Infinity;
        __touch(13098);
        maxY = -Infinity;
        __touch(13099);
        minDepth = -Infinity;
        __touch(13100);
        var vPos;
        __touch(13101);
        for (var i = 0; i < 8; i++) {
            vPos = i * 4;
            __touch(13109);
            v1.data[0] = positions[vPos];
            __touch(13110);
            v1.data[1] = positions[vPos + 1];
            __touch(13111);
            v1.data[3] = positions[vPos + 3];
            __touch(13112);
            var code = this._calculateOutCode(v1);
            __touch(13113);
            outCodes[i] = code;
            __touch(13114);
            if (code === INSIDE) {
                minDepth = Math.max(minDepth, v1.data[3]);
                __touch(13115);
                var xValue = v1.data[0];
                __touch(13116);
                minX = Math.min(minX, xValue);
                __touch(13117);
                maxX = Math.max(maxX, xValue);
                __touch(13118);
                var yValue = v1.data[1];
                __touch(13119);
                minY = Math.min(minY, yValue);
                __touch(13120);
                maxY = Math.max(maxY, yValue);
                __touch(13121);
            }
        }
        var outcode1, outcode2;
        __touch(13102);
        var vertIndex;
        __touch(13103);
        for (var edgeIndex = 0; edgeIndex < 24; edgeIndex++) {
            vertIndex = edgeIndices[edgeIndex];
            __touch(13122);
            vPos = vertIndex * 4;
            __touch(13123);
            v1.data[0] = positions[vPos];
            __touch(13124);
            v1.data[1] = positions[vPos + 1];
            __touch(13125);
            v1.data[3] = positions[vPos + 3];
            __touch(13126);
            outcode1 = outCodes[vertIndex];
            __touch(13127);
            edgeIndex++;
            __touch(13128);
            vertIndex = edgeIndices[edgeIndex];
            __touch(13129);
            vPos = vertIndex * 4;
            __touch(13130);
            v2.data[0] = positions[vPos];
            __touch(13131);
            v2.data[1] = positions[vPos + 1];
            __touch(13132);
            v2.data[3] = positions[vPos + 3];
            __touch(13133);
            outcode2 = outCodes[vertIndex];
            __touch(13134);
            while (true) {
                if (!(outcode1 | outcode2) || outcode1 & outcode2) {
                    break;
                    __touch(13141);
                }
                var outsideCode = outcode1 ? outcode1 : outcode2;
                __touch(13136);
                var ratio;
                __touch(13137);
                var nextCode;
                __touch(13138);
                if (outsideCode & ABOVE) {
                    ratio = (this._clipY - v1.data[1]) / (v2.data[1] - v1.data[1]);
                    __touch(13142);
                    v3.data[0] = v1.data[0] + (v2.data[0] - v1.data[0]) * ratio;
                    __touch(13143);
                    v3.data[1] = this._clipY;
                    __touch(13144);
                    nextCode = this._calculateOutCode(v3);
                    __touch(13145);
                    if (nextCode === INSIDE) {
                        maxY = this._clipY;
                        __touch(13146);
                        var xValue = v3.data[0];
                        __touch(13147);
                        minX = Math.min(minX, xValue);
                        __touch(13148);
                        maxX = Math.max(maxX, xValue);
                        __touch(13149);
                    }
                } else if (outsideCode & BELOW) {
                    ratio = -v1.data[1] / (v2.data[1] - v1.data[1]);
                    __touch(13150);
                    v3.data[0] = v1.data[0] + (v2.data[0] - v1.data[0]) * ratio;
                    __touch(13151);
                    v3.data[1] = 0;
                    __touch(13152);
                    nextCode = this._calculateOutCode(v3);
                    __touch(13153);
                    if (nextCode === INSIDE) {
                        minY = 0;
                        __touch(13154);
                        var xValue = v3.data[0];
                        __touch(13155);
                        minX = Math.min(minX, xValue);
                        __touch(13156);
                        maxX = Math.max(maxX, xValue);
                        __touch(13157);
                    }
                } else if (outsideCode & RIGHT) {
                    ratio = (this._clipX - v1.data[0]) / (v2.data[0] - v1.data[0]);
                    __touch(13158);
                    v3.data[1] = v1.data[1] + (v2.data[1] - v1.data[1]) * ratio;
                    __touch(13159);
                    v3.data[0] = this._clipX;
                    __touch(13160);
                    nextCode = this._calculateOutCode(v3);
                    __touch(13161);
                    if (nextCode === INSIDE) {
                        maxX = this._clipX;
                        __touch(13162);
                        var yValue = v3.data[1];
                        __touch(13163);
                        minY = Math.min(minY, yValue);
                        __touch(13164);
                        maxY = Math.max(maxY, yValue);
                        __touch(13165);
                    }
                } else if (outsideCode & LEFT) {
                    ratio = -v1.data[0] / (v2.data[0] - v1.data[0]);
                    __touch(13166);
                    v3.data[1] = v1.data[1] + (v2.data[1] - v1.data[1]) * ratio;
                    __touch(13167);
                    v3.data[0] = 0;
                    __touch(13168);
                    nextCode = this._calculateOutCode(v3);
                    __touch(13169);
                    if (nextCode === INSIDE) {
                        minX = 0;
                        __touch(13170);
                        var yValue = v3.data[1];
                        __touch(13171);
                        minY = Math.min(minY, yValue);
                        __touch(13172);
                        maxY = Math.max(maxY, yValue);
                        __touch(13173);
                    }
                }
                var depth;
                __touch(13139);
                if (outsideCode === outcode1) {
                    outcode1 = nextCode;
                    __touch(13174);
                    depth = (1 - ratio) * v1.data[3] + ratio * v2.data[3];
                    __touch(13175);
                } else {
                    outcode2 = nextCode;
                    __touch(13176);
                    depth = (1 - ratio) * v2.data[3] + ratio * v1.data[3];
                    __touch(13177);
                }
                minDepth = Math.max(minDepth, depth);
                __touch(13140);
            }
            __touch(13135);
        }
        minMaxArray[0] = minX;
        __touch(13104);
        minMaxArray[1] = maxX;
        __touch(13105);
        minMaxArray[2] = minY;
        __touch(13106);
        minMaxArray[3] = maxY;
        __touch(13107);
        minMaxArray[4] = minDepth;
        __touch(13108);
    };
    __touch(13041);
    BoundingBoxOcclusionChecker.prototype._calculateOutCode = function (coordinate) {
        var outcode = INSIDE;
        __touch(13178);
        if (coordinate.data[0] < 0) {
            outcode |= LEFT;
            __touch(13180);
        } else if (coordinate.data[0] > this._clipX) {
            outcode |= RIGHT;
            __touch(13181);
        }
        if (coordinate.data[1] < 0) {
            outcode |= BELOW;
            __touch(13182);
        } else if (coordinate.data[1] > this._clipY) {
            outcode |= ABOVE;
            __touch(13183);
        }
        return outcode;
        __touch(13179);
    };
    __touch(13042);
    BoundingBoxOcclusionChecker.prototype._isBoundingBoxScanlineOccluded = function (minmaxArray) {
        var minX = minmaxArray[0];
        __touch(13184);
        var maxX = minmaxArray[1];
        __touch(13185);
        var minY = minmaxArray[2];
        __touch(13186);
        var maxY = minmaxArray[3];
        __touch(13187);
        var minDepth = minmaxArray[4];
        __touch(13188);
        var width = this.renderer.width;
        __touch(13189);
        for (var y = maxY; y >= minY; y--) {
            var sampleCoordinate = y * width + minX;
            __touch(13191);
            for (var x = minX; x <= maxX; x++) {
                if (this.renderer._depthData[sampleCoordinate] < minDepth) {
                    return false;
                    __touch(13193);
                }
                sampleCoordinate++;
                __touch(13192);
            }
        }
        return true;
        __touch(13190);
    };
    __touch(13043);
    BoundingBoxOcclusionChecker.prototype._projectionTransformTriangleData = function (entity, cameraViewProjectionMatrix) {
        triangleData.clear();
        __touch(13194);
        var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
        __touch(13195);
        Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix, combinedMatrix);
        __touch(13196);
        var maxPos = positionArray.length;
        __touch(13197);
        var p2, p3, p4, wComponent, div;
        __touch(13198);
        for (var p = 0; p < maxPos; p++) {
            p2 = p + 1;
            __touch(13200);
            p3 = p + 2;
            __touch(13201);
            p4 = p + 3;
            __touch(13202);
            v1.data[0] = positionArray[p];
            __touch(13203);
            v1.data[1] = positionArray[p2];
            __touch(13204);
            v1.data[2] = positionArray[p3];
            __touch(13205);
            v1.data[3] = 1;
            __touch(13206);
            combinedMatrix.applyPost(v1);
            __touch(13207);
            wComponent = v1.data[3];
            __touch(13208);
            if (wComponent < this.renderer.camera.near) {
                return false;
                __touch(13216);
            }
            div = 1 / wComponent;
            __touch(13209);
            v1.data[0] *= div;
            __touch(13210);
            v1.data[1] *= div;
            __touch(13211);
            triangleData.positions[p] = v1.data[0];
            __touch(13212);
            triangleData.positions[p2] = v1.data[1];
            __touch(13213);
            triangleData.positions[p4] = div;
            __touch(13214);
            p = p4;
            __touch(13215);
        }
        return true;
        __touch(13199);
    };
    __touch(13044);
    BoundingBoxOcclusionChecker.prototype._addVisibleTrianglesToTriangleData = function () {
        var vPos;
        __touch(13217);
        for (var i = 0; i < triangleIndices.length; i++) {
            indices = [
                triangleIndices[i],
                triangleIndices[++i],
                triangleIndices[++i]
            ];
            __touch(13218);
            vPos = indices[0] * 4;
            __touch(13219);
            v1.data[0] = triangleData.positions[vPos];
            __touch(13220);
            v1.data[1] = triangleData.positions[vPos + 1];
            __touch(13221);
            vPos = indices[1] * 4;
            __touch(13222);
            v2.data[0] = triangleData.positions[vPos];
            __touch(13223);
            v2.data[1] = triangleData.positions[vPos + 1];
            __touch(13224);
            vPos = indices[2] * 4;
            __touch(13225);
            v3.data[0] = triangleData.positions[vPos];
            __touch(13226);
            v3.data[1] = triangleData.positions[vPos + 1];
            __touch(13227);
            if (!this.renderer._isBackFacingProjected(v1, v2, v3)) {
                triangleData.addIndices(indices);
                __touch(13228);
            }
        }
    };
    __touch(13045);
    BoundingBoxOcclusionChecker.prototype._screenSpaceTransformTriangleData = function () {
        var maxPos = triangleData.positions.length;
        __touch(13229);
        for (var i = 0; i < maxPos; i += 4) {
            triangleData.positions[i] = (triangleData.positions[i] + 1) * this._halfClipX;
            __touch(13230);
            var yIndex = i + 1;
            __touch(13231);
            triangleData.positions[yIndex] = (triangleData.positions[yIndex] + 1) * this._halfClipY;
            __touch(13232);
        }
    };
    __touch(13046);
    return BoundingBoxOcclusionChecker;
    __touch(13047);
});
__touch(13018);
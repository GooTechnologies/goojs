define([
    'goo/math/Vector4',
    'goo/math/Matrix4x4',
    'goo/renderer/scanline/Edge',
    'goo/renderer/bounds/BoundingSphere',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/scanline/EdgeData',
    'goo/renderer/scanline/BoundingBoxOcclusionChecker',
    'goo/renderer/scanline/BoundingSphereOcclusionChecker',
    'goo/renderer/scanline/OccluderTriangleData',
    'goo/renderer/scanline/EdgeMap'
], function (Vector4, Matrix4x4, Edge, BoundingSphere, BoundingBox, EdgeData, BoundingBoxOcclusionChecker, BoundingSphereOcclusionChecker, OccluderTriangleData, EdgeMap) {
    'use strict';
    __touch(13591);
    var indices = new Uint8Array(4);
    __touch(13592);
    var vertexPositions = new Uint16Array(3);
    __touch(13593);
    var v1 = new Vector4(0, 0, 0, 1);
    __touch(13594);
    var v2 = new Vector4(0, 0, 0, 1);
    __touch(13595);
    var v3 = new Vector4(0, 0, 0, 1);
    __touch(13596);
    var clipVec = new Vector4(0, 0, 0, 1);
    __touch(13597);
    var globalVertices = [
        v1,
        v2,
        v3
    ];
    __touch(13598);
    var outsideIndices = new Uint8Array(3);
    __touch(13599);
    var insideIndices = new Uint8Array(3);
    __touch(13600);
    var clippedIndices = new Uint8Array(3);
    __touch(13601);
    var cameraViewProjectionMatrix = new Matrix4x4();
    __touch(13602);
    var combinedMatrix = new Matrix4x4();
    __touch(13603);
    var edgeData = new EdgeData();
    __touch(13604);
    var edges = [
        new Edge(),
        new Edge(),
        new Edge()
    ];
    __touch(13605);
    function SoftwareRenderer(parameters) {
        parameters = parameters || {};
        __touch(13636);
        this.width = parameters.width;
        __touch(13637);
        this.height = parameters.height;
        __touch(13638);
        this._clipY = this.height - 1;
        __touch(13639);
        this._clipX = this.width - 1;
        __touch(13640);
        this._halfClipX = this._clipX / 2;
        __touch(13641);
        this._halfClipY = this._clipY / 2;
        __touch(13642);
        this.camera = parameters.camera;
        __touch(13643);
        var numOfPixels = this.width * this.height;
        __touch(13644);
        var colorBytes = numOfPixels * 4 * Uint8Array.BYTES_PER_ELEMENT;
        __touch(13645);
        var depthBytes = numOfPixels * Float32Array.BYTES_PER_ELEMENT;
        __touch(13646);
        this._frameBuffer = new ArrayBuffer(colorBytes + depthBytes * 2);
        __touch(13647);
        this._colorData = new Uint8Array(this._frameBuffer, 0, numOfPixels * 4);
        __touch(13648);
        this._depthData = new Float32Array(this._frameBuffer, colorBytes, numOfPixels);
        __touch(13649);
        this._depthClear = new Float32Array(this._frameBuffer, colorBytes + depthBytes, numOfPixels);
        __touch(13650);
        for (var i = 0; i < numOfPixels; i++) {
            this._depthClear[i] = 0;
            __touch(13656);
        }
        this._triangleData = new OccluderTriangleData({
            'vertCount': parameters.maxVertCount,
            'indexCount': parameters.maxIndexCount
        });
        __touch(13651);
        this.edgeMap = new EdgeMap(parameters.maxVertCount);
        __touch(13652);
        this.boundingBoxModule = new BoundingBoxOcclusionChecker(this);
        __touch(13653);
        this.boundingSphereModule = new BoundingSphereOcclusionChecker(this);
        __touch(13654);
        clipVec.data[2] = -this.camera.near;
        __touch(13655);
    }
    __touch(13606);
    SoftwareRenderer.prototype._clearDepthData = function () {
        this._depthData.set(this._depthClear);
        __touch(13657);
    };
    __touch(13607);
    SoftwareRenderer.prototype.render = function (renderList) {
        this._clearDepthData();
        __touch(13658);
        var cameraViewMatrix = this.camera.getViewMatrix();
        __touch(13659);
        var cameraProjectionMatrix = this.camera.getProjectionMatrix();
        __touch(13660);
        var triCount;
        __touch(13661);
        for (var i = 0; i < renderList.length; i++) {
            this._setupTriangleDataForEntity(renderList[i], cameraViewMatrix, cameraProjectionMatrix);
            __touch(13662);
            this._fillEdgeMap();
            __touch(13663);
            triCount = this._triangleData.indexCount;
            __touch(13664);
            for (var tIndex = 0; tIndex < triCount; tIndex++) {
                indices[0] = this._triangleData.indices[tIndex];
                __touch(13665);
                indices[1] = this._triangleData.indices[++tIndex];
                __touch(13666);
                indices[2] = this._triangleData.indices[++tIndex];
                __touch(13667);
                this._renderTriangle(indices);
                __touch(13668);
            }
        }
    };
    __touch(13608);
    SoftwareRenderer.prototype._fillEdgeMap = function () {
        this.edgeMap.clear();
        __touch(13669);
        var indexCount = this._triangleData.indexCount;
        __touch(13670);
        for (var i = 0; i < indexCount; i++) {
            var index1 = this._triangleData.indices[i];
            __touch(13671);
            var index2 = this._triangleData.indices[++i];
            __touch(13672);
            var index3 = this._triangleData.indices[++i];
            __touch(13673);
            var vPos = index1 * 4;
            __touch(13674);
            v1.data[0] = this._triangleData.positions[vPos];
            __touch(13675);
            v1.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13676);
            v1.data[2] = this._triangleData.positions[vPos + 3];
            __touch(13677);
            vPos = index2 * 4;
            __touch(13678);
            v2.data[0] = this._triangleData.positions[vPos];
            __touch(13679);
            v2.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13680);
            v2.data[2] = this._triangleData.positions[vPos + 3];
            __touch(13681);
            vPos = index3 * 4;
            __touch(13682);
            v3.data[0] = this._triangleData.positions[vPos];
            __touch(13683);
            v3.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13684);
            v3.data[2] = this._triangleData.positions[vPos + 3];
            __touch(13685);
            this.edgeMap.addEdge(index1, index2, v1, v2);
            __touch(13686);
            this.edgeMap.addEdge(index2, index3, v2, v3);
            __touch(13687);
            this.edgeMap.addEdge(index3, index1, v3, v1);
            __touch(13688);
        }
    };
    __touch(13609);
    SoftwareRenderer.prototype.performOcclusionCulling = function (renderList) {
        var cameraViewMatrix = this.camera.getViewMatrix();
        __touch(13689);
        var cameraProjectionMatrix = this.camera.getProjectionMatrix();
        __touch(13690);
        Matrix4x4.combine(cameraProjectionMatrix, cameraViewMatrix, cameraViewProjectionMatrix);
        __touch(13691);
        var cameraNearZInWorld = -this.camera.near;
        __touch(13692);
        var visibleEntities = [];
        __touch(13693);
        for (var i = 0, _len = renderList.length; i < _len; i++) {
            var entity = renderList[i];
            __touch(13695);
            var occludeeComponent = entity.occludeeComponent;
            __touch(13696);
            if (occludeeComponent) {
                var cull = false;
                __touch(13697);
                var bound = occludeeComponent.modelBound;
                __touch(13698);
                if (bound instanceof BoundingSphere) {
                    cull = this.boundingSphereModule.occlusionCull(entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld);
                    __touch(13699);
                } else if (bound instanceof BoundingBox) {
                    cull = this.boundingBoxModule.occlusionCull(entity, cameraViewProjectionMatrix);
                    __touch(13700);
                }
                if (!cull) {
                    visibleEntities.push(entity);
                    __touch(13701);
                }
            } else {
                visibleEntities.push(entity);
                __touch(13702);
            }
        }
        return visibleEntities;
        __touch(13694);
    };
    __touch(13610);
    SoftwareRenderer.prototype._viewSpaceTransformAndCopyVertices = function (entity, cameraViewMatrix) {
        var originalPositions = entity.occluderComponent.meshData.dataViews.POSITION;
        __touch(13703);
        var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
        __touch(13704);
        Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix, combinedMatrix);
        __touch(13705);
        v1.data[3] = 1;
        __touch(13706);
        var maxPos = originalPositions.length;
        __touch(13707);
        var offset = 0;
        __touch(13708);
        for (var i = 0; i < maxPos; i++) {
            v1.data[0] = originalPositions[i];
            __touch(13710);
            i++;
            __touch(13711);
            v1.data[1] = originalPositions[i];
            __touch(13712);
            i++;
            __touch(13713);
            v1.data[2] = originalPositions[i];
            __touch(13714);
            combinedMatrix.applyPost(v1);
            __touch(13715);
            this._triangleData.positions[offset] = v1.data[0];
            __touch(13716);
            offset++;
            __touch(13717);
            this._triangleData.positions[offset] = v1.data[1];
            __touch(13718);
            offset++;
            __touch(13719);
            this._triangleData.positions[offset] = v1.data[2];
            __touch(13720);
            offset += 2;
            __touch(13721);
        }
        this._triangleData.setCountersToNewEntity(maxPos);
        __touch(13709);
    };
    __touch(13611);
    SoftwareRenderer.prototype._nearPlaneClipAndAddTriangle = function (cameraNear) {
        var outCount = this._categorizeVertices(-cameraNear);
        __touch(13722);
        var outIndex, origin, origin_x, origin_y, target, target_x, target_y, ratio;
        __touch(13723);
        switch (outCount) {
        case 0:
            this._triangleData.addIndices(indices);
            break;
        case 3:
            break;
        case 1:
            outIndex = outsideIndices[0];
            origin = globalVertices[outIndex];
            origin_x = origin.data[0];
            origin_y = origin.data[1];
            target = globalVertices[insideIndices[0]];
            ratio = this._calculateIntersectionRatio(origin, target, cameraNear);
            clipVec.data[0] = origin_x + ratio * (target.data[0] - origin_x);
            clipVec.data[1] = origin_y + ratio * (target.data[1] - origin_y);
            indices[outIndex] = this._triangleData.addVertex(clipVec.data);
            target = globalVertices[insideIndices[1]];
            ratio = this._calculateIntersectionRatio(origin, target, cameraNear);
            clipVec.data[0] = origin_x + ratio * (target.data[0] - origin_x);
            clipVec.data[1] = origin_y + ratio * (target.data[1] - origin_y);
            indices[3] = this._triangleData.addVertex(clipVec.data);
            var insideIndex1 = insideIndices[0];
            var extraIndex = indices[3];
            clippedIndices[0] = indices[outIndex];
            clippedIndices[1] = indices[insideIndex1];
            clippedIndices[2] = extraIndex;
            this._triangleData.addIndices(clippedIndices);
            clippedIndices[0] = extraIndex;
            clippedIndices[2] = indices[insideIndices[1]];
            this._triangleData.addIndices(clippedIndices);
            break;
        case 2:
            target = globalVertices[insideIndices[0]];
            target_x = target.data[0];
            target_y = target.data[1];
            outIndex = outsideIndices[0];
            origin = globalVertices[outIndex];
            origin_x = origin.data[0];
            origin_y = origin.data[1];
            ratio = this._calculateIntersectionRatio(origin, target, cameraNear);
            clipVec.data[0] = origin_x + ratio * (target_x - origin_x);
            clipVec.data[1] = origin_y + ratio * (target_y - origin_y);
            indices[outIndex] = this._triangleData.addVertex(clipVec.data);
            outIndex = outsideIndices[1];
            origin = globalVertices[outIndex];
            origin_x = origin.data[0];
            origin_y = origin.data[1];
            ratio = this._calculateIntersectionRatio(origin, target, cameraNear);
            clipVec.data[0] = origin_x + ratio * (target_x - origin_x);
            clipVec.data[1] = origin_y + ratio * (target_y - origin_y);
            indices[outIndex] = this._triangleData.addVertex(clipVec.data);
            this._triangleData.addIndices(indices);
            break;
        }
        __touch(13724);
    };
    __touch(13612);
    SoftwareRenderer.prototype._screenSpaceTransformTriangleData = function (cameraProjectionMatrix) {
        var maxPos = this._triangleData.posCount;
        __touch(13725);
        var p = 0;
        __touch(13726);
        while (p < maxPos) {
            var p1 = p++;
            __touch(13728);
            var p2 = p++;
            __touch(13729);
            var p3 = p++;
            __touch(13730);
            var p4 = p++;
            __touch(13731);
            v1.data[0] = this._triangleData.positions[p1];
            __touch(13732);
            v1.data[1] = this._triangleData.positions[p2];
            __touch(13733);
            v1.data[2] = this._triangleData.positions[p3];
            __touch(13734);
            v1.data[3] = 1;
            __touch(13735);
            cameraProjectionMatrix.applyPost(v1);
            __touch(13736);
            var homogeneousDivide = 1 / v1.data[3];
            __touch(13737);
            var divX = v1.data[0] * homogeneousDivide;
            __touch(13738);
            var divY = v1.data[1] * homogeneousDivide;
            __touch(13739);
            this._triangleData.positions[p1] = (divX + 1) * this._halfClipX;
            __touch(13740);
            this._triangleData.positions[p2] = (divY + 1) * this._halfClipY;
            __touch(13741);
            this._triangleData.positions[p4] = homogeneousDivide;
            __touch(13742);
        }
        __touch(13727);
    };
    __touch(13613);
    SoftwareRenderer.prototype._setupTriangleDataForEntity = function (entity, cameraViewMatrix, cameraProjectionMatrix) {
        this._viewSpaceTransformAndCopyVertices(entity, cameraViewMatrix);
        __touch(13743);
        var originalIndexArray = entity.occluderComponent.meshData.indexData.data;
        __touch(13744);
        var indexCount = originalIndexArray.length;
        __touch(13745);
        var cameraNear = this.camera.near;
        __touch(13746);
        for (var vertIndex = 0; vertIndex < indexCount; vertIndex++) {
            indices[0] = originalIndexArray[vertIndex];
            __touch(13748);
            indices[1] = originalIndexArray[++vertIndex];
            __touch(13749);
            indices[2] = originalIndexArray[++vertIndex];
            __touch(13750);
            vertexPositions[0] = indices[0] * 4;
            __touch(13751);
            vertexPositions[1] = indices[1] * 4;
            __touch(13752);
            vertexPositions[2] = indices[2] * 4;
            __touch(13753);
            var vPos = vertexPositions[0];
            __touch(13754);
            v1.data[0] = this._triangleData.positions[vPos];
            __touch(13755);
            v1.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13756);
            v1.data[2] = this._triangleData.positions[vPos + 2];
            __touch(13757);
            vPos = vertexPositions[1];
            __touch(13758);
            v2.data[0] = this._triangleData.positions[vPos];
            __touch(13759);
            v2.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13760);
            v2.data[2] = this._triangleData.positions[vPos + 2];
            __touch(13761);
            vPos = vertexPositions[2];
            __touch(13762);
            v3.data[0] = this._triangleData.positions[vPos];
            __touch(13763);
            v3.data[1] = this._triangleData.positions[vPos + 1];
            __touch(13764);
            v3.data[2] = this._triangleData.positions[vPos + 2];
            __touch(13765);
            if (this._isBackFacingCameraViewSpace(v1, v2, v3)) {
                continue;
                __touch(13767);
            }
            this._nearPlaneClipAndAddTriangle(cameraNear);
            __touch(13766);
        }
        this._screenSpaceTransformTriangleData(cameraProjectionMatrix);
        __touch(13747);
    };
    __touch(13614);
    SoftwareRenderer.prototype._categorizeVertices = function (cameraNear) {
        var outCount = 0;
        __touch(13768);
        var inCount = 0;
        __touch(13769);
        for (var i = 0; i < 3; i++) {
            if (globalVertices[i].data[2] <= cameraNear) {
                insideIndices[inCount] = i;
                __touch(13771);
                inCount++;
                __touch(13772);
            } else {
                outsideIndices[outCount] = i;
                __touch(13773);
                outCount++;
                __touch(13774);
            }
        }
        return outCount;
        __touch(13770);
    };
    __touch(13615);
    SoftwareRenderer.prototype._calculateIntersectionRatio = function (origin, target, near) {
        var origin_z = origin.data[2];
        __touch(13775);
        return (origin_z + near) / (origin_z - target.data[2]);
        __touch(13776);
    };
    __touch(13616);
    SoftwareRenderer.prototype._isBackFacingCameraViewSpace = function (vert1, vert2, vert3) {
        var v1_x = vert1.data[0];
        __touch(13777);
        var v1_y = vert1.data[1];
        __touch(13778);
        var v1_z = vert1.data[2];
        __touch(13779);
        var e1_x = vert2.data[0] - v1_x;
        __touch(13780);
        var e1_y = vert2.data[1] - v1_y;
        __touch(13781);
        var e1_z = vert2.data[2] - v1_z;
        __touch(13782);
        var e2_x = vert3.data[0] - v1_x;
        __touch(13783);
        var e2_y = vert3.data[1] - v1_y;
        __touch(13784);
        var e2_z = vert3.data[2] - v1_z;
        __touch(13785);
        var faceNormal_x = e2_z * e1_y - e2_y * e1_z;
        __touch(13786);
        var faceNormal_y = e2_x * e1_z - e2_z * e1_x;
        __touch(13787);
        var faceNormal_z = e2_y * e1_x - e2_x * e1_y;
        __touch(13788);
        var dot = faceNormal_x * v1_x + faceNormal_y * v1_y + faceNormal_z * v1_z;
        __touch(13789);
        return dot > 0;
        __touch(13790);
    };
    __touch(13617);
    SoftwareRenderer.prototype._isBackFacingProjected = function (v1, v2, v3) {
        var v1_x = v1.data[0];
        __touch(13791);
        var v1_y = v1.data[1];
        __touch(13792);
        var e1X = v2.data[0] - v1_x;
        __touch(13793);
        var e1Y = v2.data[1] - v1_y;
        __touch(13794);
        var e2X = v3.data[0] - v1_x;
        __touch(13795);
        var e2Y = v3.data[1] - v1_y;
        __touch(13796);
        var faceNormalZ = e2Y * e1X - e2X * e1Y;
        __touch(13797);
        return faceNormalZ < 0;
        __touch(13798);
    };
    __touch(13618);
    SoftwareRenderer.prototype._createOccludeeEdges = function (indices, positions) {
        var vPos = indices[0] * 4;
        __touch(13799);
        v1.data[0] = positions[vPos];
        __touch(13800);
        v1.data[1] = positions[vPos + 1];
        __touch(13801);
        v1.data[2] = positions[vPos + 3];
        __touch(13802);
        vPos = indices[1] * 4;
        __touch(13803);
        v2.data[0] = positions[vPos];
        __touch(13804);
        v2.data[1] = positions[vPos + 1];
        __touch(13805);
        v2.data[2] = positions[vPos + 3];
        __touch(13806);
        vPos = indices[2] * 4;
        __touch(13807);
        v3.data[0] = positions[vPos];
        __touch(13808);
        v3.data[1] = positions[vPos + 1];
        __touch(13809);
        v3.data[2] = positions[vPos + 3];
        __touch(13810);
        edges[0].setData(v1, v2);
        __touch(13811);
        edges[1].setData(v2, v3);
        __touch(13812);
        edges[2].setData(v3, v1);
        __touch(13813);
        edges[0].roundOccludeeCoordinates();
        __touch(13814);
        edges[1].roundOccludeeCoordinates();
        __touch(13815);
        edges[2].roundOccludeeCoordinates();
        __touch(13816);
        edges[0].computeDerivedData();
        __touch(13817);
        edges[1].computeDerivedData();
        __touch(13818);
        edges[2].computeDerivedData();
        __touch(13819);
    };
    __touch(13619);
    SoftwareRenderer.prototype._getLongEdgeAndShortEdgeIndices = function () {
        var maxHeight = edges[0].dy;
        __touch(13820);
        var longEdge = 0;
        __touch(13821);
        for (var i = 1; i < 3; i++) {
            var height = edges[i].dy;
            __touch(13825);
            if (height > maxHeight) {
                maxHeight = height;
                __touch(13826);
                longEdge = i;
                __touch(13827);
            }
        }
        var shortEdge1 = (longEdge + 1) % 3;
        __touch(13822);
        var shortEdge2 = (longEdge + 2) % 3;
        __touch(13823);
        return [
            longEdge,
            shortEdge1,
            shortEdge2
        ];
        __touch(13824);
    };
    __touch(13620);
    SoftwareRenderer.prototype._calculateOrientationData = function (shortEdge, longEdge) {
        var shortX = edgeData.getShortX();
        __touch(13828);
        var longX = edgeData.getLongX();
        __touch(13829);
        return [
            longX > shortX,
            longEdge.z1 < shortEdge.z0
        ];
        __touch(13830);
    };
    __touch(13621);
    SoftwareRenderer.prototype.isRenderedTriangleOccluded = function (indices, positions) {
        this._createOccludeeEdges(indices, positions);
        __touch(13831);
        var edgeIndices = this._getLongEdgeAndShortEdgeIndices();
        __touch(13832);
        var longEdge = edges[edgeIndices[0]];
        __touch(13833);
        var s1 = edgeIndices[1];
        __touch(13834);
        var s2 = edgeIndices[2];
        __touch(13835);
        if (this._verticalLongEdgeCull(longEdge)) {
            console.log('renderingocclusion : vertical cull');
            __touch(13840);
            return true;
            __touch(13841);
        }
        var shortEdge = edges[s1];
        __touch(13836);
        var orientationData = null;
        __touch(13837);
        if (this._createEdgeData(longEdge, shortEdge)) {
            orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);
            __touch(13842);
            if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
                console.log('renderingocclusion : horizontal cull');
                __touch(13843);
                return true;
                __touch(13844);
            }
            if (!this._isEdgeOccluded(edgeData, orientationData)) {
                return false;
                __touch(13845);
            }
        }
        shortEdge = edges[s2];
        __touch(13838);
        if (this._createEdgeData(longEdge, shortEdge)) {
            if (orientationData === null) {
                orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);
                __touch(13846);
                if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
                    console.log('renderingocclusion : horizontal cull');
                    __touch(13847);
                    return true;
                    __touch(13848);
                }
            }
            if (!this._isEdgeOccluded(edgeData, orientationData)) {
                return false;
                __touch(13849);
            }
        }
        return true;
        __touch(13839);
    };
    __touch(13622);
    SoftwareRenderer.prototype._renderTriangle = function (indices) {
        var i1 = indices[0];
        __touch(13850);
        var i2 = indices[1];
        __touch(13851);
        var i3 = indices[2];
        __touch(13852);
        edges[0] = this.edgeMap.getEdge(i1, i2);
        __touch(13853);
        edges[1] = this.edgeMap.getEdge(i2, i3);
        __touch(13854);
        edges[2] = this.edgeMap.getEdge(i3, i1);
        __touch(13855);
        var edgeIndices = this._getLongEdgeAndShortEdgeIndices();
        __touch(13856);
        var longEdge = edges[edgeIndices[0]];
        __touch(13857);
        var s1 = edgeIndices[1];
        __touch(13858);
        var s2 = edgeIndices[2];
        __touch(13859);
        if (this._verticalLongEdgeCull(longEdge)) {
            return;
            __touch(13865);
        }
        var shortEdge = edges[s1];
        __touch(13860);
        var betweenFaces = [
            longEdge.betweenFaces,
            shortEdge.betweenFaces
        ];
        __touch(13861);
        var orientationData = null;
        __touch(13862);
        if (this._createEdgeData(longEdge, shortEdge)) {
            orientationData = this._calculateOrientationData(shortEdge, longEdge);
            __touch(13866);
            if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
                return;
                __touch(13868);
            }
            this._drawEdges(edgeData, orientationData, betweenFaces);
            __touch(13867);
        }
        shortEdge = edges[s2];
        __touch(13863);
        betweenFaces = [
            longEdge.betweenFaces,
            shortEdge.betweenFaces
        ];
        __touch(13864);
        if (this._createEdgeData(longEdge, shortEdge)) {
            orientationData = this._calculateOrientationData(shortEdge, longEdge);
            __touch(13869);
            if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
                return;
                __touch(13871);
            }
            this._drawEdges(edgeData, orientationData, betweenFaces);
            __touch(13870);
        }
    };
    __touch(13623);
    SoftwareRenderer.prototype._verticalLongEdgeCull = function (longEdge) {
        return longEdge.y1 < 0 || longEdge.y0 > this._clipY;
        __touch(13872);
    };
    __touch(13624);
    SoftwareRenderer.prototype._horizontalLongEdgeCull = function (longEdge, orientationData) {
        if (orientationData[0]) {
            return longEdge.x1 < 0 && longEdge.x0 < 0;
            __touch(13873);
        } else {
            return longEdge.x1 > this._clipX && longEdge.x0 > this._clipX;
            __touch(13874);
        }
    };
    __touch(13625);
    SoftwareRenderer.prototype._isEdgeOccluded = function (edgeData, orientationData) {
        var startLine = edgeData.getStartLine();
        __touch(13875);
        var stopLine = edgeData.getStopLine();
        __touch(13876);
        var longXInc = edgeData.getLongXIncrement();
        __touch(13877);
        var shortXInc = edgeData.getShortXIncrement();
        __touch(13878);
        var longZInc = edgeData.getLongZIncrement();
        __touch(13879);
        var shortZInc = edgeData.getShortZIncrement();
        __touch(13880);
        var realLeftX, realRightX, leftZ, rightZ, leftX, rightX, dif, y, t;
        __touch(13881);
        if (orientationData[0]) {
            if (orientationData[1]) {
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getShortX();
                    __touch(13883);
                    realRightX = edgeData.getLongX();
                    __touch(13884);
                    leftX = Math.floor(realLeftX);
                    __touch(13885);
                    rightX = Math.ceil(realRightX);
                    __touch(13886);
                    leftZ = edgeData.getShortZ();
                    __touch(13887);
                    rightZ = edgeData.getLongZ();
                    __touch(13888);
                    dif = rightX - leftX;
                    __touch(13889);
                    t = 0.5 / (dif + 1);
                    __touch(13890);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(13891);
                    if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
                        return false;
                        __touch(13896);
                    }
                    edgeData.floatData[0] += longXInc;
                    __touch(13892);
                    edgeData.floatData[1] += shortXInc;
                    __touch(13893);
                    edgeData.floatData[2] += longZInc;
                    __touch(13894);
                    edgeData.floatData[3] += shortZInc;
                    __touch(13895);
                }
            } else {
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getShortX();
                    __touch(13897);
                    realRightX = edgeData.getLongX();
                    __touch(13898);
                    leftX = Math.floor(realLeftX);
                    __touch(13899);
                    rightX = Math.ceil(realRightX);
                    __touch(13900);
                    leftZ = edgeData.getShortZ();
                    __touch(13901);
                    rightZ = edgeData.getLongZ();
                    __touch(13902);
                    dif = rightX - leftX;
                    __touch(13903);
                    t = 0.5 / (dif + 1);
                    __touch(13904);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(13905);
                    if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
                        return false;
                        __touch(13910);
                    }
                    edgeData.floatData[0] += longXInc;
                    __touch(13906);
                    edgeData.floatData[1] += shortXInc;
                    __touch(13907);
                    edgeData.floatData[2] += longZInc;
                    __touch(13908);
                    edgeData.floatData[3] += shortZInc;
                    __touch(13909);
                }
            }
        } else {
            if (orientationData[1]) {
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getLongX();
                    __touch(13911);
                    realRightX = edgeData.getShortX();
                    __touch(13912);
                    leftX = Math.floor(realLeftX);
                    __touch(13913);
                    rightX = Math.ceil(realRightX);
                    __touch(13914);
                    leftZ = edgeData.getLongZ();
                    __touch(13915);
                    rightZ = edgeData.getShortZ();
                    __touch(13916);
                    dif = rightX - leftX;
                    __touch(13917);
                    t = 0.5 / (dif + 1);
                    __touch(13918);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(13919);
                    if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
                        return false;
                        __touch(13924);
                    }
                    edgeData.floatData[0] += longXInc;
                    __touch(13920);
                    edgeData.floatData[1] += shortXInc;
                    __touch(13921);
                    edgeData.floatData[2] += longZInc;
                    __touch(13922);
                    edgeData.floatData[3] += shortZInc;
                    __touch(13923);
                }
            } else {
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getLongX();
                    __touch(13925);
                    realRightX = edgeData.getShortX();
                    __touch(13926);
                    leftX = Math.floor(realLeftX);
                    __touch(13927);
                    rightX = Math.ceil(realRightX);
                    __touch(13928);
                    leftZ = edgeData.getLongZ();
                    __touch(13929);
                    rightZ = edgeData.getShortZ();
                    __touch(13930);
                    dif = rightX - leftX;
                    __touch(13931);
                    t = 0.5 / (dif + 1);
                    __touch(13932);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(13933);
                    if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
                        return false;
                        __touch(13938);
                    }
                    edgeData.floatData[0] += longXInc;
                    __touch(13934);
                    edgeData.floatData[1] += shortXInc;
                    __touch(13935);
                    edgeData.floatData[2] += longZInc;
                    __touch(13936);
                    edgeData.floatData[3] += shortZInc;
                    __touch(13937);
                }
            }
        }
        return true;
        __touch(13882);
    };
    __touch(13626);
    SoftwareRenderer.prototype._drawEdges = function (edgeData, orientationData, betweenFaces) {
        var startLine = edgeData.getStartLine();
        __touch(13939);
        var stopLine = edgeData.getStopLine();
        __touch(13940);
        var longXInc = edgeData.getLongXIncrement();
        __touch(13941);
        var shortXInc = edgeData.getShortXIncrement();
        __touch(13942);
        var longZInc = edgeData.getLongZIncrement();
        __touch(13943);
        var shortZInc = edgeData.getShortZIncrement();
        __touch(13944);
        var longEdgeBetween = betweenFaces[0];
        __touch(13945);
        var shortEdgeBetween = betweenFaces[1];
        __touch(13946);
        var realLeftX, realRightX, leftZ, rightZ, leftX, rightX, conservativeLeft, conservativeRight, leftIncrement, rightIncrement, rightEdgeShared;
        __touch(13947);
        var y, offset, spanLength, t;
        __touch(13948);
        var shrinkage = 0.5;
        __touch(13949);
        var rightShrink = shrinkage;
        __touch(13950);
        var fillconstant = 0.5;
        __touch(13951);
        if (orientationData[0]) {
            if (orientationData[1]) {
                rightEdgeShared = longEdgeBetween;
                __touch(13952);
                realLeftX = edgeData.getShortX();
                __touch(13953);
                realRightX = edgeData.getLongX();
                __touch(13954);
                leftZ = edgeData.getShortZ();
                __touch(13955);
                rightZ = edgeData.getLongZ();
                __touch(13956);
                leftIncrement = shortXInc;
                __touch(13957);
                rightIncrement = longXInc;
                __touch(13958);
                conservativeLeft = realLeftX + Math.abs(0.5 * leftIncrement);
                __touch(13959);
                if (rightEdgeShared) {
                    conservativeRight = realRightX + Math.abs(fillconstant * rightIncrement);
                    __touch(13970);
                    rightShrink = -shrinkage;
                    __touch(13971);
                } else {
                    conservativeRight = realRightX - Math.abs(0.5 * rightIncrement);
                    __touch(13972);
                }
                leftX = conservativeLeft + shrinkage;
                __touch(13960);
                rightX = conservativeRight - rightShrink;
                __touch(13961);
                edgeData.setLongX(rightX + rightIncrement);
                __touch(13962);
                edgeData.setShortX(leftX + leftIncrement);
                __touch(13963);
                leftX = Math.ceil(leftX);
                __touch(13964);
                rightX = Math.floor(rightX);
                __touch(13965);
                edgeData.floatData[3] += shortZInc;
                __touch(13966);
                edgeData.floatData[2] += longZInc;
                __touch(13967);
                this._fillPixels(leftX, rightX, startLine, leftZ, rightZ);
                __touch(13968);
                startLine++;
                __touch(13969);
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getShortX();
                    __touch(13973);
                    realRightX = edgeData.getLongX();
                    __touch(13974);
                    leftZ = edgeData.getShortZ();
                    __touch(13975);
                    rightZ = edgeData.getLongZ();
                    __touch(13976);
                    leftX = Math.ceil(realLeftX);
                    __touch(13977);
                    rightX = Math.floor(realRightX);
                    __touch(13978);
                    offset = leftX - realLeftX;
                    __touch(13979);
                    spanLength = realRightX - realLeftX;
                    __touch(13980);
                    t = offset / spanLength;
                    __touch(13981);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(13982);
                    spanLength = rightX - leftX + 1;
                    __touch(13983);
                    t = 0.5 / spanLength;
                    __touch(13984);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(13985);
                    this._fillPixels(leftX, rightX, y, leftZ, rightZ);
                    __touch(13986);
                    edgeData.floatData[0] += longXInc;
                    __touch(13987);
                    edgeData.floatData[1] += shortXInc;
                    __touch(13988);
                    edgeData.floatData[2] += longZInc;
                    __touch(13989);
                    edgeData.floatData[3] += shortZInc;
                    __touch(13990);
                }
            } else {
                rightEdgeShared = longEdgeBetween;
                __touch(13991);
                realLeftX = edgeData.getShortX();
                __touch(13992);
                realRightX = edgeData.getLongX();
                __touch(13993);
                leftZ = edgeData.getShortZ();
                __touch(13994);
                rightZ = edgeData.getLongZ();
                __touch(13995);
                leftIncrement = shortXInc;
                __touch(13996);
                rightIncrement = longXInc;
                __touch(13997);
                conservativeLeft = realLeftX + Math.abs(0.5 * leftIncrement);
                __touch(13998);
                if (rightEdgeShared) {
                    conservativeRight = realRightX + Math.abs(fillconstant * rightIncrement);
                    __touch(14009);
                    rightShrink = -shrinkage;
                    __touch(14010);
                } else {
                    conservativeRight = realRightX - Math.abs(0.5 * rightIncrement);
                    __touch(14011);
                }
                leftX = conservativeLeft + shrinkage;
                __touch(13999);
                rightX = conservativeRight - rightShrink;
                __touch(14000);
                edgeData.setLongX(rightX + rightIncrement);
                __touch(14001);
                edgeData.setShortX(leftX + leftIncrement);
                __touch(14002);
                leftX = Math.ceil(leftX);
                __touch(14003);
                rightX = Math.floor(rightX);
                __touch(14004);
                edgeData.floatData[3] += shortZInc;
                __touch(14005);
                edgeData.floatData[2] += longZInc;
                __touch(14006);
                this._fillPixels(leftX, rightX, startLine, leftZ, rightZ);
                __touch(14007);
                startLine++;
                __touch(14008);
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getShortX();
                    __touch(14012);
                    realRightX = edgeData.getLongX();
                    __touch(14013);
                    leftZ = edgeData.getShortZ();
                    __touch(14014);
                    rightZ = edgeData.getLongZ();
                    __touch(14015);
                    leftX = Math.ceil(realLeftX);
                    __touch(14016);
                    rightX = Math.floor(realRightX);
                    __touch(14017);
                    offset = realRightX - rightX;
                    __touch(14018);
                    spanLength = realRightX - realLeftX;
                    __touch(14019);
                    t = offset / spanLength;
                    __touch(14020);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(14021);
                    spanLength = rightX - leftX + 1;
                    __touch(14022);
                    t = 0.5 / spanLength;
                    __touch(14023);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(14024);
                    this._fillPixels(leftX, rightX, y, leftZ, rightZ);
                    __touch(14025);
                    edgeData.floatData[0] += longXInc;
                    __touch(14026);
                    edgeData.floatData[1] += shortXInc;
                    __touch(14027);
                    edgeData.floatData[2] += longZInc;
                    __touch(14028);
                    edgeData.floatData[3] += shortZInc;
                    __touch(14029);
                }
            }
        } else {
            if (orientationData[1]) {
                rightEdgeShared = shortEdgeBetween;
                __touch(14030);
                realLeftX = edgeData.getLongX();
                __touch(14031);
                realRightX = edgeData.getShortX();
                __touch(14032);
                leftZ = edgeData.getLongZ();
                __touch(14033);
                rightZ = edgeData.getShortZ();
                __touch(14034);
                leftIncrement = longXInc;
                __touch(14035);
                rightIncrement = shortXInc;
                __touch(14036);
                conservativeLeft = realLeftX + Math.abs(0.5 * leftIncrement);
                __touch(14037);
                if (rightEdgeShared) {
                    conservativeRight = realRightX + Math.abs(fillconstant * rightIncrement);
                    __touch(14048);
                    rightShrink = -shrinkage;
                    __touch(14049);
                } else {
                    conservativeRight = realRightX - Math.abs(0.5 * rightIncrement);
                    __touch(14050);
                }
                leftX = conservativeLeft + shrinkage;
                __touch(14038);
                rightX = conservativeRight - rightShrink;
                __touch(14039);
                edgeData.setShortX(rightX + rightIncrement);
                __touch(14040);
                edgeData.setLongX(leftX + leftIncrement);
                __touch(14041);
                leftX = Math.ceil(leftX);
                __touch(14042);
                rightX = Math.floor(rightX);
                __touch(14043);
                edgeData.floatData[2] += shortZInc;
                __touch(14044);
                edgeData.floatData[3] += longZInc;
                __touch(14045);
                this._fillPixels(leftX, rightX, startLine, leftZ, rightZ);
                __touch(14046);
                startLine++;
                __touch(14047);
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getLongX();
                    __touch(14051);
                    realRightX = edgeData.getShortX();
                    __touch(14052);
                    leftZ = edgeData.getLongZ();
                    __touch(14053);
                    rightZ = edgeData.getShortZ();
                    __touch(14054);
                    leftX = Math.ceil(realLeftX);
                    __touch(14055);
                    rightX = Math.floor(realRightX);
                    __touch(14056);
                    offset = leftX - realLeftX;
                    __touch(14057);
                    spanLength = realRightX - realLeftX;
                    __touch(14058);
                    t = offset / spanLength;
                    __touch(14059);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(14060);
                    spanLength = rightX - leftX + 1;
                    __touch(14061);
                    t = 0.5 / spanLength;
                    __touch(14062);
                    leftZ = (1 - t) * leftZ + t * rightZ;
                    __touch(14063);
                    this._fillPixels(leftX, rightX, y, leftZ, rightZ);
                    __touch(14064);
                    edgeData.floatData[0] += longXInc;
                    __touch(14065);
                    edgeData.floatData[1] += shortXInc;
                    __touch(14066);
                    edgeData.floatData[2] += longZInc;
                    __touch(14067);
                    edgeData.floatData[3] += shortZInc;
                    __touch(14068);
                }
            } else {
                rightEdgeShared = shortEdgeBetween;
                __touch(14069);
                realLeftX = edgeData.getLongX();
                __touch(14070);
                realRightX = edgeData.getShortX();
                __touch(14071);
                leftZ = edgeData.getLongZ();
                __touch(14072);
                rightZ = edgeData.getShortZ();
                __touch(14073);
                leftIncrement = longXInc;
                __touch(14074);
                rightIncrement = shortXInc;
                __touch(14075);
                conservativeLeft = realLeftX + Math.abs(0.5 * leftIncrement);
                __touch(14076);
                if (rightEdgeShared) {
                    conservativeRight = realRightX + Math.abs(fillconstant * rightIncrement);
                    __touch(14087);
                    rightShrink = -shrinkage;
                    __touch(14088);
                } else {
                    conservativeRight = realRightX - Math.abs(0.5 * rightIncrement);
                    __touch(14089);
                }
                leftX = conservativeLeft + shrinkage;
                __touch(14077);
                rightX = conservativeRight - rightShrink;
                __touch(14078);
                edgeData.setShortX(rightX + rightIncrement);
                __touch(14079);
                edgeData.setLongX(leftX + leftIncrement);
                __touch(14080);
                leftX = Math.ceil(leftX);
                __touch(14081);
                rightX = Math.floor(rightX);
                __touch(14082);
                edgeData.floatData[2] += shortZInc;
                __touch(14083);
                edgeData.floatData[3] += longZInc;
                __touch(14084);
                this._fillPixels(leftX, rightX, startLine, leftZ, rightZ);
                __touch(14085);
                startLine++;
                __touch(14086);
                for (y = startLine; y <= stopLine; y++) {
                    realLeftX = edgeData.getLongX();
                    __touch(14090);
                    realRightX = edgeData.getShortX();
                    __touch(14091);
                    leftZ = edgeData.getLongZ();
                    __touch(14092);
                    rightZ = edgeData.getShortZ();
                    __touch(14093);
                    leftX = Math.ceil(realLeftX);
                    __touch(14094);
                    rightX = Math.floor(realRightX);
                    __touch(14095);
                    offset = realRightX - rightX;
                    __touch(14096);
                    spanLength = realRightX - realLeftX;
                    __touch(14097);
                    t = offset / spanLength;
                    __touch(14098);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(14099);
                    spanLength = rightX - leftX + 1;
                    __touch(14100);
                    t = 0.5 / spanLength;
                    __touch(14101);
                    rightZ = (1 - t) * rightZ + t * leftZ;
                    __touch(14102);
                    this._fillPixels(leftX, rightX, y, leftZ, rightZ);
                    __touch(14103);
                    edgeData.floatData[0] += longXInc;
                    __touch(14104);
                    edgeData.floatData[1] += shortXInc;
                    __touch(14105);
                    edgeData.floatData[2] += longZInc;
                    __touch(14106);
                    edgeData.floatData[3] += shortZInc;
                    __touch(14107);
                }
            }
        }
    };
    __touch(13627);
    SoftwareRenderer.prototype._createEdgeData = function (longEdge, shortEdge) {
        var startLine = Math.ceil(shortEdge.y0);
        __touch(14108);
        var stopLine = Math.floor(shortEdge.y1);
        __touch(14109);
        var longEdgeZincrement = longEdge.zIncrement;
        __touch(14110);
        var shortEdgeZincrement = shortEdge.zIncrement;
        __touch(14111);
        var shortEdgeXincrement = shortEdge.xIncrement;
        __touch(14112);
        var longEdgeXincrement = longEdge.xIncrement;
        __touch(14113);
        if (startLine > stopLine) {
            return false;
            __touch(14127);
        } else if (startLine === stopLine) {
            if (shortEdge.betweenFaces) {
                shortEdgeXincrement = 0;
                __touch(14128);
                longEdgeXincrement = 0;
                __touch(14129);
            } else {
                return false;
                __touch(14130);
            }
        }
        var longStartCoeff = (shortEdge.y0 - longEdge.y0) / longEdge.dy;
        __touch(14114);
        var longX = longEdge.x0 + longEdge.dx * longStartCoeff;
        __touch(14115);
        var longZ = longEdge.z0 + longEdge.dz * longStartCoeff;
        __touch(14116);
        var shortX = shortEdge.x0;
        __touch(14117);
        var shortZ = shortEdge.z0;
        __touch(14118);
        var offset = startLine - shortEdge.y0;
        __touch(14119);
        longX += offset * longEdgeXincrement;
        __touch(14120);
        shortX += offset * shortEdgeXincrement;
        __touch(14121);
        longZ += offset * longEdgeZincrement;
        __touch(14122);
        shortZ += offset * shortEdgeZincrement;
        __touch(14123);
        if (startLine < 0) {
            longX += -startLine * longEdgeXincrement;
            __touch(14131);
            shortX += -startLine * shortEdgeXincrement;
            __touch(14132);
            longZ += -startLine * longEdgeZincrement;
            __touch(14133);
            shortZ += -startLine * shortEdgeZincrement;
            __touch(14134);
            startLine = 0;
            __touch(14135);
        }
        stopLine = Math.min(this._clipY, stopLine);
        __touch(14124);
        edgeData.setData([
            startLine,
            stopLine,
            longX,
            shortX,
            longZ,
            shortZ,
            longEdgeXincrement,
            shortEdgeXincrement,
            longEdgeZincrement,
            shortEdgeZincrement
        ]);
        __touch(14125);
        return true;
        __touch(14126);
    };
    __touch(13628);
    SoftwareRenderer.prototype._isScanlineOccluded = function (leftX, rightX, y, leftZ, rightZ) {
        if (rightX < leftX || rightX < 0 || leftX > this._clipX) {
            return true;
            __touch(14142);
        }
        var t;
        __touch(14136);
        if (leftX < 0) {
            t = -leftX / (rightX - leftX + 1);
            __touch(14143);
            leftZ = (1 - t) * leftZ + t * rightZ;
            __touch(14144);
            leftX = 0;
            __touch(14145);
        }
        var diff = rightX - this._clipX + 1;
        __touch(14137);
        if (diff > 0) {
            t = diff / (rightX - leftX + 1);
            __touch(14146);
            rightZ = (1 - t) * rightZ + t * leftZ;
            __touch(14147);
            rightX = this._clipX;
            __touch(14148);
        }
        var index = y * this.width + leftX;
        __touch(14138);
        var depth = leftZ;
        __touch(14139);
        var depthIncrement = (rightZ - leftZ) / (rightX - leftX);
        __touch(14140);
        for (var i = leftX; i <= rightX; i++) {
            this._colorData.set([
                Math.min(depth * 255 + 50, 255),
                0,
                0
            ], index * 4);
            __touch(14149);
            if (depth > this._depthData[index]) {
                return false;
                __touch(14152);
            }
            index++;
            __touch(14150);
            depth += depthIncrement;
            __touch(14151);
        }
        return true;
        __touch(14141);
    };
    __touch(13629);
    SoftwareRenderer.prototype._fillPixels = function (leftX, rightX, y, leftZ, rightZ) {
        if (rightX < 0 || leftX > this._clipX || rightX < leftX) {
            return;
            __touch(14158);
        }
        var t;
        __touch(14153);
        if (leftX < 0) {
            t = -leftX / (rightX - leftX + 1);
            __touch(14159);
            leftZ = (1 - t) * leftZ + t * rightZ;
            __touch(14160);
            leftX = 0;
            __touch(14161);
        }
        var diff = rightX - this._clipX + 1;
        __touch(14154);
        if (diff > 0) {
            t = diff / (rightX - leftX + 1);
            __touch(14162);
            rightZ = (1 - t) * rightZ + t * leftZ;
            __touch(14163);
            rightX = this._clipX;
            __touch(14164);
        }
        var index = y * this.width + leftX;
        __touch(14155);
        var depth = leftZ;
        __touch(14156);
        var depthIncrement = (rightZ - leftZ) / (rightX - leftX);
        __touch(14157);
        for (var i = leftX; i <= rightX; i++) {
            if (depth > this._depthData[index]) {
                this._depthData[index] = depth;
                __touch(14167);
            }
            index++;
            __touch(14165);
            depth += depthIncrement;
            __touch(14166);
        }
    };
    __touch(13630);
    SoftwareRenderer.prototype.copyDepthToColor = function () {
        var colorIndex = 0;
        __touch(14168);
        for (var i = 0; i < this._depthData.length; i++) {
            var depth = this._depthData[i];
            __touch(14169);
            if (depth > 0) {
                depth *= 255;
                __touch(14171);
                this._colorData[colorIndex] = depth;
                __touch(14172);
                this._colorData[++colorIndex] = depth;
                __touch(14173);
                this._colorData[++colorIndex] = depth;
                __touch(14174);
                this._colorData[++colorIndex] = 255;
                __touch(14175);
            } else {
                this._colorData[colorIndex] = 0;
                __touch(14176);
                this._colorData[++colorIndex] = 0;
                __touch(14177);
                this._colorData[++colorIndex] = 0;
                __touch(14178);
                this._colorData[++colorIndex] = 0;
                __touch(14179);
            }
            colorIndex++;
            __touch(14170);
        }
    };
    __touch(13631);
    SoftwareRenderer.prototype.getColorData = function () {
        return this._colorData;
        __touch(14180);
    };
    __touch(13632);
    SoftwareRenderer.prototype.getDepthData = function () {
        return this._depthData;
        __touch(14181);
    };
    __touch(13633);
    SoftwareRenderer.prototype.calculateDifference = function (webGLColorData, clearColor) {
        for (var i = 0; i < this._depthData.length; i++) {
            var depthvalue = this._depthData[i];
            __touch(14182);
            var colorIndex = 4 * i;
            __touch(14183);
            var R = webGLColorData[colorIndex];
            __touch(14184);
            var G = webGLColorData[colorIndex + 1];
            __touch(14185);
            var B = webGLColorData[colorIndex + 2];
            __touch(14186);
            var A = webGLColorData[colorIndex + 3];
            __touch(14187);
            if (depthvalue > 0 && !(R > clearColor[0] * 256 || G > clearColor[1] * 256 || B > clearColor[2] * 256 || A > clearColor[3] * 256)) {
                this._colorData[colorIndex] = 255;
                __touch(14188);
                this._colorData[colorIndex + 1] = 0;
                __touch(14189);
                this._colorData[colorIndex + 2] = 0;
                __touch(14190);
                this._colorData[colorIndex + 3] = 255;
                __touch(14191);
            }
        }
    };
    __touch(13634);
    return SoftwareRenderer;
    __touch(13635);
});
__touch(13590);
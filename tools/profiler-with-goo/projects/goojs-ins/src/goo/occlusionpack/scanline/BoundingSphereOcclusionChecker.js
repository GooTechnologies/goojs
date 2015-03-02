define([
    'goo/math/Matrix4x4',
    'goo/math/Vector4'
], function (Matrix4x4, Vector4) {
    'use strict';
    __touch(13234);
    var tempVec = new Vector4(0, 0, 0, 1);
    __touch(13235);
    var combinedMatrix = new Matrix4x4();
    __touch(13236);
    var positionArray = new Float32Array(20);
    __touch(13237);
    var green = [
        0,
        255,
        0
    ];
    __touch(13238);
    var cyan = [
        0,
        190,
        190
    ];
    __touch(13239);
    function BoundingSphereOcclusionChecker(renderer) {
        this.renderer = renderer;
        __touch(13247);
        this._clipY = renderer.height - 1;
        __touch(13248);
        this._clipX = renderer.width - 1;
        __touch(13249);
        this._halfClipX = this._clipX / 2;
        __touch(13250);
        this._halfClipY = this._clipY / 2;
        __touch(13251);
    }
    __touch(13240);
    BoundingSphereOcclusionChecker.prototype.occlusionCull = function (entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld) {
        var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
        __touch(13252);
        Matrix4x4.combine(cameraViewMatrix, entityWorldTransformMatrix, combinedMatrix);
        __touch(13253);
        var boundingSphere = entity.meshDataComponent.modelBound;
        __touch(13254);
        tempVec.data[0] = 0;
        __touch(13255);
        tempVec.data[1] = 0;
        __touch(13256);
        tempVec.data[2] = 0;
        __touch(13257);
        tempVec.data[3] = 1;
        __touch(13258);
        combinedMatrix.applyPost(tempVec);
        __touch(13259);
        var scale = entity.transformComponent.transform.scale;
        __touch(13260);
        var radius = scale.maxAxis() * boundingSphere.radius;
        __touch(13261);
        var origin_x = tempVec.data[0];
        __touch(13262);
        var origin_y = tempVec.data[1];
        __touch(13263);
        var origin_z = tempVec.data[2];
        __touch(13264);
        var cameraToSphereDistance = Math.sqrt(origin_x * origin_x + origin_y * origin_y + origin_z * origin_z);
        __touch(13265);
        if (cameraToSphereDistance <= radius) {
            return false;
            __touch(13286);
        }
        var compensatedRadius = cameraToSphereDistance * Math.tan(Math.asin(radius / cameraToSphereDistance));
        __touch(13266);
        var nearCut = origin_z + compensatedRadius;
        __touch(13267);
        if (nearCut > cameraNearZInWorld) {
            return false;
            __touch(13287);
        }
        positionArray[0] = origin_x;
        __touch(13268);
        positionArray[1] = origin_y;
        __touch(13269);
        positionArray[2] = nearCut;
        __touch(13270);
        positionArray[4] = origin_x - compensatedRadius;
        __touch(13271);
        positionArray[5] = origin_y;
        __touch(13272);
        positionArray[6] = origin_z;
        __touch(13273);
        positionArray[8] = origin_x + compensatedRadius;
        __touch(13274);
        positionArray[9] = origin_y;
        __touch(13275);
        positionArray[10] = origin_z;
        __touch(13276);
        positionArray[12] = origin_x;
        __touch(13277);
        positionArray[13] = origin_y + compensatedRadius;
        __touch(13278);
        positionArray[14] = origin_z;
        __touch(13279);
        positionArray[16] = origin_x;
        __touch(13280);
        positionArray[17] = origin_y - compensatedRadius;
        __touch(13281);
        positionArray[18] = origin_z;
        __touch(13282);
        var i = 0;
        __touch(13283);
        while (i < 20) {
            var i1 = i++;
            __touch(13288);
            var i2 = i++;
            __touch(13289);
            var i3 = i++;
            __touch(13290);
            var i4 = i++;
            __touch(13291);
            tempVec.data[0] = positionArray[i1];
            __touch(13292);
            tempVec.data[1] = positionArray[i2];
            __touch(13293);
            tempVec.data[2] = positionArray[i3];
            __touch(13294);
            tempVec.data[3] = 1;
            __touch(13295);
            cameraProjectionMatrix.applyPost(tempVec);
            __touch(13296);
            var div = 1 / tempVec.data[3];
            __touch(13297);
            tempVec.data[0] *= div;
            __touch(13298);
            tempVec.data[1] *= div;
            __touch(13299);
            positionArray[i1] = (tempVec.data[0] + 1) * this._halfClipX;
            __touch(13300);
            positionArray[i2] = (tempVec.data[1] + 1) * this._halfClipY;
            __touch(13301);
            positionArray[i4] = div;
            __touch(13302);
        }
        __touch(13284);
        return this._isSSAABBScanlineOccluded();
        __touch(13285);
    };
    __touch(13241);
    BoundingSphereOcclusionChecker.prototype._isSSAABBScanlineOccluded = function () {
        var nearestDepth = positionArray[3];
        __touch(13303);
        var leftX = positionArray[4];
        __touch(13304);
        var rightX = positionArray[8];
        __touch(13305);
        var firstScanline = positionArray[13];
        __touch(13306);
        var lastScanline = positionArray[17];
        __touch(13307);
        leftX = Math.floor(leftX);
        __touch(13308);
        rightX = Math.ceil(rightX);
        __touch(13309);
        firstScanline = Math.ceil(firstScanline);
        __touch(13310);
        lastScanline = Math.floor(lastScanline);
        __touch(13311);
        if (leftX < 0) {
            leftX = 0;
            __touch(13315);
        }
        if (rightX > this._clipX) {
            rightX = this._clipX;
            __touch(13316);
        }
        if (firstScanline > this._clipY) {
            firstScanline = this._clipY;
            __touch(13317);
        }
        if (lastScanline < 0) {
            lastScanline = 0;
            __touch(13318);
        }
        var width = this.renderer.width;
        __touch(13312);
        var sampleCoord;
        __touch(13313);
        for (var y = firstScanline; y >= lastScanline; y--) {
            sampleCoord = y * width + leftX;
            __touch(13319);
            for (var x = leftX; x <= rightX; x++) {
                this.renderer._colorData.set(green, sampleCoord * 4);
                __touch(13320);
                if (this.renderer._depthData[sampleCoord] < nearestDepth) {
                    return false;
                    __touch(13322);
                }
                sampleCoord++;
                __touch(13321);
            }
        }
        return true;
        __touch(13314);
    };
    __touch(13242);
    BoundingSphereOcclusionChecker.prototype._isPythagorasCircleScanlineOccluded = function (topCoordinate, bottomCoordinate, rightCoordinate, leftCoordinate, nearestDepth, color) {
        var topRows = topCoordinate.y - rightCoordinate.y;
        __touch(13323);
        var botRows = rightCoordinate.y - bottomCoordinate.y;
        __touch(13324);
        var radius = rightCoordinate.x - topCoordinate.x;
        __touch(13325);
        var r2 = radius * radius;
        __touch(13326);
        var width = this.renderer.width;
        __touch(13327);
        var ratio = width / this.renderer.height;
        __touch(13328);
        var y = topCoordinate.y - 1;
        __touch(13329);
        if (topRows <= 1 && botRows <= 1 || topCoordinate.y <= 0 || bottomCoordinate.y >= this._clipY) {
            var sampleCoord;
            __touch(13338);
            if (this._isCoordinateInsideScreen(topCoordinate)) {
                sampleCoord = topCoordinate.y * width + topCoordinate.x;
                __touch(13340);
                this.renderer._colorData.set(cyan, sampleCoord * 4);
                __touch(13341);
            }
            if (this._isCoordinateInsideScreen(bottomCoordinate)) {
                sampleCoord = bottomCoordinate.y * width + bottomCoordinate.x;
                __touch(13342);
                this.renderer._colorData.set(cyan, sampleCoord * 4);
                __touch(13343);
            }
            if (this._isCoordinateInsideScreen(leftCoordinate)) {
                sampleCoord = leftCoordinate.y * width + leftCoordinate.x;
                __touch(13344);
                this.renderer._colorData.set(cyan, sampleCoord * 4);
                __touch(13345);
            }
            if (this._isCoordinateInsideScreen(rightCoordinate)) {
                sampleCoord = rightCoordinate.y * width + rightCoordinate.x;
                __touch(13346);
                this.renderer._colorData.set(cyan, sampleCoord * 4);
                __touch(13347);
            }
            return true;
            __touch(13339);
        }
        var yH = 1;
        __touch(13330);
        if (rightCoordinate.y >= this._clipY) {
            topRows = 0;
            __touch(13348);
            y = this._clipY;
            __touch(13349);
        } else {
            var topDiff = y - this._clipY;
            __touch(13350);
            if (topDiff > 0) {
                topRows -= topDiff;
                __touch(13352);
                yH += topDiff;
                __touch(13353);
                y = this._clipY;
                __touch(13354);
            }
            var rightUnder = -(rightCoordinate.y + 1);
            __touch(13351);
            if (rightUnder > 0) {
                topRows -= rightUnder;
                __touch(13355);
            }
        }
        topRows -= 1;
        __touch(13331);
        for (var i = 0; i < topRows; i++) {
            var b = radius - ratio * yH;
            __touch(13356);
            var x = Math.sqrt(r2 - b * b);
            __touch(13357);
            var rightX = Math.ceil(topCoordinate.x + x);
            __touch(13358);
            var leftX = Math.floor(topCoordinate.x - x);
            __touch(13359);
            if (leftX < 0) {
                leftX = 0;
                __touch(13363);
            }
            if (rightX > this._clipX) {
                rightX = this._clipX;
                __touch(13364);
            }
            var sampleCoord = y * this.width + leftX;
            __touch(13360);
            for (var xindex = leftX; xindex <= rightX; xindex++) {
                this.renderer._colorData.set(color, sampleCoord * 4);
                __touch(13365);
                if (this.renderer._depthData[sampleCoord] < nearestDepth) {
                    return false;
                    __touch(13367);
                }
                sampleCoord++;
                __touch(13366);
            }
            y--;
            __touch(13361);
            yH++;
            __touch(13362);
        }
        if (y < 0) {
            return true;
            __touch(13368);
        }
        if (topRows >= -1 && rightCoordinate.y <= this._clipY) {
            var leftX = leftCoordinate.x + 1;
            __touch(13369);
            if (leftX < 0) {
                leftX = 0;
                __touch(13373);
            }
            var rightX = rightCoordinate.x - 1;
            __touch(13370);
            if (rightX > this._clipX) {
                rightX = this._clipX;
                __touch(13374);
            }
            var midCoord = y * this.width + leftX;
            __touch(13371);
            for (var i = leftX; i <= rightX; i++) {
                this.renderer._colorData.set(color, midCoord * 4);
                __touch(13375);
                if (this.renderer._depthData[midCoord] < nearestDepth) {
                    return false;
                    __touch(13377);
                }
                midCoord++;
                __touch(13376);
            }
            y--;
            __touch(13372);
        }
        yH = botRows - 1;
        __touch(13332);
        var topDiff = rightCoordinate.y - y - 1;
        __touch(13333);
        if (topDiff > 0) {
            botRows -= topDiff;
            __touch(13378);
            yH -= topDiff;
            __touch(13379);
        }
        var botDiff = -(bottomCoordinate.y + 1);
        __touch(13334);
        if (botDiff > 0) {
            botRows -= botDiff;
            __touch(13380);
        }
        botRows -= 1;
        __touch(13335);
        radius = rightCoordinate.x - bottomCoordinate.x;
        __touch(13336);
        for (var i = 0; i < botRows; i++) {
            var b = radius - ratio * yH;
            __touch(13381);
            var x = Math.sqrt(r2 - b * b);
            __touch(13382);
            var rightX = Math.ceil(topCoordinate.x + x);
            __touch(13383);
            var leftX = Math.floor(topCoordinate.x - x);
            __touch(13384);
            if (leftX < 0) {
                leftX = 0;
                __touch(13388);
            }
            if (rightX > this._clipX) {
                rightX = this._clipX;
                __touch(13389);
            }
            var sampleCoord = y * this.width + leftX;
            __touch(13385);
            for (var xindex = leftX; xindex <= rightX; xindex++) {
                this.renderer._colorData.set(color, sampleCoord * 4);
                __touch(13390);
                if (this.renderer._depthData[sampleCoord] < nearestDepth) {
                    return false;
                    __touch(13392);
                }
                sampleCoord++;
                __touch(13391);
            }
            y--;
            __touch(13386);
            yH--;
            __touch(13387);
        }
        return true;
        __touch(13337);
    };
    __touch(13243);
    BoundingSphereOcclusionChecker.prototype._isOccluded = function (coordinate, color, nearestDepth) {
        if (this._isCoordinateInsideScreen(coordinate)) {
            var coordIndex = coordinate.y * this.renderer.width + coordinate.x;
            __touch(13394);
            this.renderer._colorData.set(color, coordIndex * 4);
            __touch(13395);
            return nearestDepth < this.renderer._depthData[coordIndex];
            __touch(13396);
        }
        return true;
        __touch(13393);
    };
    __touch(13244);
    BoundingSphereOcclusionChecker.prototype._isCoordinateInsideScreen = function (coordinate) {
        return coordinate.data[0] >= 0 && coordinate.data[0] <= this._clipX && coordinate.data[1] <= this._clipY && coordinate.data[1] >= 0;
        __touch(13397);
    };
    __touch(13245);
    return BoundingSphereOcclusionChecker;
    __touch(13246);
});
__touch(13233);
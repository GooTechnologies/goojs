define(['goo/math/MathUtils'], function (MathUtils) {
    'use strict';
    __touch(19353);
    function HeightMapBoundingScript(matrixData) {
        this.matrixData = matrixData;
        __touch(19363);
        this.width = matrixData.length - 1;
        __touch(19364);
    }
    __touch(19354);
    HeightMapBoundingScript.prototype.getMatrixData = function () {
        return this.matrixData;
        __touch(19365);
    };
    __touch(19355);
    HeightMapBoundingScript.prototype.getPointInMatrix = function (x, y) {
        return this.matrixData[x][y];
        __touch(19366);
    };
    __touch(19356);
    HeightMapBoundingScript.prototype.getAt = function (x, y) {
        if (x < 0 || x > this.width || y < 0 || y > this.width) {
            return 0;
            __touch(19367);
        } else {
            return this.getPointInMatrix(x, y);
            __touch(19368);
        }
    };
    __touch(19357);
    HeightMapBoundingScript.prototype.getInterpolated = function (x, y) {
        var valueLeftUp = this.getAt(Math.ceil(x), Math.ceil(y));
        __touch(19369);
        var valueLeftDown = this.getAt(Math.ceil(x), Math.floor(y));
        __touch(19370);
        var valueRightUp = this.getAt(Math.floor(x), Math.ceil(y));
        __touch(19371);
        var valueRightDown = this.getAt(Math.floor(x), Math.floor(y));
        __touch(19372);
        var fracX = x - Math.floor(x);
        __touch(19373);
        var fracY = y - Math.floor(y);
        __touch(19374);
        var upAvg = valueLeftUp * fracX + valueRightUp * (1 - fracX);
        __touch(19375);
        var downAvg = valueLeftDown * fracX + valueRightDown * (1 - fracX);
        __touch(19376);
        var totalAvg = upAvg * fracY + downAvg * (1 - fracY);
        __touch(19377);
        return totalAvg;
        __touch(19378);
    };
    __touch(19358);
    HeightMapBoundingScript.prototype.getTriangleAt = function (x, y) {
        var xc = Math.ceil(x);
        __touch(19379);
        var xf = Math.floor(x);
        __touch(19380);
        var yc = Math.ceil(y);
        __touch(19381);
        var yf = Math.floor(y);
        __touch(19382);
        var fracX = x - xf;
        __touch(19383);
        var fracY = y - yf;
        __touch(19384);
        var p1 = {
            x: xf,
            y: yc,
            z: this.getAt(xf, yc)
        };
        __touch(19385);
        var p2 = {
            x: xc,
            y: yf,
            z: this.getAt(xc, yf)
        };
        __touch(19386);
        var p3;
        __touch(19387);
        if (fracX < 1 - fracY) {
            p3 = {
                x: xf,
                y: yf,
                z: this.getAt(xf, yf)
            };
            __touch(19389);
        } else {
            p3 = {
                x: xc,
                y: yc,
                z: this.getAt(xc, yc)
            };
            __touch(19390);
        }
        return [
            p1,
            p2,
            p3
        ];
        __touch(19388);
    };
    __touch(19359);
    HeightMapBoundingScript.prototype.getPreciseHeight = function (x, y) {
        var tri = this.getTriangleAt(x, y);
        __touch(19391);
        var find = MathUtils.barycentricInterpolation(tri[0], tri[1], tri[2], {
            x: x,
            y: y,
            z: 0
        });
        __touch(19392);
        return find.z;
        __touch(19393);
    };
    __touch(19360);
    HeightMapBoundingScript.prototype.run = function (entity) {
        var translation = entity.transformComponent.transform.translation;
        __touch(19394);
        translation.data[1] = this.getInterpolated(translation.data[2], translation.data[0]);
        __touch(19395);
    };
    __touch(19361);
    return HeightMapBoundingScript;
    __touch(19362);
});
__touch(19352);
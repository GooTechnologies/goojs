define([], function () {
    'use strict';
    __touch(10691);
    function MathUtils() {
    }
    __touch(10692);
    MathUtils.DEG_TO_RAD = Math.PI / 180;
    __touch(10693);
    MathUtils.RAD_TO_DEG = 180 / Math.PI;
    __touch(10694);
    MathUtils.HALF_PI = 0.5 * Math.PI;
    __touch(10695);
    MathUtils.TWO_PI = 2 * Math.PI;
    __touch(10696);
    MathUtils.EPSILON = 0.00001;
    __touch(10697);
    MathUtils.radFromDeg = function (degrees) {
        return degrees * MathUtils.DEG_TO_RAD;
        __touch(10719);
    };
    __touch(10698);
    MathUtils.degFromRad = function (radians) {
        return radians * MathUtils.RAD_TO_DEG;
        __touch(10720);
    };
    __touch(10699);
    MathUtils.lerp = function (factor, start, end) {
        if (start === end) {
            return start;
            __touch(10721);
        } else {
            return start + (end - start) * factor;
            __touch(10722);
        }
    };
    __touch(10700);
    MathUtils.clamp = function (value, min, max) {
        if (min < max) {
            return value < min ? min : value > max ? max : value;
            __touch(10723);
        } else {
            return value < max ? max : value > min ? min : value;
            __touch(10724);
        }
    };
    __touch(10701);
    MathUtils.radialClamp = function (value, min, max) {
        var zero = (min + max) / 2 + (max > min ? Math.PI : 0);
        __touch(10725);
        var _value = MathUtils.moduloPositive(value - zero, MathUtils.TWO_PI);
        __touch(10726);
        var _min = MathUtils.moduloPositive(min - zero, MathUtils.TWO_PI);
        __touch(10727);
        var _max = MathUtils.moduloPositive(max - zero, MathUtils.TWO_PI);
        __touch(10728);
        if (value < 0 && min > 0) {
            min -= MathUtils.TWO_PI;
            __touch(10730);
        } else if (value > 0 && min < 0) {
            min += MathUtils.TWO_PI;
            __touch(10731);
        }
        if (value > MathUtils.TWO_PI && max < MathUtils.TWO_PI) {
            max += MathUtils.TWO_PI;
            __touch(10732);
        }
        return _value < _min ? min : _value > _max ? max : value;
        __touch(10729);
    };
    __touch(10702);
    MathUtils.moduloPositive = function (value, size) {
        var wrappedValue = value % size;
        __touch(10733);
        wrappedValue += wrappedValue < 0 ? size : 0;
        __touch(10734);
        return wrappedValue;
        __touch(10735);
    };
    __touch(10703);
    MathUtils.scurve3 = function (x) {
        return (-2 * x + 3) * x * x;
        __touch(10736);
    };
    __touch(10704);
    MathUtils.scurve5 = function (x) {
        return ((6 * x - 15) * x + 10) * x * x * x;
        __touch(10737);
    };
    __touch(10705);
    MathUtils.sphericalToCartesian = function (radius, azimuth, polar, store) {
        var a = radius * Math.cos(polar);
        __touch(10738);
        store.x = a * Math.cos(azimuth);
        __touch(10739);
        store.y = radius * Math.sin(polar);
        __touch(10740);
        store.z = a * Math.sin(azimuth);
        __touch(10741);
    };
    __touch(10706);
    MathUtils.cartesianToSpherical = function (x, y, z, store) {
        var a = Math.sqrt(x * x + z * z);
        __touch(10742);
        store.x = Math.sqrt(x * x + y * y + z * z);
        __touch(10743);
        store.y = Math.atan2(z, x);
        __touch(10744);
        store.z = Math.atan2(y, a);
        __touch(10745);
    };
    __touch(10707);
    MathUtils.getTriangleNormal = function (p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z) {
        var ux = p2x - p1x;
        __touch(10746);
        var uy = p2y - p1y;
        __touch(10747);
        var uz = p2z - p1z;
        __touch(10748);
        var vx = p3x - p1x;
        __touch(10749);
        var vy = p3y - p1y;
        __touch(10750);
        var vz = p3z - p1z;
        __touch(10751);
        var nx = uy * vz - uz * vy;
        __touch(10752);
        var ny = uz * vx - ux * vz;
        __touch(10753);
        var nz = ux * vy - uy * vx;
        __touch(10754);
        return [
            nx,
            ny,
            nz
        ];
        __touch(10755);
    };
    __touch(10708);
    MathUtils.isPowerOfTwo = function (value) {
        return (value & value - 1) === 0;
        __touch(10756);
    };
    __touch(10709);
    MathUtils.nearestHigherPowerOfTwo = function (value) {
        return Math.floor(Math.pow(2, Math.ceil(Math.log(value) / Math.log(2))));
        __touch(10757);
    };
    __touch(10710);
    MathUtils.closeTo = function (v1, v2, tolerance) {
        tolerance = typeof tolerance !== 'undefined' ? tolerance : 0.001;
        __touch(10758);
        return Math.abs(v1 - v2) <= tolerance;
        __touch(10759);
    };
    __touch(10711);
    MathUtils.sign = function (value) {
        return value < 0 ? -1 : value > 0 ? 1 : 0;
        __touch(10760);
    };
    __touch(10712);
    MathUtils.triangleArea = function (t1, t2, t3) {
        return Math.abs(t1.x * t2.y + t2.x * t3.y + t3.x * t1.y - t2.y * t3.x - t3.y * t1.x - t1.y * t2.x) / 2;
        __touch(10761);
    };
    __touch(10713);
    MathUtils.barycentricInterpolation = function (t1, t2, t3, p) {
        var t1Area = MathUtils.triangleArea(t2, t3, p);
        __touch(10762);
        var t2Area = MathUtils.triangleArea(t1, t3, p);
        __touch(10763);
        var t3Area = MathUtils.triangleArea(t1, t2, p);
        __touch(10764);
        var totalArea = t1Area + t2Area + t3Area;
        __touch(10765);
        if (!totalArea) {
            if (p[0] === t1[0] && p[2] === t1[2]) {
                return t1;
                __touch(10768);
            } else if (p[0] === t2[0] && p[2] === t2[2]) {
                return t2;
                __touch(10769);
            } else if (p[0] === t3[0] && p[2] === t3[2]) {
                return t3;
                __touch(10770);
            }
        }
        p.z = (t1Area * t1.z + t2Area * t2.z + t3Area * t3.z) / totalArea;
        __touch(10766);
        return p;
        __touch(10767);
    };
    __touch(10714);
    MathUtils.smoothstep = function (edge0, edge1, x) {
        x = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        __touch(10771);
        return x * x * (3 - 2 * x);
        __touch(10772);
    };
    __touch(10715);
    MathUtils.randomSeed = 1337;
    __touch(10716);
    MathUtils.fastRandom = function () {
        MathUtils.randomSeed = (MathUtils.randomSeed * 9301 + 49297) % 233280;
        __touch(10773);
        return MathUtils.randomSeed / 233280;
        __touch(10774);
    };
    __touch(10717);
    return MathUtils;
    __touch(10718);
});
__touch(10690);
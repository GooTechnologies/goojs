define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(11853);
    function Plane(normal, constant) {
        this.normal = normal !== undefined ? new Vector3(normal) : new Vector3(Vector3.UNIT_Y);
        __touch(11864);
        this.constant = isNaN(constant) ? 0 : constant;
        __touch(11865);
    }
    __touch(11854);
    Plane.XZ = new Plane(Vector3.UNIT_Y, 0);
    __touch(11855);
    Plane.XY = new Plane(Vector3.UNIT_Z, 0);
    __touch(11856);
    Plane.YZ = new Plane(Vector3.UNIT_X, 0);
    __touch(11857);
    Plane.prototype.pseudoDistance = function (point) {
        return this.normal.dot(point) - this.constant;
        __touch(11866);
    };
    __touch(11858);
    Plane.prototype.setPlanePoints = function (pointA, pointB, pointC) {
        this.normal.set(pointB).sub(pointA);
        __touch(11867);
        this.normal.cross([
            pointC.x - pointA.x,
            pointC.y - pointA.y,
            pointC.z - pointA.z
        ]).normalize();
        __touch(11868);
        this.constant = this.normal.dot(pointA);
        __touch(11869);
        return this;
        __touch(11870);
    };
    __touch(11859);
    Plane.prototype.reflectVector = function (unitVector, store) {
        var result = store;
        __touch(11871);
        if (typeof result === 'undefined') {
            result = new Vector3();
            __touch(11875);
        }
        var dotProd = this.normal.dot(unitVector) * 2;
        __touch(11872);
        result.set(unitVector).sub([
            this.normal.x * dotProd,
            this.normal.y * dotProd,
            this.normal.z * dotProd
        ]);
        __touch(11873);
        return result;
        __touch(11874);
    };
    __touch(11860);
    var p0 = new Vector3();
    __touch(11861);
    Plane.prototype.rayIntersect = function (ray, store, suppressWarnings, precision) {
        precision = typeof precision === 'undefined' ? 1e-7 : precision;
        __touch(11876);
        store = store || new Vector3();
        __touch(11877);
        var lDotN = ray.direction.dot(this.normal);
        __touch(11878);
        if (Math.abs(lDotN) < precision) {
            if (!suppressWarnings) {
                console.warn('Ray parallell with plane');
                __touch(11884);
            }
            return null;
            __touch(11883);
        }
        var c = this.constant;
        __touch(11879);
        var pMinusL0DotN = p0.set(this.normal).muld(c, c, c).subv(ray.origin).dot(this.normal);
        __touch(11880);
        var d = pMinusL0DotN / lDotN;
        __touch(11881);
        return store.setv(ray.direction).muld(d, d, d).addv(ray.origin);
        __touch(11882);
    };
    __touch(11862);
    return Plane;
    __touch(11863);
});
__touch(11852);
define([
    'goo/math/Vector3',
    'goo/math/MathUtils'
], function (Vector3, MathUtils) {
    'use strict';
    __touch(12149);
    function Ray(origin, direction) {
        this.origin = origin || new Vector3();
        __touch(12161);
        this.direction = direction || new Vector3().copy(Vector3.UNIT_Z);
        __touch(12162);
    }
    __touch(12150);
    var tmpVec1 = new Vector3();
    __touch(12151);
    var tmpVec2 = new Vector3();
    __touch(12152);
    var tmpVec3 = new Vector3();
    __touch(12153);
    var tmpVec4 = new Vector3();
    __touch(12154);
    Ray.prototype.intersects = function (polygonVertices, doPlanar, locationStore) {
        if (polygonVertices.length === 3) {
            return this.intersectsTriangle(polygonVertices[0], polygonVertices[1], polygonVertices[2], doPlanar, locationStore);
            __touch(12164);
        } else if (polygonVertices.length === 4) {
            return this.intersectsTriangle(polygonVertices[0], polygonVertices[1], polygonVertices[2], doPlanar, locationStore) || this.intersectsTriangle(polygonVertices[0], polygonVertices[2], polygonVertices[3], doPlanar, locationStore);
            __touch(12165);
        }
        return false;
        __touch(12163);
    };
    __touch(12155);
    Ray.prototype.intersectsTriangle = function (pointA, pointB, pointC, doPlanar, locationStore) {
        var diff = tmpVec1.set(this.origin).sub(pointA);
        __touch(12166);
        var edge1 = tmpVec2.set(pointB).sub(pointA);
        __touch(12167);
        var edge2 = tmpVec3.set(pointC).sub(pointA);
        __touch(12168);
        var norm = tmpVec4.set(edge1).cross(edge2);
        __touch(12169);
        var dirDotNorm = this.direction.dot(norm);
        __touch(12170);
        var sign;
        __touch(12171);
        if (dirDotNorm > MathUtils.EPSILON) {
            sign = 1;
            __touch(12175);
        } else if (dirDotNorm < -MathUtils.EPSILON) {
            sign = -1;
            __touch(12176);
            dirDotNorm = -dirDotNorm;
            __touch(12177);
        } else {
            return false;
            __touch(12178);
        }
        var dirDotDiffxEdge2 = sign * this.direction.dot(Vector3.cross(diff, edge2, edge2));
        __touch(12172);
        var result = false;
        __touch(12173);
        if (dirDotDiffxEdge2 >= 0) {
            var dirDotEdge1xDiff = sign * this.direction.dot(edge1.cross(diff));
            __touch(12179);
            if (dirDotEdge1xDiff >= 0) {
                if (dirDotDiffxEdge2 + dirDotEdge1xDiff <= dirDotNorm) {
                    var diffDotNorm = -sign * diff.dot(norm);
                    __touch(12180);
                    if (diffDotNorm >= 0) {
                        if (!locationStore) {
                            return true;
                            __touch(12184);
                        }
                        var inv = 1 / dirDotNorm;
                        __touch(12181);
                        var t = diffDotNorm * inv;
                        __touch(12182);
                        if (!doPlanar) {
                            locationStore.setv(this.origin).add_d(this.direction.x * t, this.direction.y * t, this.direction.z * t);
                            __touch(12185);
                        } else {
                            var w1 = dirDotDiffxEdge2 * inv;
                            __touch(12186);
                            var w2 = dirDotEdge1xDiff * inv;
                            __touch(12187);
                            locationStore.setd(t, w1, w2);
                            __touch(12188);
                        }
                        result = true;
                        __touch(12183);
                    }
                }
            }
        }
        return result;
        __touch(12174);
    };
    __touch(12156);
    Ray.prototype.getDistanceToPrimitive = function (worldVertices) {
        var intersect = tmpVec1;
        __touch(12189);
        if (this.intersects(worldVertices, false, intersect)) {
            return this.origin.distance(intersect.x, intersect.y, intersect.z);
            __touch(12191);
        }
        return Infinity;
        __touch(12190);
    };
    __touch(12157);
    Ray.prototype.intersectsPlane = function (plane, locationStore) {
        var normal = plane.normal;
        __touch(12192);
        var denominator = normal.dot(this.direction);
        __touch(12193);
        if (Math.abs(denominator) < 0.00001) {
            return false;
            __touch(12197);
        }
        var numerator = -normal.dot(this.origin) + plane.constant;
        __touch(12194);
        var ratio = numerator / denominator;
        __touch(12195);
        if (ratio < 0.00001) {
            return false;
            __touch(12198);
        }
        if (locationStore) {
            locationStore.setv(this.direction).scale(ratio).addv(this.origin);
            __touch(12199);
        }
        return true;
        __touch(12196);
    };
    __touch(12158);
    Ray.prototype.distanceSquared = function (point, store) {
        var vectorA = tmpVec1;
        __touch(12200);
        vectorA.setv(point).subv(this.origin);
        __touch(12201);
        var t0 = this.direction.dot(vectorA);
        __touch(12202);
        if (t0 > 0) {
            vectorA.setv(this.direction).scale(t0);
            __touch(12205);
            vectorA.addv(this.origin);
            __touch(12206);
        } else {
            vectorA.setv(this.origin);
            __touch(12207);
        }
        if (store) {
            store.setv(vectorA);
            __touch(12208);
        }
        vectorA.subv(point);
        __touch(12203);
        return vectorA.lengthSquared();
        __touch(12204);
    };
    __touch(12159);
    return Ray;
    __touch(12160);
});
__touch(12148);
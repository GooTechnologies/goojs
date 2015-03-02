define([
    'goo/math/Vector3',
    'goo/math/MathUtils',
    'goo/renderer/bounds/BoundingVolume',
    'goo/renderer/MeshData'
], function (Vector3, MathUtils, BoundingVolume, MeshData) {
    'use strict';
    __touch(18170);
    function BoundingSphere(center, radius) {
        BoundingVolume.call(this, center);
        __touch(18193);
        this.radius = radius !== undefined ? radius : 1;
        __touch(18194);
    }
    __touch(18171);
    var tmpVec = new Vector3();
    __touch(18172);
    BoundingSphere.prototype = Object.create(BoundingVolume.prototype);
    __touch(18173);
    BoundingSphere.prototype.constructor = BoundingSphere;
    __touch(18174);
    BoundingSphere.prototype.computeFromPoints = function (verts) {
        var min = this.min;
        __touch(18195);
        var max = this.max;
        __touch(18196);
        var vec = tmpVec;
        __touch(18197);
        min.setd(Infinity, Infinity, Infinity);
        __touch(18198);
        max.setd(-Infinity, -Infinity, -Infinity);
        __touch(18199);
        var x, y, z;
        __touch(18200);
        for (var i = 0; i < verts.length; i += 3) {
            x = verts[i + 0];
            __touch(18205);
            y = verts[i + 1];
            __touch(18206);
            z = verts[i + 2];
            __touch(18207);
            min.data[0] = x < min.data[0] ? x : min.data[0];
            __touch(18208);
            min.data[1] = y < min.data[1] ? y : min.data[1];
            __touch(18209);
            min.data[2] = z < min.data[2] ? z : min.data[2];
            __touch(18210);
            max.data[0] = x > max.data[0] ? x : max.data[0];
            __touch(18211);
            max.data[1] = y > max.data[1] ? y : max.data[1];
            __touch(18212);
            max.data[2] = z > max.data[2] ? z : max.data[2];
            __touch(18213);
        }
        var newCenter = max.addv(min).div(2);
        __touch(18201);
        var size = 0, test;
        __touch(18202);
        for (var i = 0; i < verts.length; i += 3) {
            vec.setd(verts[i], verts[i + 1], verts[i + 2]);
            __touch(18214);
            test = vec.subv(newCenter).lengthSquared();
            __touch(18215);
            if (test > size) {
                size = test;
                __touch(18216);
            }
        }
        this.radius = Math.sqrt(size);
        __touch(18203);
        this.center.setv(newCenter);
        __touch(18204);
    };
    __touch(18175);
    (function () {
        var relativePoint = new Vector3();
        __touch(18217);
        BoundingSphere.prototype.containsPoint = function (point) {
            return relativePoint.setv(point).subv(this.center).lengthSquared() <= Math.pow(this.radius, 2);
            __touch(18219);
        };
        __touch(18218);
    }());
    __touch(18176);
    BoundingSphere.prototype.computeFromPrimitives = function (data, section, indices, start, end) {
        if (end - start <= 0) {
            return;
            __touch(18225);
        }
        var vertList = [];
        __touch(18220);
        var store = [];
        __touch(18221);
        var vertsPerPrimitive = MeshData.getVertexCount(data.indexModes[section]);
        __touch(18222);
        var count = 0;
        __touch(18223);
        for (var i = start; i < end; i++) {
            store = data.getPrimitiveVertices(indices[i], section, store);
            __touch(18226);
            for (var j = 0; j < vertsPerPrimitive; j++) {
                vertList[count++] = new Vector3().set(store[j]);
                __touch(18227);
            }
        }
        this.averagePoints(vertList);
        __touch(18224);
    };
    __touch(18177);
    BoundingSphere.prototype.averagePoints = function (points) {
        this.center.set(points[0]);
        __touch(18228);
        for (var i = 1; i < points.length; i++) {
            this.center.add(points[i]);
            __touch(18233);
        }
        var quantity = 1 / points.length;
        __touch(18229);
        this.center.mul(quantity);
        __touch(18230);
        var maxRadiusSqr = 0;
        __touch(18231);
        for (var i = 0; i < points.length; i++) {
            var diff = Vector3.sub(points[i], this.center, tmpVec);
            __touch(18234);
            var radiusSqr = diff.lengthSquared();
            __touch(18235);
            if (radiusSqr > maxRadiusSqr) {
                maxRadiusSqr = radiusSqr;
                __touch(18236);
            }
        }
        this.radius = Math.sqrt(maxRadiusSqr) + 0.00001;
        __touch(18232);
    };
    __touch(18178);
    BoundingSphere.prototype.transform = function (transform, bound) {
        if (bound === null) {
            bound = new BoundingSphere();
            __touch(18241);
        }
        transform.applyForward(this.center, bound.center);
        __touch(18237);
        var scale = transform.scale;
        __touch(18238);
        bound.radius = Math.abs(this._maxAxis(scale) * this.radius);
        __touch(18239);
        return bound;
        __touch(18240);
    };
    __touch(18179);
    BoundingSphere.prototype.whichSide = function (plane) {
        var planeData = plane.normal.data;
        __touch(18242);
        var pointData = this.center.data;
        __touch(18243);
        var distance = planeData[0] * pointData[0] + planeData[1] * pointData[1] + planeData[2] * pointData[2] - plane.constant;
        __touch(18244);
        if (distance < -this.radius) {
            return BoundingVolume.Inside;
            __touch(18245);
        } else if (distance > this.radius) {
            return BoundingVolume.Outside;
            __touch(18246);
        } else {
            return BoundingVolume.Intersects;
            __touch(18247);
        }
    };
    __touch(18180);
    BoundingSphere.prototype._pseudoDistance = function (plane, point) {
        return plane.normal.x * point.x + plane.normal.y * point.y + plane.normal.z * point.z - plane.constant;
        __touch(18248);
    };
    __touch(18181);
    BoundingSphere.prototype._maxAxis = function (scale) {
        return Math.max(Math.abs(scale.x), Math.max(Math.abs(scale.y), Math.abs(scale.z)));
        __touch(18249);
    };
    __touch(18182);
    BoundingSphere.prototype.toString = function () {
        var x = Math.round(this.center.x * 10) / 10;
        __touch(18250);
        var y = Math.round(this.center.y * 10) / 10;
        __touch(18251);
        var z = Math.round(this.center.z * 10) / 10;
        __touch(18252);
        var radius = Math.round(this.radius * 10) / 10;
        __touch(18253);
        return '[' + x + ',' + y + ',' + z + ']' + ' - ' + radius;
        __touch(18254);
    };
    __touch(18183);
    BoundingSphere.prototype.intersects = function (bv) {
        return bv.intersectsSphere(this);
        __touch(18255);
    };
    __touch(18184);
    BoundingSphere.prototype.intersectsBoundingBox = function (bb) {
        bb.min.x = bb.center.x - bb.xExtent;
        __touch(18256);
        bb.min.y = bb.center.y - bb.yExtent;
        __touch(18257);
        bb.min.z = bb.center.z - bb.zExtent;
        __touch(18258);
        bb.max.x = bb.center.x + bb.xExtent;
        __touch(18259);
        bb.max.y = bb.center.y + bb.yExtent;
        __touch(18260);
        bb.max.z = bb.center.z + bb.zExtent;
        __touch(18261);
        var rs = Math.pow(this.radius, 2);
        __touch(18262);
        var dmin = 0;
        __touch(18263);
        if (this.center.x < bb.min.x) {
            dmin += Math.pow(this.center.x - bb.min.x, 2);
            __touch(18265);
        } else if (this.center.x > bb.max.x) {
            dmin += Math.pow(this.center.x - bb.max.x, 2);
            __touch(18266);
        }
        if (this.center.y < bb.min.y) {
            dmin += Math.pow(this.center.y - bb.min.y, 2);
            __touch(18267);
        } else if (this.center.y > bb.max.y) {
            dmin += Math.pow(this.center.y - bb.max.y, 2);
            __touch(18268);
        }
        if (this.center.z < bb.min.z) {
            dmin += Math.pow(this.center.z - bb.min.z, 2);
            __touch(18269);
        } else if (this.center.z > bb.max.z) {
            dmin += Math.pow(this.center.z - bb.max.z, 2);
            __touch(18270);
        }
        return dmin <= rs;
        __touch(18264);
    };
    __touch(18185);
    BoundingSphere.prototype.intersectsSphere = function (bs) {
        var diff = tmpVec.setv(this.center).subv(bs.center);
        __touch(18271);
        var rsum = this.radius + bs.radius;
        __touch(18272);
        return diff.dot(diff) <= rsum * rsum;
        __touch(18273);
    };
    __touch(18186);
    BoundingSphere.prototype.intersectsRay = function (ray) {
        if (!this.center) {
            return false;
            __touch(18278);
        }
        var diff = new Vector3().copy(ray.origin).sub(this.center);
        __touch(18274);
        var a = diff.dot(diff) - this.radius * this.radius;
        __touch(18275);
        if (a <= 0) {
            return true;
            __touch(18279);
        }
        var b = ray.direction.dot(diff);
        __touch(18276);
        if (b >= 0) {
            return false;
            __touch(18280);
        }
        return b * b >= a;
        __touch(18277);
    };
    __touch(18187);
    BoundingSphere.prototype.intersectsRayWhere = function (ray) {
        var diff = new Vector3().copy(ray.origin).sub(this.center);
        __touch(18281);
        var a = diff.dot(diff) - this.radius * this.radius;
        __touch(18282);
        var a1, discr, root;
        __touch(18283);
        if (a <= 0) {
            a1 = ray.direction.dot(diff);
            __touch(18289);
            discr = a1 * a1 - a;
            __touch(18290);
            root = Math.sqrt(discr);
            __touch(18291);
            var distances = [root - a1];
            __touch(18292);
            var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
            __touch(18293);
            return {
                'distances': distances,
                'points': points
            };
            __touch(18294);
        }
        a1 = ray.direction.dot(diff);
        __touch(18284);
        if (a1 >= 0) {
            return null;
            __touch(18295);
        }
        discr = a1 * a1 - a;
        __touch(18285);
        if (discr < 0) {
            return null;
            __touch(18296);
        } else if (discr >= 0.00001) {
            root = Math.sqrt(discr);
            __touch(18297);
            var distances = [
                -a1 - root,
                -a1 + root
            ];
            __touch(18298);
            var points = [
                new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin),
                new Vector3().copy(ray.direction).mul(distances[1]).add(ray.origin)
            ];
            __touch(18299);
            return {
                'distances': distances,
                'points': points
            };
            __touch(18300);
        }
        var distances = [-a1];
        __touch(18286);
        var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
        __touch(18287);
        return {
            'distances': distances,
            'points': points
        };
        __touch(18288);
    };
    __touch(18188);
    BoundingSphere.prototype.merge = function (bv) {
        if (bv instanceof BoundingSphere) {
            return this.mergeSphere(bv.center, bv.radius, this);
            __touch(18301);
        } else {
            var boxRadius = tmpVec.setd(bv.xExtent, bv.yExtent, bv.zExtent).length();
            __touch(18302);
            return this.mergeSphere(bv.center, boxRadius, this);
            __touch(18303);
        }
    };
    __touch(18189);
    BoundingSphere.prototype.mergeSphere = function (center, radius, store) {
        if (!store) {
            store = new BoundingSphere();
            __touch(18312);
        }
        var diff = tmpVec.setv(center).subv(this.center);
        __touch(18304);
        var lengthSquared = diff.lengthSquared();
        __touch(18305);
        var radiusDiff = radius - this.radius;
        __touch(18306);
        var radiusDiffSqr = radiusDiff * radiusDiff;
        __touch(18307);
        if (radiusDiffSqr >= lengthSquared) {
            if (radiusDiff <= 0) {
                store.center.setv(this.center);
                __touch(18313);
                store.radius = this.radius;
                __touch(18314);
                return store;
                __touch(18315);
            } else {
                store.center.setv(center);
                __touch(18316);
                store.radius = radius;
                __touch(18317);
                return store;
                __touch(18318);
            }
        }
        var length = Math.sqrt(lengthSquared);
        __touch(18308);
        var rCenter = store.center;
        __touch(18309);
        if (length > MathUtils.EPSILON) {
            var coeff = (length + radiusDiff) / (2 * length);
            __touch(18319);
            rCenter.addv(diff.mul(coeff));
            __touch(18320);
        }
        store.radius = 0.5 * (length + this.radius + radius);
        __touch(18310);
        return store;
        __touch(18311);
    };
    __touch(18190);
    BoundingSphere.prototype.clone = function (store) {
        if (store && store instanceof BoundingSphere) {
            store.center.setv(this.center);
            __touch(18322);
            store.radius = this.radius;
            __touch(18323);
            return store;
            __touch(18324);
        }
        return new BoundingSphere(this.center, this.radius);
        __touch(18321);
    };
    __touch(18191);
    return BoundingSphere;
    __touch(18192);
});
__touch(18169);
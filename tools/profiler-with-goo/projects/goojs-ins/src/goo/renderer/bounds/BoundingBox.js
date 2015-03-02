define([
    'goo/math/Vector3',
    'goo/renderer/bounds/BoundingVolume',
    'goo/renderer/bounds/BoundingSphere',
    'goo/math/MathUtils'
], function (Vector3, BoundingVolume, BoundingSphere, MathUtils) {
    'use strict';
    __touch(17927);
    function BoundingBox(center, xExtent, yExtent, zExtent) {
        BoundingVolume.call(this, center);
        __touch(17958);
        this.xExtent = xExtent !== undefined ? xExtent : 1;
        __touch(17959);
        this.yExtent = yExtent !== undefined ? yExtent : 1;
        __touch(17960);
        this.zExtent = zExtent !== undefined ? zExtent : 1;
        __touch(17961);
    }
    __touch(17928);
    var tmpVec1 = new Vector3();
    __touch(17929);
    var tmpVec2 = new Vector3();
    __touch(17930);
    var tmpVec3 = new Vector3();
    __touch(17931);
    var tmpCorners = [];
    __touch(17932);
    for (var i = 0; i < 8; i++) {
        tmpCorners.push(new Vector3());
        __touch(17962);
    }
    BoundingBox.prototype = Object.create(BoundingVolume.prototype);
    __touch(17933);
    BoundingBox.prototype.constructor = BoundingBox;
    __touch(17934);
    BoundingBox.prototype.computeFromPoints = function (verts) {
        var min = this.min;
        __touch(17963);
        var max = this.max;
        __touch(17964);
        var vec = tmpVec3;
        __touch(17965);
        min.setd(verts[0], verts[1], verts[2]);
        __touch(17966);
        max.setd(verts[0], verts[1], verts[2]);
        __touch(17967);
        var x, y, z;
        __touch(17968);
        for (var i = 3; i < verts.length; i += 3) {
            x = verts[i + 0];
            __touch(17974);
            y = verts[i + 1];
            __touch(17975);
            z = verts[i + 2];
            __touch(17976);
            min.data[0] = x < min.data[0] ? x : min.data[0];
            __touch(17977);
            min.data[1] = y < min.data[1] ? y : min.data[1];
            __touch(17978);
            min.data[2] = z < min.data[2] ? z : min.data[2];
            __touch(17979);
            max.data[0] = x > max.data[0] ? x : max.data[0];
            __touch(17980);
            max.data[1] = y > max.data[1] ? y : max.data[1];
            __touch(17981);
            max.data[2] = z > max.data[2] ? z : max.data[2];
            __touch(17982);
        }
        vec.setv(max).subv(min).mul(0.5);
        __touch(17969);
        this.xExtent = vec.data[0];
        __touch(17970);
        this.yExtent = vec.data[1];
        __touch(17971);
        this.zExtent = vec.data[2];
        __touch(17972);
        this.center.setv(max).addv(min).mul(0.5);
        __touch(17973);
    };
    __touch(17935);
    BoundingBox.prototype.containsPoint = function (point) {
        var center = this.center;
        __touch(17983);
        var x = point.x - center.x;
        __touch(17984);
        var y = point.y - center.y;
        __touch(17985);
        var z = point.z - center.z;
        __touch(17986);
        return x >= -this.xExtent && x <= this.xExtent && y >= -this.yExtent && y <= this.yExtent && z >= -this.zExtent && z <= this.zExtent;
        __touch(17987);
    };
    __touch(17936);
    var tmpArray = [];
    __touch(17937);
    BoundingBox.prototype.computeFromPrimitives = function (data, section, indices, start, end) {
        if (end - start <= 0) {
            return;
            __touch(17997);
        }
        var min = tmpVec1.set(Infinity, Infinity, Infinity);
        __touch(17988);
        var max = tmpVec2.set(-Infinity, -Infinity, -Infinity);
        __touch(17989);
        var store = tmpArray;
        __touch(17990);
        store.length = 0;
        __touch(17991);
        for (var i = start; i < end; i++) {
            store = data.getPrimitiveVertices(indices[i], section, store);
            __touch(17998);
            for (var j = 0; j < store.length; j++) {
                BoundingBox.checkMinMax(min, max, store[j]);
                __touch(17999);
            }
        }
        this.center.copy(min.add(max));
        __touch(17992);
        this.center.mul(0.5);
        __touch(17993);
        this.xExtent = max.x - this.center.x;
        __touch(17994);
        this.yExtent = max.y - this.center.y;
        __touch(17995);
        this.zExtent = max.z - this.center.z;
        __touch(17996);
    };
    __touch(17938);
    BoundingBox.checkMinMax = function (min, max, point) {
        if (point.x < min.x) {
            min.x = point.x;
            __touch(18000);
        }
        if (point.x > max.x) {
            max.x = point.x;
            __touch(18001);
        }
        if (point.y < min.y) {
            min.y = point.y;
            __touch(18002);
        }
        if (point.y > max.y) {
            max.y = point.y;
            __touch(18003);
        }
        if (point.z < min.z) {
            min.z = point.z;
            __touch(18004);
        }
        if (point.z > max.z) {
            max.z = point.z;
            __touch(18005);
        }
    };
    __touch(17939);
    BoundingBox.prototype.transform = function (transform, box) {
        if (box === null) {
            box = new BoundingBox();
            __touch(18022);
        }
        var corners = tmpCorners;
        __touch(18006);
        this.getCorners(corners);
        __touch(18007);
        for (var i = 0; i < 8; i++) {
            transform.matrix.applyPostPoint(corners[i]);
            __touch(18023);
        }
        var minX = corners[0].data[0];
        __touch(18008);
        var minY = corners[0].data[1];
        __touch(18009);
        var minZ = corners[0].data[2];
        __touch(18010);
        var maxX = minX;
        __touch(18011);
        var maxY = minY;
        __touch(18012);
        var maxZ = minZ;
        __touch(18013);
        for (var i = 1; i < 8; i++) {
            var curX = corners[i].data[0];
            __touch(18024);
            var curY = corners[i].data[1];
            __touch(18025);
            var curZ = corners[i].data[2];
            __touch(18026);
            minX = Math.min(minX, curX);
            __touch(18027);
            minY = Math.min(minY, curY);
            __touch(18028);
            minZ = Math.min(minZ, curZ);
            __touch(18029);
            maxX = Math.max(maxX, curX);
            __touch(18030);
            maxY = Math.max(maxY, curY);
            __touch(18031);
            maxZ = Math.max(maxZ, curZ);
            __touch(18032);
        }
        var ctrX = (maxX + minX) * 0.5;
        __touch(18014);
        var ctrY = (maxY + minY) * 0.5;
        __touch(18015);
        var ctrZ = (maxZ + minZ) * 0.5;
        __touch(18016);
        box.center.setd(ctrX, ctrY, ctrZ);
        __touch(18017);
        box.xExtent = maxX - ctrX;
        __touch(18018);
        box.yExtent = maxY - ctrY;
        __touch(18019);
        box.zExtent = maxZ - ctrZ;
        __touch(18020);
        return box;
        __touch(18021);
    };
    __touch(17940);
    BoundingBox.prototype.getCorners = function (store) {
        var xExtent = this.xExtent;
        __touch(18033);
        var yExtent = this.yExtent;
        __touch(18034);
        var zExtent = this.zExtent;
        __touch(18035);
        var centerData = this.center.data;
        __touch(18036);
        store[0].setd(centerData[0] + xExtent, centerData[1] + yExtent, centerData[2] + zExtent);
        __touch(18037);
        store[1].setd(centerData[0] + xExtent, centerData[1] + yExtent, centerData[2] - zExtent);
        __touch(18038);
        store[2].setd(centerData[0] + xExtent, centerData[1] - yExtent, centerData[2] + zExtent);
        __touch(18039);
        store[3].setd(centerData[0] + xExtent, centerData[1] - yExtent, centerData[2] - zExtent);
        __touch(18040);
        store[4].setd(centerData[0] - xExtent, centerData[1] + yExtent, centerData[2] + zExtent);
        __touch(18041);
        store[5].setd(centerData[0] - xExtent, centerData[1] + yExtent, centerData[2] - zExtent);
        __touch(18042);
        store[6].setd(centerData[0] - xExtent, centerData[1] - yExtent, centerData[2] + zExtent);
        __touch(18043);
        store[7].setd(centerData[0] - xExtent, centerData[1] - yExtent, centerData[2] - zExtent);
        __touch(18044);
        return store;
        __touch(18045);
    };
    __touch(17941);
    BoundingBox.prototype.whichSide = function (plane) {
        var planeData = plane.normal.data;
        __touch(18046);
        var pointData = this.center.data;
        __touch(18047);
        var radius = Math.abs(this.xExtent * planeData[0]) + Math.abs(this.yExtent * planeData[1]) + Math.abs(this.zExtent * planeData[2]);
        __touch(18048);
        var distance = planeData[0] * pointData[0] + planeData[1] * pointData[1] + planeData[2] * pointData[2] - plane.constant;
        __touch(18049);
        if (distance < -radius) {
            return BoundingVolume.Inside;
            __touch(18050);
        } else if (distance > radius) {
            return BoundingVolume.Outside;
            __touch(18051);
        } else {
            return BoundingVolume.Intersects;
            __touch(18052);
        }
    };
    __touch(17942);
    BoundingBox.prototype._pseudoDistance = function (plane, point) {
        var planeData = plane.normal.data;
        __touch(18053);
        var pointData = point.data;
        __touch(18054);
        return planeData[0] * pointData[0] + planeData[1] * pointData[1] + planeData[2] * pointData[2] - plane.constant;
        __touch(18055);
    };
    __touch(17943);
    BoundingBox.prototype._maxAxis = function (scale) {
        return Math.max(Math.abs(scale.x), Math.max(Math.abs(scale.y), Math.abs(scale.z)));
        __touch(18056);
    };
    __touch(17944);
    BoundingBox.prototype.toString = function () {
        var x = Math.round(this.center.x * 10) / 10;
        __touch(18057);
        var y = Math.round(this.center.y * 10) / 10;
        __touch(18058);
        var z = Math.round(this.center.z * 10) / 10;
        __touch(18059);
        return '[' + x + ',' + y + ',' + z + ']' + ' - ' + '[' + this.xExtent + ',' + this.yExtent + ',' + this.zExtent + ']';
        __touch(18060);
    };
    __touch(17945);
    BoundingBox.prototype.intersects = function (bv) {
        return bv.intersectsBoundingBox(this);
        __touch(18061);
    };
    __touch(17946);
    BoundingBox.prototype.intersectsBoundingBox = function (bb) {
        if (this.center.x + this.xExtent < bb.center.x - bb.xExtent || this.center.x - this.xExtent > bb.center.x + bb.xExtent) {
            return false;
            __touch(18062);
        } else if (this.center.y + this.yExtent < bb.center.y - bb.yExtent || this.center.y - this.yExtent > bb.center.y + bb.yExtent) {
            return false;
            __touch(18063);
        } else if (this.center.z + this.zExtent < bb.center.z - bb.zExtent || this.center.z - this.zExtent > bb.center.z + bb.zExtent) {
            return false;
            __touch(18064);
        } else {
            return true;
            __touch(18065);
        }
    };
    __touch(17947);
    BoundingBox.prototype.intersectsSphere = function (bs) {
        this.min.x = this.center.x - this.xExtent;
        __touch(18066);
        this.min.y = this.center.y - this.yExtent;
        __touch(18067);
        this.min.z = this.center.z - this.zExtent;
        __touch(18068);
        this.max.x = this.center.x + this.xExtent;
        __touch(18069);
        this.max.y = this.center.y + this.yExtent;
        __touch(18070);
        this.max.z = this.center.z + this.zExtent;
        __touch(18071);
        var rs = Math.pow(bs.radius, 2);
        __touch(18072);
        var dmin = 0;
        __touch(18073);
        if (bs.center.x < this.min.x) {
            dmin += Math.pow(bs.center.x - this.min.x, 2);
            __touch(18075);
        } else if (bs.center.x > this.max.x) {
            dmin += Math.pow(bs.center.x - this.max.x, 2);
            __touch(18076);
        }
        if (bs.center.y < this.min.y) {
            dmin += Math.pow(bs.center.y - this.min.y, 2);
            __touch(18077);
        } else if (bs.center.y > this.max.y) {
            dmin += Math.pow(bs.center.y - this.max.y, 2);
            __touch(18078);
        }
        if (bs.center.z < this.min.z) {
            dmin += Math.pow(bs.center.z - this.min.z, 2);
            __touch(18079);
        } else if (bs.center.z > this.max.z) {
            dmin += Math.pow(bs.center.z - this.max.z, 2);
            __touch(18080);
        }
        return dmin <= rs;
        __touch(18074);
    };
    __touch(17948);
    BoundingBox.prototype.testStaticAABBAABB = function (bb, contact) {
        var a = this;
        __touch(18081);
        var b = bb;
        __touch(18082);
        var mtvInfo = {
            mtvDistance: 10000000000,
            mtvAxis: new Vector3()
        };
        __touch(18083);
        if (!this.testAxisStatic(Vector3.UNIT_X, a.center.x - a.xExtent, a.center.x + a.xExtent, b.center.x - b.xExtent, b.center.x + b.xExtent, mtvInfo)) {
            return false;
            __touch(18085);
        }
        if (!this.testAxisStatic(Vector3.UNIT_Y, a.center.y - a.yExtent, a.center.y + a.yExtent, b.center.y - b.yExtent, b.center.y + b.yExtent, mtvInfo)) {
            return false;
            __touch(18086);
        }
        if (!this.testAxisStatic(Vector3.UNIT_Z, a.center.z - a.zExtent, a.center.z + a.zExtent, b.center.z - b.zExtent, b.center.z + b.zExtent, mtvInfo)) {
            return false;
            __touch(18087);
        }
        if (contact) {
            contact.isIntersecting = true;
            __touch(18088);
            contact.normal = mtvInfo.mtvAxis;
            __touch(18089);
            contact.penetration = Math.sqrt(mtvInfo.mtvDistance) * 1.001;
            __touch(18090);
        }
        return true;
        __touch(18084);
    };
    __touch(17949);
    BoundingBox.prototype.testAxisStatic = function (axis, minA, maxA, minB, maxB, mtvInfo) {
        var axisLengthSquared = Vector3.dot(axis, axis);
        __touch(18091);
        if (axisLengthSquared < 0.000001) {
            return true;
            __touch(18098);
        }
        var d0 = maxB - minA;
        __touch(18092);
        var d1 = maxA - minB;
        __touch(18093);
        if (d0 <= 0 || d1 <= 0) {
            return false;
            __touch(18099);
        }
        var overlap = d0 < d1 ? d0 : -d1;
        __touch(18094);
        var sep = new Vector3().copy(axis).mul(overlap / axisLengthSquared);
        __touch(18095);
        var sepLengthSquared = Vector3.dot(sep, sep);
        __touch(18096);
        if (sepLengthSquared < mtvInfo.mtvDistance) {
            mtvInfo.mtvDistance = sepLengthSquared;
            __touch(18100);
            mtvInfo.mtvAxis = axis;
            __touch(18101);
        }
        return true;
        __touch(18097);
    };
    __touch(17950);
    BoundingBox.prototype.intersectsRay = function (ray) {
        if (isNaN(this.center.x) || isNaN(this.center.y) || isNaN(this.center.z)) {
            return false;
            __touch(18110);
        }
        var diff = tmpVec1.setv(ray.origin).subv(this.center);
        __touch(18102);
        var direction = ray.direction;
        __touch(18103);
        var t = [
            0,
            Infinity
        ];
        __touch(18104);
        var x = this.xExtent;
        __touch(18105);
        if (x < MathUtils.ZERO_TOLERANCE && x >= 0) {
            x = MathUtils.ZERO_TOLERANCE;
            __touch(18111);
        }
        var y = this.yExtent;
        __touch(18106);
        if (y < MathUtils.ZERO_TOLERANCE && y >= 0) {
            y = MathUtils.ZERO_TOLERANCE;
            __touch(18112);
        }
        var z = this.zExtent;
        __touch(18107);
        if (z < MathUtils.ZERO_TOLERANCE && z >= 0) {
            z = MathUtils.ZERO_TOLERANCE;
            __touch(18113);
        }
        var notEntirelyClipped = BoundingBox.clip(direction.data[0], -diff.data[0] - x, t) && BoundingBox.clip(-direction.data[0], diff.data[0] - x, t) && BoundingBox.clip(direction.data[1], -diff.data[1] - y, t) && BoundingBox.clip(-direction.data[1], diff.data[1] - y, t) && BoundingBox.clip(direction.data[2], -diff.data[2] - z, t) && BoundingBox.clip(-direction.data[2], diff.data[2] - z, t);
        __touch(18108);
        if (notEntirelyClipped && (t[0] !== 0 || t[1] !== Infinity)) {
            return true;
            __touch(18114);
        }
        return false;
        __touch(18109);
    };
    __touch(17951);
    BoundingBox.prototype.intersectsRayWhere = function (ray) {
        if (isNaN(this.center.x) || isNaN(this.center.y) || isNaN(this.center.z)) {
            return null;
            __touch(18123);
        }
        var diff = Vector3.sub(ray.origin, this.center, tmpVec1);
        __touch(18115);
        var direction = ray.direction;
        __touch(18116);
        var t = [
            0,
            Infinity
        ];
        __touch(18117);
        var x = this.xExtent;
        __touch(18118);
        if (x < MathUtils.ZERO_TOLERANCE && x >= 0) {
            x = MathUtils.ZERO_TOLERANCE;
            __touch(18124);
        }
        var y = this.yExtent;
        __touch(18119);
        if (y < MathUtils.ZERO_TOLERANCE && y >= 0) {
            y = MathUtils.ZERO_TOLERANCE;
            __touch(18125);
        }
        var z = this.zExtent;
        __touch(18120);
        if (z < MathUtils.ZERO_TOLERANCE && z >= 0) {
            z = MathUtils.ZERO_TOLERANCE;
            __touch(18126);
        }
        var notEntirelyClipped = BoundingBox.clip(direction.data[0], -diff.data[0] - x, t) && BoundingBox.clip(-direction.data[0], diff.data[0] - x, t) && BoundingBox.clip(direction.data[1], -diff.data[1] - y, t) && BoundingBox.clip(-direction.data[1], diff.data[1] - y, t) && BoundingBox.clip(direction.data[2], -diff.data[2] - z, t) && BoundingBox.clip(-direction.data[2], diff.data[2] - z, t);
        __touch(18121);
        if (notEntirelyClipped && (t[0] !== 0 || t[1] !== Infinity)) {
            if (t[1] > t[0]) {
                var distances = t;
                __touch(18130);
                var points = [
                    new Vector3(ray.direction).mul(distances[0]).add(ray.origin),
                    new Vector3(ray.direction).mul(distances[1]).add(ray.origin)
                ];
                __touch(18131);
                return {
                    'distances': distances,
                    'points': points
                };
                __touch(18132);
            }
            var distances = [t[0]];
            __touch(18127);
            var points = [new Vector3(ray.direction).mul(distances[0]).add(ray.origin)];
            __touch(18128);
            return {
                'distances': distances,
                'points': points
            };
            __touch(18129);
        }
        return null;
        __touch(18122);
    };
    __touch(17952);
    BoundingBox.clip = function (denom, numer, t) {
        if (denom > 0) {
            if (numer > denom * t[1]) {
                return false;
                __touch(18134);
            }
            if (numer > denom * t[0]) {
                t[0] = numer / denom;
                __touch(18135);
            }
            return true;
            __touch(18133);
        } else if (denom < 0) {
            if (numer > denom * t[0]) {
                return false;
                __touch(18137);
            }
            if (numer > denom * t[1]) {
                t[1] = numer / denom;
                __touch(18138);
            }
            return true;
            __touch(18136);
        } else {
            return numer <= 0;
            __touch(18139);
        }
    };
    __touch(17953);
    BoundingBox.prototype.merge = function (bv) {
        if (bv instanceof BoundingBox) {
            return this.mergeBox(bv.center, bv.xExtent, bv.yExtent, bv.zExtent, this);
            __touch(18140);
        } else if (bv instanceof BoundingSphere) {
            return this.mergeBox(bv.center, bv.radius, bv.radius, bv.radius, this);
            __touch(18141);
        } else {
            return this;
            __touch(18142);
        }
    };
    __touch(17954);
    BoundingBox.prototype.mergeBox = function (center, xExtent, yExtent, zExtent, store) {
        if (!store) {
            store = new BoundingBox();
            __touch(18156);
        }
        var calcVec1 = tmpVec1;
        __touch(18143);
        var calcVec2 = tmpVec2;
        __touch(18144);
        calcVec1.x = this.center.x - this.xExtent;
        __touch(18145);
        if (calcVec1.x > center.x - xExtent) {
            calcVec1.x = center.x - xExtent;
            __touch(18157);
        }
        calcVec1.y = this.center.y - this.yExtent;
        __touch(18146);
        if (calcVec1.y > center.y - yExtent) {
            calcVec1.y = center.y - yExtent;
            __touch(18158);
        }
        calcVec1.z = this.center.z - this.zExtent;
        __touch(18147);
        if (calcVec1.z > center.z - zExtent) {
            calcVec1.z = center.z - zExtent;
            __touch(18159);
        }
        calcVec2.x = this.center.x + this.xExtent;
        __touch(18148);
        if (calcVec2.x < center.x + xExtent) {
            calcVec2.x = center.x + xExtent;
            __touch(18160);
        }
        calcVec2.y = this.center.y + this.yExtent;
        __touch(18149);
        if (calcVec2.y < center.y + yExtent) {
            calcVec2.y = center.y + yExtent;
            __touch(18161);
        }
        calcVec2.z = this.center.z + this.zExtent;
        __touch(18150);
        if (calcVec2.z < center.z + zExtent) {
            calcVec2.z = center.z + zExtent;
            __touch(18162);
        }
        store.center.set(calcVec2).addv(calcVec1).muld(0.5, 0.5, 0.5);
        __touch(18151);
        store.xExtent = calcVec2.x - store.center.x;
        __touch(18152);
        store.yExtent = calcVec2.y - store.center.y;
        __touch(18153);
        store.zExtent = calcVec2.z - store.center.z;
        __touch(18154);
        return store;
        __touch(18155);
    };
    __touch(17955);
    BoundingBox.prototype.clone = function (store) {
        if (store && store instanceof BoundingBox) {
            store.center.setv(this.center);
            __touch(18164);
            store.xExtent = this.xExtent;
            __touch(18165);
            store.yExtent = this.yExtent;
            __touch(18166);
            store.zExtent = this.zExtent;
            __touch(18167);
            return store;
            __touch(18168);
        }
        return new BoundingBox(this.center, this.xExtent, this.yExtent, this.zExtent);
        __touch(18163);
    };
    __touch(17956);
    return BoundingBox;
    __touch(17957);
});
__touch(17926);
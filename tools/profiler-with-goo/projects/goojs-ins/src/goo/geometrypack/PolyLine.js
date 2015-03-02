define([
    'goo/renderer/MeshData',
    'goo/geometrypack/Surface'
], function (MeshData, Surface) {
    'use strict';
    __touch(7963);
    function PolyLine(verts, closed) {
        this.verts = verts;
        __touch(7977);
        this.closed = !!closed;
        __touch(7978);
        var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
        __touch(7979);
        MeshData.call(this, attributeMap, this.verts.length / 3, this.verts.length / 3);
        __touch(7980);
        if (this.closed) {
            this.indexModes = ['LineLoop'];
            __touch(7982);
        } else {
            this.indexModes = ['LineStrip'];
            __touch(7983);
        }
        this.rebuild();
        __touch(7981);
    }
    __touch(7964);
    PolyLine.prototype = Object.create(MeshData.prototype);
    __touch(7965);
    PolyLine.prototype.rebuild = function () {
        this.getAttributeBuffer(MeshData.POSITION).set(this.verts);
        __touch(7984);
        var indices = [];
        __touch(7985);
        var nVerts = this.verts.length / 3;
        __touch(7986);
        for (var i = 0; i < nVerts; i++) {
            indices.push(i);
            __touch(7989);
        }
        this.getIndexBuffer().set(indices);
        __touch(7987);
        return this;
        __touch(7988);
    };
    __touch(7966);
    PolyLine.prototype.mul = function (that) {
        if (!(that instanceof PolyLine)) {
            return;
            __touch(7993);
        }
        var thatNVerts = that.verts.length / 3;
        __touch(7990);
        var verts = [];
        __touch(7991);
        for (var i = 0; i < this.verts.length; i += 3) {
            for (var j = 0; j < that.verts.length; j += 3) {
                verts.push(this.verts[i + 0] + that.verts[j + 0], this.verts[i + 1] + that.verts[j + 1], this.verts[i + 2] + that.verts[j + 2]);
                __touch(7994);
            }
        }
        return new Surface(verts, thatNVerts);
        __touch(7992);
    };
    __touch(7967);
    function getBisectorAngleOfVectors(vx1, vy1, vx2, vy2) {
        var d1 = Math.sqrt(vx1 * vx1 + vy1 * vy1);
        __touch(7995);
        var nx1 = vx1 / d1;
        __touch(7996);
        var ny1 = vy1 / d1;
        __touch(7997);
        var d2 = Math.sqrt(vx2 * vx2 + vy2 * vy2);
        __touch(7998);
        var nx2 = vx2 / d2;
        __touch(7999);
        var ny2 = vy2 / d2;
        __touch(8000);
        return Math.atan2(ny1 + ny2, nx1 + nx2) - Math.PI / 2;
        __touch(8001);
    }
    __touch(7968);
    function getBisectorAngle(verts, index) {
        var nVerts = verts.length / 3;
        __touch(8002);
        var p0x, p0z, p1x, p1z, p2x, p2z;
        __touch(8003);
        if (index === 0) {
            p1x = verts[0 * 3 + 0];
            __touch(8004);
            p1z = verts[0 * 3 + 2];
            __touch(8005);
            p2x = verts[1 * 3 + 0];
            __touch(8006);
            p2z = verts[1 * 3 + 2];
            __touch(8007);
            return Math.atan2(p2z - p1z, p2x - p1x) - Math.PI / 2;
            __touch(8008);
        } else if (index === nVerts - 1) {
            p0x = verts[(nVerts - 2) * 3 + 0];
            __touch(8009);
            p0z = verts[(nVerts - 2) * 3 + 2];
            __touch(8010);
            p1x = verts[(nVerts - 1) * 3 + 0];
            __touch(8011);
            p1z = verts[(nVerts - 1) * 3 + 2];
            __touch(8012);
            return Math.atan2(p1z - p0z, p1x - p0x) - Math.PI / 2;
            __touch(8013);
        } else {
            p0x = verts[(index - 1) * 3 + 0];
            __touch(8014);
            p0z = verts[(index - 1) * 3 + 2];
            __touch(8015);
            p1x = verts[index * 3 + 0];
            __touch(8016);
            p1z = verts[index * 3 + 2];
            __touch(8017);
            p2x = verts[(index + 1) * 3 + 0];
            __touch(8018);
            p2z = verts[(index + 1) * 3 + 2];
            __touch(8019);
            return getBisectorAngleOfVectors(p1x - p0x, p1z - p0z, p2x - p1x, p2z - p1z);
            __touch(8020);
        }
    }
    __touch(7969);
    PolyLine.prototype.pipe = function (that) {
        if (!(that instanceof PolyLine)) {
            console.error('pipe operation can only be applied to PolyLines');
            __touch(8024);
            return;
            __touch(8025);
        }
        var thatNVerts = that.verts.length / 3;
        __touch(8021);
        var verts = [];
        __touch(8022);
        for (var i = 0; i < this.verts.length; i += 3) {
            var k = getBisectorAngle(this.verts, i / 3);
            __touch(8026);
            for (var j = 0; j < that.verts.length; j += 3) {
                verts.push(this.verts[i + 0] + that.verts[j + 2] * Math.cos(k), this.verts[i + 1] + that.verts[j + 1], this.verts[i + 2] + that.verts[j + 2] * Math.sin(k));
                __touch(8027);
            }
        }
        return new Surface(verts, thatNVerts);
        __touch(8023);
    };
    __touch(7970);
    PolyLine.prototype.lathe = function (nSegments) {
        nSegments = nSegments || 8;
        __touch(8028);
        var ak = Math.PI * 2 / nSegments;
        __touch(8029);
        var verts = [];
        __touch(8030);
        for (var i = 0; i < this.verts.length; i += 3) {
            for (var j = 0, k = 0; j <= nSegments; j++, k += ak) {
                verts.push(Math.cos(k) * this.verts[i + 0], this.verts[i + 1], Math.sin(k) * this.verts[i + 0]);
                __touch(8032);
            }
        }
        return new Surface(verts, nSegments + 1, true);
        __touch(8031);
    };
    __touch(7971);
    PolyLine.prototype.concat = function (that, closed) {
        if (!(that instanceof PolyLine)) {
            console.error('concat operation can only be applied to PolyLines');
            __touch(8034);
            return;
            __touch(8035);
        }
        return new PolyLine(this.verts.concat(that.verts), closed);
        __touch(8033);
    };
    __touch(7972);
    PolyLine.fromCubicBezier = function (verts, nSegments, startFraction) {
        if (verts.length !== 3 * 4) {
            console.error('PolyLine.fromCubicBezier takes an array of exactly 12 coordinates');
            __touch(8044);
            return;
            __touch(8045);
        }
        nSegments = nSegments || 16;
        __touch(8036);
        startFraction = startFraction || 0;
        __touch(8037);
        var plVerts = [];
        __touch(8038);
        var p01 = [], p12 = [], p23 = [];
        __touch(8039);
        var p012 = [], p123 = [];
        __touch(8040);
        var p0123 = [];
        __touch(8041);
        for (var pas = startFraction; pas <= nSegments; pas++) {
            var rap = pas / nSegments;
            __touch(8046);
            p01[0] = verts[0 + 0] + (verts[3 + 0] - verts[0 + 0]) * rap;
            __touch(8047);
            p01[1] = verts[0 + 1] + (verts[3 + 1] - verts[0 + 1]) * rap;
            __touch(8048);
            p01[2] = verts[0 + 2] + (verts[3 + 2] - verts[0 + 2]) * rap;
            __touch(8049);
            p12[0] = verts[3 + 0] + (verts[6 + 0] - verts[3 + 0]) * rap;
            __touch(8050);
            p12[1] = verts[3 + 1] + (verts[6 + 1] - verts[3 + 1]) * rap;
            __touch(8051);
            p12[2] = verts[3 + 2] + (verts[6 + 2] - verts[3 + 2]) * rap;
            __touch(8052);
            p23[0] = verts[6 + 0] + (verts[9 + 0] - verts[6 + 0]) * rap;
            __touch(8053);
            p23[1] = verts[6 + 1] + (verts[9 + 1] - verts[6 + 1]) * rap;
            __touch(8054);
            p23[2] = verts[6 + 2] + (verts[9 + 2] - verts[6 + 2]) * rap;
            __touch(8055);
            p012[0] = p01[0] + (p12[0] - p01[0]) * rap;
            __touch(8056);
            p012[1] = p01[1] + (p12[1] - p01[1]) * rap;
            __touch(8057);
            p012[2] = p01[2] + (p12[2] - p01[2]) * rap;
            __touch(8058);
            p123[0] = p12[0] + (p23[0] - p12[0]) * rap;
            __touch(8059);
            p123[1] = p12[1] + (p23[1] - p12[1]) * rap;
            __touch(8060);
            p123[2] = p12[2] + (p23[2] - p12[2]) * rap;
            __touch(8061);
            p0123[0] = p012[0] + (p123[0] - p012[0]) * rap;
            __touch(8062);
            p0123[1] = p012[1] + (p123[1] - p012[1]) * rap;
            __touch(8063);
            p0123[2] = p012[2] + (p123[2] - p012[2]) * rap;
            __touch(8064);
            plVerts.push(p0123[0], p0123[1], p0123[2]);
            __touch(8065);
        }
        plVerts = verts.slice(0, 3).concat(plVerts);
        __touch(8042);
        return new PolyLine(plVerts);
        __touch(8043);
    };
    __touch(7973);
    PolyLine.fromQuadraticSpline = function (verts, nSegments, closed) {
        if (verts.length % 3 !== 0 && verts.length / 3 % 2 !== 0) {
            console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromQuadraticSpline');
            __touch(8069);
            return;
            __touch(8070);
        }
        var newVerts = [];
        __touch(8066);
        for (var i = 0; i < verts.length - 6; i += 6) {
            var p1 = verts.slice(i, i + 3);
            __touch(8071);
            var p2 = verts.slice(i + 3, i + 6);
            __touch(8072);
            var p3 = verts.slice(i + 6, i + 9);
            __touch(8073);
            newVerts.push.apply(newVerts, [
                p1[0],
                p1[1],
                p1[2],
                p1[0] + 2 / 3 * (p2[0] - p1[0]),
                p1[1] + 2 / 3 * (p2[1] - p1[1]),
                p1[2] + 2 / 3 * (p2[2] - p1[2]),
                p3[0] + 2 / 3 * (p2[0] - p3[0]),
                p3[1] + 2 / 3 * (p2[1] - p3[1]),
                p3[2] + 2 / 3 * (p2[2] - p3[2])
            ]);
            __touch(8074);
        }
        newVerts.push.apply(newVerts, verts.slice(verts.length - 3, verts.length));
        __touch(8067);
        return PolyLine.fromCubicSpline(newVerts, nSegments, closed);
        __touch(8068);
    };
    __touch(7974);
    PolyLine.fromCubicSpline = function (verts, nSegments, closed) {
        if (closed) {
            if (verts.length % 3 !== 0 && verts.length / 3 % 3 !== 0) {
                console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
                __touch(8081);
                return;
                __touch(8082);
            }
            var nVerts = verts.length / 3;
            __touch(8075);
            var nCurves = nVerts / 3;
            __touch(8076);
            var ret = PolyLine.fromCubicBezier(verts.slice(0 * 3, 0 * 3 + 4 * 3), nSegments, 1);
            __touch(8077);
            for (var i = 1; i < nCurves - 1; i++) {
                var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 4 * 3), nSegments, 1);
                __touch(8083);
                ret = ret.concat(plToAdd);
                __touch(8084);
            }
            var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 3 * 3).concat(verts.slice(0, 3)), nSegments, 1);
            __touch(8078);
            ret = ret.concat(plToAdd);
            __touch(8079);
            return ret;
            __touch(8080);
        } else {
            if (verts.length % 3 !== 0 && verts.length / 3 % 3 !== 1) {
                console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
                __touch(8089);
                return;
                __touch(8090);
            }
            var nVerts = verts.length / 3;
            __touch(8085);
            var nCurves = (nVerts - 1) / 3;
            __touch(8086);
            var ret = PolyLine.fromCubicBezier(verts.slice(0 * 3, 0 * 3 + 4 * 3), nSegments, 1);
            __touch(8087);
            for (var i = 1; i < nCurves; i++) {
                var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 4 * 3), nSegments, 1);
                __touch(8091);
                ret = ret.concat(plToAdd);
                __touch(8092);
            }
            return ret;
            __touch(8088);
        }
    };
    __touch(7975);
    return PolyLine;
    __touch(7976);
});
__touch(7962);
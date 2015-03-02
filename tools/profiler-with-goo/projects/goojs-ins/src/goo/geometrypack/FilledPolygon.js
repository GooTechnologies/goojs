define([
    'goo/renderer/MeshData',
    'goo/math/MathUtils'
], function (MeshData, MathUtils) {
    'use strict';
    __touch(7873);
    function FilledPolygon(verts, indices) {
        this.verts = verts;
        __touch(7882);
        this.indices = indices ? indices : getTriangulation(verts);
        __touch(7883);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(7884);
        MeshData.call(this, attributeMap, this.verts.length / 3, this.indices.length);
        __touch(7885);
        this.rebuild();
        __touch(7886);
    }
    __touch(7874);
    FilledPolygon.prototype = Object.create(MeshData.prototype);
    __touch(7875);
    function getTriangulation(p) {
        var n = p.length / 3;
        __touch(7887);
        if (n < 3) {
            return [];
            __touch(7895);
        }
        var tgs = [];
        __touch(7888);
        var avl = [];
        __touch(7889);
        for (var i = 0; i < n; i++) {
            avl.push(i);
            __touch(7896);
        }
        var i = 0;
        __touch(7890);
        var al = n;
        __touch(7891);
        while (al > 3) {
            var i0 = avl[(i + 0) % al];
            __touch(7897);
            var i1 = avl[(i + 1) % al];
            __touch(7898);
            var i2 = avl[(i + 2) % al];
            __touch(7899);
            var ax = p[3 * i0], ay = p[3 * i0 + 1];
            __touch(7900);
            var bx = p[3 * i1], by = p[3 * i1 + 1];
            __touch(7901);
            var cx = p[3 * i2], cy = p[3 * i2 + 1];
            __touch(7902);
            var earFound = false;
            __touch(7903);
            if (convex(ax, ay, bx, by, cx, cy)) {
                earFound = true;
                __touch(7904);
                for (var j = 0; j < al; j++) {
                    var vi = avl[j];
                    __touch(7905);
                    if (vi === i0 || vi === i1 || vi === i2) {
                        continue;
                        __touch(7906);
                    }
                    if (pointInTriangle(p[3 * vi], p[3 * vi + 1], ax, ay, bx, by, cx, cy)) {
                        earFound = false;
                        __touch(7907);
                        break;
                        __touch(7908);
                    }
                }
            }
            if (earFound) {
                tgs.push(i0, i1, i2);
                __touch(7909);
                avl.splice((i + 1) % al, 1);
                __touch(7910);
                al--;
                __touch(7911);
                i = 0;
                __touch(7912);
            } else {
                if (i++ > 3 * al) {
                    break;
                    __touch(7913);
                }
            }
        }
        __touch(7892);
        tgs.push(avl[0], avl[1], avl[2]);
        __touch(7893);
        return tgs;
        __touch(7894);
    }
    __touch(7876);
    function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
        var v0x = cx - ax;
        __touch(7914);
        var v0y = cy - ay;
        __touch(7915);
        var v1x = bx - ax;
        __touch(7916);
        var v1y = by - ay;
        __touch(7917);
        var v2x = px - ax;
        __touch(7918);
        var v2y = py - ay;
        __touch(7919);
        var dot00 = v0x * v0x + v0y * v0y;
        __touch(7920);
        var dot01 = v0x * v1x + v0y * v1y;
        __touch(7921);
        var dot02 = v0x * v2x + v0y * v2y;
        __touch(7922);
        var dot11 = v1x * v1x + v1y * v1y;
        __touch(7923);
        var dot12 = v1x * v2x + v1y * v2y;
        __touch(7924);
        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        __touch(7925);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        __touch(7926);
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        __touch(7927);
        return u >= 0 && v >= 0 && u + v < 1;
        __touch(7928);
    }
    __touch(7877);
    function convex(ax, ay, bx, by, cx, cy) {
        return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0;
        __touch(7929);
    }
    __touch(7878);
    FilledPolygon.prototype.rebuild = function () {
        this.getAttributeBuffer(MeshData.POSITION).set(this.verts);
        __touch(7930);
        var norms = [];
        __touch(7931);
        for (var i = 0; i < this.indices.length; i += 3) {
            var normal = MathUtils.getTriangleNormal(this.verts[this.indices[i + 0] * 3 + 0], this.verts[this.indices[i + 0] * 3 + 1], this.verts[this.indices[i + 0] * 3 + 2], this.verts[this.indices[i + 1] * 3 + 0], this.verts[this.indices[i + 1] * 3 + 1], this.verts[this.indices[i + 1] * 3 + 2], this.verts[this.indices[i + 2] * 3 + 0], this.verts[this.indices[i + 2] * 3 + 1], this.verts[this.indices[i + 2] * 3 + 2]);
            __touch(7940);
            norms[this.indices[i + 0] * 3 + 0] = normal[0];
            __touch(7941);
            norms[this.indices[i + 0] * 3 + 1] = normal[1];
            __touch(7942);
            norms[this.indices[i + 0] * 3 + 2] = normal[2];
            __touch(7943);
            norms[this.indices[i + 1] * 3 + 0] = normal[0];
            __touch(7944);
            norms[this.indices[i + 1] * 3 + 1] = normal[1];
            __touch(7945);
            norms[this.indices[i + 1] * 3 + 2] = normal[2];
            __touch(7946);
            norms[this.indices[i + 2] * 3 + 0] = normal[0];
            __touch(7947);
            norms[this.indices[i + 2] * 3 + 1] = normal[1];
            __touch(7948);
            norms[this.indices[i + 2] * 3 + 2] = normal[2];
            __touch(7949);
        }
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(7932);
        this.getIndexBuffer().set(this.indices);
        __touch(7933);
        var tex = [];
        __touch(7934);
        var bounds = getBounds(this.verts);
        __touch(7935);
        var extentX = bounds.maxX - bounds.minX;
        __touch(7936);
        var extentY = bounds.maxY - bounds.minY;
        __touch(7937);
        for (var i = 0; i < this.verts.length; i += 3) {
            var x = (this.verts[i + 0] - bounds.minX) / extentX;
            __touch(7950);
            var y = (this.verts[i + 1] - bounds.minY) / extentY;
            __touch(7951);
            tex.push(x, y);
            __touch(7952);
        }
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(7938);
        return this;
        __touch(7939);
    };
    __touch(7879);
    function getBounds(verts) {
        var minX = verts[0];
        __touch(7953);
        var maxX = verts[0];
        __touch(7954);
        var minY = verts[1];
        __touch(7955);
        var maxY = verts[1];
        __touch(7956);
        for (var i = 3; i < verts.length; i += 3) {
            minX = minX < verts[i + 0] ? minX : verts[i + 0];
            __touch(7958);
            maxX = maxX > verts[i + 0] ? maxX : verts[i + 0];
            __touch(7959);
            minY = minY < verts[i + 1] ? minY : verts[i + 1];
            __touch(7960);
            maxY = maxY > verts[i + 1] ? maxY : verts[i + 1];
            __touch(7961);
        }
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        };
        __touch(7957);
    }
    __touch(7880);
    return FilledPolygon;
    __touch(7881);
});
__touch(7872);
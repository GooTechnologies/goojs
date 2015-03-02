define([
    'goo/math/MathUtils',
    'goo/math/Matrix',
    'goo/math/Vector3'
], function (MathUtils, Matrix, Vector3) {
    'use strict';
    __touch(11021);
    function Matrix3x3() {
        Matrix.call(this, 3, 3);
        __touch(11062);
        if (arguments.length === 0) {
            this.setIdentity();
            __touch(11063);
        } else {
            Matrix.prototype.set.apply(this, arguments);
            __touch(11064);
        }
    }
    __touch(11022);
    Matrix3x3._tempX = new Vector3();
    __touch(11023);
    Matrix3x3._tempY = new Vector3();
    __touch(11024);
    Matrix3x3._tempZ = new Vector3();
    __touch(11025);
    Matrix3x3.prototype = Object.create(Matrix.prototype);
    __touch(11026);
    Matrix.setupAliases(Matrix3x3.prototype, [
        ['e00'],
        ['e10'],
        ['e20'],
        ['e01'],
        ['e11'],
        ['e21'],
        ['e02'],
        ['e12'],
        ['e22']
    ]);
    __touch(11027);
    Matrix3x3.IDENTITY = new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    __touch(11028);
    Matrix3x3.add = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11067);
        }
        var td = target.data, ld = lhs.data;
        __touch(11065);
        if (rhs instanceof Matrix3x3) {
            var rd = rhs.data;
            __touch(11068);
            td[0] = ld[0] + rd[0];
            __touch(11069);
            td[1] = ld[1] + rd[1];
            __touch(11070);
            td[2] = ld[2] + rd[2];
            __touch(11071);
            td[3] = ld[3] + rd[3];
            __touch(11072);
            td[4] = ld[4] + rd[4];
            __touch(11073);
            td[5] = ld[5] + rd[5];
            __touch(11074);
            td[6] = ld[6] + rd[6];
            __touch(11075);
            td[7] = ld[7] + rd[7];
            __touch(11076);
            td[8] = ld[8] + rd[8];
            __touch(11077);
        } else {
            td[0] = ld[0] + rhs;
            __touch(11078);
            td[1] = ld[1] + rhs;
            __touch(11079);
            td[2] = ld[2] + rhs;
            __touch(11080);
            td[3] = ld[3] + rhs;
            __touch(11081);
            td[4] = ld[4] + rhs;
            __touch(11082);
            td[5] = ld[5] + rhs;
            __touch(11083);
            td[6] = ld[6] + rhs;
            __touch(11084);
            td[7] = ld[7] + rhs;
            __touch(11085);
            td[8] = ld[8] + rhs;
            __touch(11086);
        }
        return target;
        __touch(11066);
    };
    __touch(11029);
    Matrix3x3.prototype.add = function (rhs) {
        return Matrix3x3.add(this, rhs, this);
        __touch(11087);
    };
    __touch(11030);
    Matrix3x3.sub = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11090);
        }
        var td = target.data, ld = lhs.data;
        __touch(11088);
        if (rhs instanceof Matrix3x3) {
            var rd = rhs.data;
            __touch(11091);
            td[0] = ld[0] - rd[0];
            __touch(11092);
            td[1] = ld[1] - rd[1];
            __touch(11093);
            td[2] = ld[2] - rd[2];
            __touch(11094);
            td[3] = ld[3] - rd[3];
            __touch(11095);
            td[4] = ld[4] - rd[4];
            __touch(11096);
            td[5] = ld[5] - rd[5];
            __touch(11097);
            td[6] = ld[6] - rd[6];
            __touch(11098);
            td[7] = ld[7] - rd[7];
            __touch(11099);
            td[8] = ld[8] - rd[8];
            __touch(11100);
        } else {
            td[0] = ld[0] - rhs;
            __touch(11101);
            td[1] = ld[1] - rhs;
            __touch(11102);
            td[2] = ld[2] - rhs;
            __touch(11103);
            td[3] = ld[3] - rhs;
            __touch(11104);
            td[4] = ld[4] - rhs;
            __touch(11105);
            td[5] = ld[5] - rhs;
            __touch(11106);
            td[6] = ld[6] - rhs;
            __touch(11107);
            td[7] = ld[7] - rhs;
            __touch(11108);
            td[8] = ld[8] - rhs;
            __touch(11109);
        }
        return target;
        __touch(11089);
    };
    __touch(11031);
    Matrix3x3.prototype.sub = function (rhs) {
        return Matrix3x3.sub(this, rhs, this);
        __touch(11110);
    };
    __touch(11032);
    Matrix3x3.mul = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11113);
        }
        var td = target.data, ld = lhs.data;
        __touch(11111);
        if (rhs instanceof Matrix3x3) {
            var rd = rhs.data;
            __touch(11114);
            td[0] = ld[0] * rd[0];
            __touch(11115);
            td[1] = ld[1] * rd[1];
            __touch(11116);
            td[2] = ld[2] * rd[2];
            __touch(11117);
            td[3] = ld[3] * rd[3];
            __touch(11118);
            td[4] = ld[4] * rd[4];
            __touch(11119);
            td[5] = ld[5] * rd[5];
            __touch(11120);
            td[6] = ld[6] * rd[6];
            __touch(11121);
            td[7] = ld[7] * rd[7];
            __touch(11122);
            td[8] = ld[8] * rd[8];
            __touch(11123);
        } else {
            td[0] = ld[0] * rhs;
            __touch(11124);
            td[1] = ld[1] * rhs;
            __touch(11125);
            td[2] = ld[2] * rhs;
            __touch(11126);
            td[3] = ld[3] * rhs;
            __touch(11127);
            td[4] = ld[4] * rhs;
            __touch(11128);
            td[5] = ld[5] * rhs;
            __touch(11129);
            td[6] = ld[6] * rhs;
            __touch(11130);
            td[7] = ld[7] * rhs;
            __touch(11131);
            td[8] = ld[8] * rhs;
            __touch(11132);
        }
        return target;
        __touch(11112);
    };
    __touch(11033);
    Matrix3x3.prototype.mul = function (rhs) {
        return Matrix3x3.mul(this, rhs, this);
        __touch(11133);
    };
    __touch(11034);
    Matrix3x3.div = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11136);
        }
        var td = target.data, ld = lhs.data;
        __touch(11134);
        if (rhs instanceof Matrix3x3) {
            var rd = rhs.data;
            __touch(11137);
            td[0] = ld[0] / rd[0];
            __touch(11138);
            td[1] = ld[1] / rd[1];
            __touch(11139);
            td[2] = ld[2] / rd[2];
            __touch(11140);
            td[3] = ld[3] / rd[3];
            __touch(11141);
            td[4] = ld[4] / rd[4];
            __touch(11142);
            td[5] = ld[5] / rd[5];
            __touch(11143);
            td[6] = ld[6] / rd[6];
            __touch(11144);
            td[7] = ld[7] / rd[7];
            __touch(11145);
            td[8] = ld[8] / rd[8];
            __touch(11146);
        } else {
            td[0] = ld[0] / rhs;
            __touch(11147);
            td[1] = ld[1] / rhs;
            __touch(11148);
            td[2] = ld[2] / rhs;
            __touch(11149);
            td[3] = ld[3] / rhs;
            __touch(11150);
            td[4] = ld[4] / rhs;
            __touch(11151);
            td[5] = ld[5] / rhs;
            __touch(11152);
            td[6] = ld[6] / rhs;
            __touch(11153);
            td[7] = ld[7] / rhs;
            __touch(11154);
            td[8] = ld[8] / rhs;
            __touch(11155);
        }
        return target;
        __touch(11135);
    };
    __touch(11035);
    Matrix3x3.prototype.div = function (rhs) {
        return Matrix3x3.div(this, rhs, this);
        __touch(11156);
    };
    __touch(11036);
    Matrix3x3.combine = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11172);
        }
        var s1d = lhs.data;
        __touch(11157);
        var m00 = s1d[0], m01 = s1d[3], m02 = s1d[6], m10 = s1d[1], m11 = s1d[4], m12 = s1d[7], m20 = s1d[2], m21 = s1d[5], m22 = s1d[8];
        __touch(11158);
        var s2d = rhs.data;
        __touch(11159);
        var n00 = s2d[0], n01 = s2d[3], n02 = s2d[6], n10 = s2d[1], n11 = s2d[4], n12 = s2d[7], n20 = s2d[2], n21 = s2d[5], n22 = s2d[8];
        __touch(11160);
        var rd = target.data;
        __touch(11161);
        rd[0] = m00 * n00 + m01 * n10 + m02 * n20;
        __touch(11162);
        rd[3] = m00 * n01 + m01 * n11 + m02 * n21;
        __touch(11163);
        rd[6] = m00 * n02 + m01 * n12 + m02 * n22;
        __touch(11164);
        rd[1] = m10 * n00 + m11 * n10 + m12 * n20;
        __touch(11165);
        rd[4] = m10 * n01 + m11 * n11 + m12 * n21;
        __touch(11166);
        rd[7] = m10 * n02 + m11 * n12 + m12 * n22;
        __touch(11167);
        rd[2] = m20 * n00 + m21 * n10 + m22 * n20;
        __touch(11168);
        rd[5] = m20 * n01 + m21 * n11 + m22 * n21;
        __touch(11169);
        rd[8] = m20 * n02 + m21 * n12 + m22 * n22;
        __touch(11170);
        return target;
        __touch(11171);
    };
    __touch(11037);
    Matrix3x3.prototype.combine = function (rhs) {
        return Matrix3x3.combine(this, rhs, this);
        __touch(11173);
    };
    __touch(11038);
    Matrix3x3.transpose = function (source, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11186);
        }
        var s = source.data;
        __touch(11174);
        var t = target.data;
        __touch(11175);
        if (target === source) {
            var e01 = s[3];
            __touch(11187);
            var e02 = s[6];
            __touch(11188);
            var e12 = s[7];
            __touch(11189);
            t[3] = s[1];
            __touch(11190);
            t[6] = s[2];
            __touch(11191);
            t[7] = s[5];
            __touch(11192);
            t[1] = e01;
            __touch(11193);
            t[2] = e02;
            __touch(11194);
            t[5] = e12;
            __touch(11195);
            return target;
            __touch(11196);
        }
        t[0] = s[0];
        __touch(11176);
        t[1] = s[3];
        __touch(11177);
        t[2] = s[6];
        __touch(11178);
        t[3] = s[1];
        __touch(11179);
        t[4] = s[4];
        __touch(11180);
        t[5] = s[7];
        __touch(11181);
        t[6] = s[2];
        __touch(11182);
        t[7] = s[5];
        __touch(11183);
        t[8] = s[8];
        __touch(11184);
        return target;
        __touch(11185);
    };
    __touch(11039);
    Matrix3x3.prototype.transpose = function () {
        return Matrix3x3.transpose(this, this);
        __touch(11197);
    };
    __touch(11040);
    Matrix3x3.invert = function (source, target) {
        if (!target) {
            target = new Matrix3x3();
            __touch(11211);
        }
        if (target === source) {
            return Matrix.copy(Matrix3x3.invert(source), target);
            __touch(11212);
        }
        var det = source.determinant();
        __touch(11198);
        if (Math.abs(det) < MathUtils.EPSILON) {
            return target;
            __touch(11213);
        }
        det = 1 / det;
        __touch(11199);
        var td = target.data, sd = source.data;
        __touch(11200);
        td[0] = (sd[4] * sd[8] - sd[7] * sd[5]) * det;
        __touch(11201);
        td[1] = (sd[7] * sd[2] - sd[1] * sd[8]) * det;
        __touch(11202);
        td[2] = (sd[1] * sd[5] - sd[4] * sd[2]) * det;
        __touch(11203);
        td[3] = (sd[6] * sd[5] - sd[3] * sd[8]) * det;
        __touch(11204);
        td[4] = (sd[0] * sd[8] - sd[6] * sd[2]) * det;
        __touch(11205);
        td[5] = (sd[3] * sd[2] - sd[0] * sd[5]) * det;
        __touch(11206);
        td[6] = (sd[3] * sd[7] - sd[6] * sd[4]) * det;
        __touch(11207);
        td[7] = (sd[6] * sd[1] - sd[0] * sd[7]) * det;
        __touch(11208);
        td[8] = (sd[0] * sd[4] - sd[3] * sd[1]) * det;
        __touch(11209);
        return target;
        __touch(11210);
    };
    __touch(11041);
    Matrix3x3.prototype.invert = function () {
        return Matrix3x3.invert(this, this);
        __touch(11214);
    };
    __touch(11042);
    Matrix3x3.prototype.isOrthogonal = function () {
        var d = this.data;
        __touch(11215);
        var dot = d[0] * d[3] + d[1] * d[4] + d[2] * d[5];
        __touch(11216);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11220);
        }
        dot = d[0] * d[6] + d[1] * d[7] + d[2] * d[8];
        __touch(11217);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11221);
        }
        dot = d[3] * d[6] + d[4] * d[7] + d[5] * d[8];
        __touch(11218);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11222);
        }
        return true;
        __touch(11219);
    };
    __touch(11043);
    Matrix3x3.prototype.isNormal = function () {
        var d = this.data;
        __touch(11223);
        var l = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
        __touch(11224);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11228);
        }
        l = d[3] * d[3] + d[4] * d[4] + d[5] * d[5];
        __touch(11225);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11229);
        }
        l = d[6] * d[6] + d[7] * d[7] + d[8] * d[8];
        __touch(11226);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11230);
        }
        return true;
        __touch(11227);
    };
    __touch(11044);
    Matrix3x3.prototype.isOrthonormal = function () {
        return this.isOrthogonal() && this.isNormal();
        __touch(11231);
    };
    __touch(11045);
    Matrix3x3.prototype.determinant = function () {
        var d = this.data;
        __touch(11232);
        return d[0] * (d[4] * d[8] - d[7] * d[5]) - d[3] * (d[1] * d[8] - d[7] * d[2]) + d[6] * (d[1] * d[5] - d[4] * d[2]);
        __touch(11233);
    };
    __touch(11046);
    Matrix3x3.prototype.setIdentity = function () {
        var d = this.data;
        __touch(11234);
        d[0] = 1;
        __touch(11235);
        d[1] = 0;
        __touch(11236);
        d[2] = 0;
        __touch(11237);
        d[3] = 0;
        __touch(11238);
        d[4] = 1;
        __touch(11239);
        d[5] = 0;
        __touch(11240);
        d[6] = 0;
        __touch(11241);
        d[7] = 0;
        __touch(11242);
        d[8] = 1;
        __touch(11243);
        return this;
        __touch(11244);
    };
    __touch(11047);
    Matrix3x3.prototype.applyPost = function (rhs) {
        var target = rhs.data;
        __touch(11245);
        var source = this.data;
        __touch(11246);
        var x = target[0];
        __touch(11247);
        var y = target[1];
        __touch(11248);
        var z = target[2];
        __touch(11249);
        target[0] = source[0] * x + source[3] * y + source[6] * z;
        __touch(11250);
        target[1] = source[1] * x + source[4] * y + source[7] * z;
        __touch(11251);
        target[2] = source[2] * x + source[5] * y + source[8] * z;
        __touch(11252);
        return rhs;
        __touch(11253);
    };
    __touch(11048);
    Matrix3x3.prototype.applyPre = function (rhs) {
        var target = rhs.data;
        __touch(11254);
        var source = this.data;
        __touch(11255);
        var x = target[0];
        __touch(11256);
        var y = target[1];
        __touch(11257);
        var z = target[2];
        __touch(11258);
        target[0] = source[0] * x + source[1] * y + source[2] * z;
        __touch(11259);
        target[1] = source[3] * x + source[4] * y + source[5] * z;
        __touch(11260);
        target[2] = source[6] * x + source[7] * y + source[8] * z;
        __touch(11261);
        return rhs;
        __touch(11262);
    };
    __touch(11049);
    Matrix3x3.prototype.multiplyDiagonalPost = function (vec, result) {
        var x = vec.data[0];
        __touch(11263);
        var y = vec.data[1];
        __touch(11264);
        var z = vec.data[2];
        __touch(11265);
        var d = this.data;
        __touch(11266);
        var r = result.data;
        __touch(11267);
        r[0] = x * d[0];
        __touch(11268);
        r[1] = x * d[1];
        __touch(11269);
        r[2] = x * d[2];
        __touch(11270);
        r[3] = y * d[3];
        __touch(11271);
        r[4] = y * d[4];
        __touch(11272);
        r[5] = y * d[5];
        __touch(11273);
        r[6] = z * d[6];
        __touch(11274);
        r[7] = z * d[7];
        __touch(11275);
        r[8] = z * d[8];
        __touch(11276);
        return result;
        __touch(11277);
    };
    __touch(11050);
    Matrix3x3.prototype.fromAngles = function (pitch, yaw, roll) {
        var cy = Math.cos(pitch);
        __touch(11278);
        var sy = Math.sin(pitch);
        __touch(11279);
        var ch = Math.cos(yaw);
        __touch(11280);
        var sh = Math.sin(yaw);
        __touch(11281);
        var cp = Math.cos(roll);
        __touch(11282);
        var sp = Math.sin(roll);
        __touch(11283);
        var d = this.data;
        __touch(11284);
        d[0] = ch * cp;
        __touch(11285);
        d[3] = sh * sy - ch * sp * cy;
        __touch(11286);
        d[6] = ch * sp * sy + sh * cy;
        __touch(11287);
        d[1] = sp;
        __touch(11288);
        d[4] = cp * cy;
        __touch(11289);
        d[7] = -cp * sy;
        __touch(11290);
        d[2] = -sh * cp;
        __touch(11291);
        d[5] = sh * sp * cy + ch * sy;
        __touch(11292);
        d[8] = -sh * sp * sy + ch * cy;
        __touch(11293);
        return this;
        __touch(11294);
    };
    __touch(11051);
    Matrix3x3.prototype.rotateX = function (rad, store) {
        store = store || this;
        __touch(11295);
        var a = this.data;
        __touch(11296);
        var out = store.data;
        __touch(11297);
        var s = Math.sin(rad), c = Math.cos(rad), a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
        __touch(11298);
        if (a !== out) {
            out[0] = a[0];
            __touch(11306);
            out[1] = a[1];
            __touch(11307);
            out[2] = a[2];
            __touch(11308);
        }
        out[3] = a10 * c + a20 * s;
        __touch(11299);
        out[4] = a11 * c + a21 * s;
        __touch(11300);
        out[5] = a12 * c + a22 * s;
        __touch(11301);
        out[6] = a20 * c - a10 * s;
        __touch(11302);
        out[7] = a21 * c - a11 * s;
        __touch(11303);
        out[8] = a22 * c - a12 * s;
        __touch(11304);
        return store;
        __touch(11305);
    };
    __touch(11052);
    Matrix3x3.prototype.rotateY = function (rad, store) {
        store = store || this;
        __touch(11309);
        var a = this.data;
        __touch(11310);
        var out = store.data;
        __touch(11311);
        var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a20 = a[6], a21 = a[7], a22 = a[8];
        __touch(11312);
        if (a !== out) {
            out[3] = a[3];
            __touch(11320);
            out[4] = a[4];
            __touch(11321);
            out[5] = a[5];
            __touch(11322);
        }
        out[0] = a00 * c - a20 * s;
        __touch(11313);
        out[1] = a01 * c - a21 * s;
        __touch(11314);
        out[2] = a02 * c - a22 * s;
        __touch(11315);
        out[6] = a00 * s + a20 * c;
        __touch(11316);
        out[7] = a01 * s + a21 * c;
        __touch(11317);
        out[8] = a02 * s + a22 * c;
        __touch(11318);
        return store;
        __touch(11319);
    };
    __touch(11053);
    Matrix3x3.prototype.rotateZ = function (rad, store) {
        store = store || this;
        __touch(11323);
        var a = this.data;
        __touch(11324);
        var out = store.data;
        __touch(11325);
        var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5];
        __touch(11326);
        if (a !== out) {
            out[6] = a[6];
            __touch(11334);
            out[7] = a[7];
            __touch(11335);
            out[8] = a[8];
            __touch(11336);
        }
        out[0] = a00 * c + a10 * s;
        __touch(11327);
        out[1] = a01 * c + a11 * s;
        __touch(11328);
        out[2] = a02 * c + a12 * s;
        __touch(11329);
        out[3] = a10 * c - a00 * s;
        __touch(11330);
        out[4] = a11 * c - a01 * s;
        __touch(11331);
        out[5] = a12 * c - a02 * s;
        __touch(11332);
        return store;
        __touch(11333);
    };
    __touch(11054);
    Matrix3x3.prototype.toAngles = function (store) {
        var result = store;
        __touch(11337);
        if (!result) {
            result = new Vector3();
            __touch(11341);
        }
        var d = this.data;
        __touch(11338);
        var rd = result.data;
        __touch(11339);
        if (d[3] > 1 - MathUtils.EPSILON) {
            rd[1] = Math.atan2(d[2], d[8]);
            __touch(11342);
            rd[2] = Math.PI / 2;
            __touch(11343);
            rd[0] = 0;
            __touch(11344);
        } else if (d[3] < -1 + MathUtils.EPSILON) {
            rd[1] = Math.atan2(d[2], d[8]);
            __touch(11345);
            rd[2] = -Math.PI / 2;
            __touch(11346);
            rd[0] = 0;
            __touch(11347);
        } else {
            rd[1] = Math.atan2(-d[2], d[0]);
            __touch(11348);
            rd[0] = Math.atan2(-d[7], d[4]);
            __touch(11349);
            rd[2] = Math.asin(d[1]);
            __touch(11350);
        }
        return result;
        __touch(11340);
    };
    __touch(11055);
    Matrix3x3.prototype.fromAngleNormalAxis = function (angle, x, y, z) {
        var fCos = Math.cos(angle);
        __touch(11351);
        var fSin = Math.sin(angle);
        __touch(11352);
        var fOneMinusCos = 1 - fCos;
        __touch(11353);
        var fX2 = x * x;
        __touch(11354);
        var fY2 = y * y;
        __touch(11355);
        var fZ2 = z * z;
        __touch(11356);
        var fXYM = x * y * fOneMinusCos;
        __touch(11357);
        var fXZM = x * z * fOneMinusCos;
        __touch(11358);
        var fYZM = y * z * fOneMinusCos;
        __touch(11359);
        var fXSin = x * fSin;
        __touch(11360);
        var fYSin = y * fSin;
        __touch(11361);
        var fZSin = z * fSin;
        __touch(11362);
        var d = this.data;
        __touch(11363);
        d[0] = fX2 * fOneMinusCos + fCos;
        __touch(11364);
        d[3] = fXYM - fZSin;
        __touch(11365);
        d[6] = fXZM + fYSin;
        __touch(11366);
        d[1] = fXYM + fZSin;
        __touch(11367);
        d[4] = fY2 * fOneMinusCos + fCos;
        __touch(11368);
        d[7] = fYZM - fXSin;
        __touch(11369);
        d[2] = fXZM - fYSin;
        __touch(11370);
        d[5] = fYZM + fXSin;
        __touch(11371);
        d[8] = fZ2 * fOneMinusCos + fCos;
        __touch(11372);
        return this;
        __touch(11373);
    };
    __touch(11056);
    Matrix3x3.prototype.lookAt = function (direction, up) {
        var x = Matrix3x3._tempX, y = Matrix3x3._tempY, z = Matrix3x3._tempZ;
        __touch(11374);
        z.setv(direction).normalize().muld(-1, -1, -1);
        __touch(11375);
        x.setv(up).cross(z).normalize();
        __touch(11376);
        if (x.equals(Vector3.ZERO)) {
            if (z.data[0] !== 0) {
                x.setd(z.data[1], -z.data[0], 0);
                __touch(11389);
            } else {
                x.setd(0, z.data[2], -z.data[1]);
                __touch(11390);
            }
        }
        y.setv(z).cross(x);
        __touch(11377);
        var d = this.data;
        __touch(11378);
        d[0] = x.data[0];
        __touch(11379);
        d[1] = x.data[1];
        __touch(11380);
        d[2] = x.data[2];
        __touch(11381);
        d[3] = y.data[0];
        __touch(11382);
        d[4] = y.data[1];
        __touch(11383);
        d[5] = y.data[2];
        __touch(11384);
        d[6] = z.data[0];
        __touch(11385);
        d[7] = z.data[1];
        __touch(11386);
        d[8] = z.data[2];
        __touch(11387);
        return this;
        __touch(11388);
    };
    __touch(11057);
    Matrix3x3.prototype.copyQuaternion = function (quaternion) {
        return quaternion.toRotationMatrix(this);
        __touch(11391);
    };
    __touch(11058);
    Matrix3x3.prototype.copy = function (source) {
        var t = this.data;
        __touch(11392);
        var s = source.data;
        __touch(11393);
        t[0] = s[0];
        __touch(11394);
        t[1] = s[1];
        __touch(11395);
        t[2] = s[2];
        __touch(11396);
        t[3] = s[3];
        __touch(11397);
        t[4] = s[4];
        __touch(11398);
        t[5] = s[5];
        __touch(11399);
        t[6] = s[6];
        __touch(11400);
        t[7] = s[7];
        __touch(11401);
        t[8] = s[8];
        __touch(11402);
        return this;
        __touch(11403);
    };
    __touch(11059);
    Matrix3x3.prototype.clone = function () {
        var d = this.data;
        __touch(11404);
        return new Matrix3x3(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]);
        __touch(11405);
    };
    __touch(11060);
    return Matrix3x3;
    __touch(11061);
});
__touch(11020);
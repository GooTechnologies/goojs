define([
    'goo/math/Vector',
    'goo/math/Vector3',
    'goo/math/Matrix3x3',
    'goo/math/MathUtils'
], function (Vector, Vector3, Matrix3x3, MathUtils) {
    'use strict';
    __touch(11886);
    function Quaternion() {
        Vector.call(this, 4);
        __touch(11927);
        if (arguments.length !== 0) {
            this.set(arguments);
            __touch(11928);
        } else {
            this.setd(0, 0, 0, 1);
            __touch(11929);
        }
    }
    __touch(11887);
    Quaternion.prototype = Object.create(Vector.prototype);
    __touch(11888);
    Vector.setupAliases(Quaternion.prototype, [
        ['x'],
        ['y'],
        ['z'],
        ['w']
    ]);
    __touch(11889);
    Quaternion.IDENTITY = new Quaternion(0, 0, 0, 1);
    __touch(11890);
    Quaternion.ALLOWED_DEVIANCE = 1e-8;
    __touch(11891);
    Quaternion.add = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11935);
        }
        target.data[0] = lhs.data[0] + rhs.data[0];
        __touch(11930);
        target.data[1] = lhs.data[1] + rhs.data[1];
        __touch(11931);
        target.data[2] = lhs.data[2] + rhs.data[2];
        __touch(11932);
        target.data[3] = lhs.data[3] + rhs.data[3];
        __touch(11933);
        return target;
        __touch(11934);
    };
    __touch(11892);
    Quaternion.sub = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11941);
        }
        target.data[0] = lhs.data[0] - rhs.data[0];
        __touch(11936);
        target.data[1] = lhs.data[1] - rhs.data[1];
        __touch(11937);
        target.data[2] = lhs.data[2] - rhs.data[2];
        __touch(11938);
        target.data[3] = lhs.data[3] - rhs.data[3];
        __touch(11939);
        return target;
        __touch(11940);
    };
    __touch(11893);
    Quaternion.mul = function (a, b, out) {
        var ax = a.data[0], ay = a.data[1], az = a.data[2], aw = a.data[3], bx = b.data[0], by = b.data[1], bz = b.data[2], bw = b.data[3];
        __touch(11942);
        out.data[0] = ax * bw + aw * bx + ay * bz - az * by;
        __touch(11943);
        out.data[1] = ay * bw + aw * by + az * bx - ax * bz;
        __touch(11944);
        out.data[2] = az * bw + aw * bz + ax * by - ay * bx;
        __touch(11945);
        out.data[3] = aw * bw - ax * bx - ay * by - az * bz;
        __touch(11946);
        return out;
        __touch(11947);
    };
    __touch(11894);
    Quaternion.div = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11954);
        }
        var clean = true;
        __touch(11948);
        target.data[0] = (clean &= rhs.data[0] < 0 || rhs.data[0] > 0) ? lhs.data[0] / rhs.data[0] : 0;
        __touch(11949);
        target.data[1] = (clean &= rhs.data[1] < 0 || rhs.data[1] > 0) ? lhs.data[1] / rhs.data[1] : 0;
        __touch(11950);
        target.data[2] = (clean &= rhs.data[2] < 0 || rhs.data[2] > 0) ? lhs.data[2] / rhs.data[2] : 0;
        __touch(11951);
        target.data[3] = (clean &= rhs.data[3] < 0 || rhs.data[3] > 0) ? lhs.data[3] / rhs.data[3] : 0;
        __touch(11952);
        return target;
        __touch(11953);
    };
    __touch(11895);
    Quaternion.scalarAdd = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11960);
        }
        target.data[0] = lhs.data[0] + rhs;
        __touch(11955);
        target.data[1] = lhs.data[1] + rhs;
        __touch(11956);
        target.data[2] = lhs.data[2] + rhs;
        __touch(11957);
        target.data[3] = lhs.data[3] + rhs;
        __touch(11958);
        return target;
        __touch(11959);
    };
    __touch(11896);
    Quaternion.scalarSub = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11966);
        }
        target.data[0] = lhs.data[0] - rhs;
        __touch(11961);
        target.data[1] = lhs.data[1] - rhs;
        __touch(11962);
        target.data[2] = lhs.data[2] - rhs;
        __touch(11963);
        target.data[3] = lhs.data[3] - rhs;
        __touch(11964);
        return target;
        __touch(11965);
    };
    __touch(11897);
    Quaternion.scalarMul = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11972);
        }
        target.data[0] = lhs.data[0] * rhs;
        __touch(11967);
        target.data[1] = lhs.data[1] * rhs;
        __touch(11968);
        target.data[2] = lhs.data[2] * rhs;
        __touch(11969);
        target.data[3] = lhs.data[3] * rhs;
        __touch(11970);
        return target;
        __touch(11971);
    };
    __touch(11898);
    Quaternion.scalarDiv = function (lhs, rhs, target) {
        if (!target) {
            target = new Quaternion();
            __touch(11980);
        }
        var clean = true;
        __touch(11973);
        rhs = (clean &= rhs < 0 || rhs > 0) ? 1 / rhs : 0;
        __touch(11974);
        target.data[0] = lhs.data[0] * rhs;
        __touch(11975);
        target.data[1] = lhs.data[1] * rhs;
        __touch(11976);
        target.data[2] = lhs.data[2] * rhs;
        __touch(11977);
        target.data[3] = lhs.data[3] * rhs;
        __touch(11978);
        return target;
        __touch(11979);
    };
    __touch(11899);
    Quaternion.slerp = function (startQuat, endQuat, changeAmnt, workQuat) {
        if (changeAmnt === 0) {
            return workQuat.setv(startQuat);
            __touch(11991);
        } else if (changeAmnt === 1) {
            return workQuat.setv(endQuat);
            __touch(11992);
        }
        if (startQuat.equals(endQuat)) {
            return workQuat.setv(startQuat);
            __touch(11993);
        }
        var result = startQuat.dot(endQuat);
        __touch(11981);
        workQuat.setv(endQuat);
        __touch(11982);
        if (result < 0) {
            workQuat.negate();
            __touch(11994);
            result = -result;
            __touch(11995);
        }
        var scale0 = 1 - changeAmnt;
        __touch(11983);
        var scale1 = changeAmnt;
        __touch(11984);
        if (1 - result > 0.1) {
            var theta = Math.acos(result);
            __touch(11996);
            var invSinTheta = 1 / Math.sin(theta);
            __touch(11997);
            scale0 = Math.sin((1 - changeAmnt) * theta) * invSinTheta;
            __touch(11998);
            scale1 = Math.sin(changeAmnt * theta) * invSinTheta;
            __touch(11999);
        }
        var x = scale0 * startQuat.data[0] + scale1 * workQuat.data[0];
        __touch(11985);
        var y = scale0 * startQuat.data[1] + scale1 * workQuat.data[1];
        __touch(11986);
        var z = scale0 * startQuat.data[2] + scale1 * workQuat.data[2];
        __touch(11987);
        var w = scale0 * startQuat.data[3] + scale1 * workQuat.data[3];
        __touch(11988);
        workQuat.setd(x, y, z, w);
        __touch(11989);
        return workQuat;
        __touch(11990);
    };
    __touch(11900);
    Quaternion.prototype.negate = function () {
        this.data[0] *= -1;
        __touch(12000);
        this.data[1] *= -1;
        __touch(12001);
        this.data[2] *= -1;
        __touch(12002);
        this.data[3] *= -1;
        __touch(12003);
        return this;
        __touch(12004);
    };
    __touch(11901);
    Quaternion.prototype.dot = function (rhs) {
        var ldata = this.data;
        __touch(12005);
        var rdata = rhs.data || rhs;
        __touch(12006);
        var sum = 0;
        __touch(12007);
        sum += ldata[0] * rdata[0];
        __touch(12008);
        sum += ldata[1] * rdata[1];
        __touch(12009);
        sum += ldata[2] * rdata[2];
        __touch(12010);
        sum += ldata[3] * rdata[3];
        __touch(12011);
        return sum;
        __touch(12012);
    };
    __touch(11902);
    Quaternion.prototype.add = function (rhs) {
        return Quaternion.add(this, rhs, this);
        __touch(12013);
    };
    __touch(11903);
    Quaternion.prototype.sub = function (rhs) {
        return Quaternion.sub(this, rhs, this);
        __touch(12014);
    };
    __touch(11904);
    Quaternion.prototype.mul = function (rhs) {
        return Quaternion.mul(this, rhs, this);
        __touch(12015);
    };
    __touch(11905);
    Quaternion.prototype.div = function (rhs) {
        return Quaternion.div(this, rhs, this);
        __touch(12016);
    };
    __touch(11906);
    Quaternion.prototype.scalarAdd = function (rhs) {
        return Quaternion.scalarAdd(this, rhs, this);
        __touch(12017);
    };
    __touch(11907);
    Quaternion.prototype.scalarSub = function (rhs) {
        return Quaternion.scalarSub(this, rhs, this);
        __touch(12018);
    };
    __touch(11908);
    Quaternion.prototype.scalarMul = function (rhs) {
        return Quaternion.scalarMul(this, rhs, this);
        __touch(12019);
    };
    __touch(11909);
    Quaternion.prototype.scalarDiv = function (rhs) {
        return Quaternion.scalarDiv(this, rhs, this);
        __touch(12020);
    };
    __touch(11910);
    var slerp_work_quat;
    __touch(11911);
    Quaternion.prototype.slerp = function (endQuat, changeAmnt) {
        if (!slerp_work_quat) {
            slerp_work_quat = new Quaternion();
            __touch(12025);
        }
        slerp_work_quat.copy(endQuat);
        __touch(12021);
        Quaternion.slerp(this, endQuat, changeAmnt, slerp_work_quat);
        __touch(12022);
        this.copy(slerp_work_quat);
        __touch(12023);
        return this;
        __touch(12024);
    };
    __touch(11912);
    Quaternion.prototype.fromRotationMatrix = function (matrix) {
        var t = matrix.e00 + matrix.e11 + matrix.e22;
        __touch(12026);
        var x, y, z, w;
        __touch(12027);
        if (t >= 0) {
            var s = Math.sqrt(t + 1);
            __touch(12029);
            w = 0.5 * s;
            __touch(12030);
            s = 0.5 / s;
            __touch(12031);
            x = (matrix.e21 - matrix.e12) * s;
            __touch(12032);
            y = (matrix.e02 - matrix.e20) * s;
            __touch(12033);
            z = (matrix.e10 - matrix.e01) * s;
            __touch(12034);
        } else if (matrix.e00 > matrix.e11 && matrix.e00 > matrix.e22) {
            var s = Math.sqrt(1 + matrix.e00 - matrix.e11 - matrix.e22);
            __touch(12035);
            x = s * 0.5;
            __touch(12036);
            s = 0.5 / s;
            __touch(12037);
            y = (matrix.e10 + matrix.e01) * s;
            __touch(12038);
            z = (matrix.e02 + matrix.e20) * s;
            __touch(12039);
            w = (matrix.e21 - matrix.e12) * s;
            __touch(12040);
        } else if (matrix.e11 > matrix.e22) {
            var s = Math.sqrt(1 + matrix.e11 - matrix.e00 - matrix.e22);
            __touch(12041);
            y = s * 0.5;
            __touch(12042);
            s = 0.5 / s;
            __touch(12043);
            x = (matrix.e10 + matrix.e01) * s;
            __touch(12044);
            z = (matrix.e21 + matrix.e12) * s;
            __touch(12045);
            w = (matrix.e02 - matrix.e20) * s;
            __touch(12046);
        } else {
            var s = Math.sqrt(1 + matrix.e22 - matrix.e00 - matrix.e11);
            __touch(12047);
            z = s * 0.5;
            __touch(12048);
            s = 0.5 / s;
            __touch(12049);
            x = (matrix.e02 + matrix.e20) * s;
            __touch(12050);
            y = (matrix.e21 + matrix.e12) * s;
            __touch(12051);
            w = (matrix.e10 - matrix.e01) * s;
            __touch(12052);
        }
        return this.set(x, y, z, w);
        __touch(12028);
    };
    __touch(11913);
    Quaternion.prototype.toRotationMatrix = function (store) {
        var result = store;
        __touch(12053);
        if (!result) {
            result = new Matrix3x3();
            __touch(12080);
        }
        var norm = this.magnitudeSquared();
        __touch(12054);
        var s = norm > 0 ? 2 / norm : 0;
        __touch(12055);
        var d = this.data;
        __touch(12056);
        var xs = d[0] * s;
        __touch(12057);
        var ys = d[1] * s;
        __touch(12058);
        var zs = d[2] * s;
        __touch(12059);
        var xx = d[0] * xs;
        __touch(12060);
        var xy = d[0] * ys;
        __touch(12061);
        var xz = d[0] * zs;
        __touch(12062);
        var xw = d[3] * xs;
        __touch(12063);
        var yy = d[1] * ys;
        __touch(12064);
        var yz = d[1] * zs;
        __touch(12065);
        var yw = d[3] * ys;
        __touch(12066);
        var zz = d[2] * zs;
        __touch(12067);
        var zw = d[3] * zs;
        __touch(12068);
        var t = result.data;
        __touch(12069);
        t[0] = 1 - (yy + zz);
        __touch(12070);
        t[1] = xy + zw;
        __touch(12071);
        t[2] = xz - yw;
        __touch(12072);
        t[3] = xy - zw;
        __touch(12073);
        t[4] = 1 - (xx + zz);
        __touch(12074);
        t[5] = yz + xw;
        __touch(12075);
        t[6] = xz + yw;
        __touch(12076);
        t[7] = yz - xw;
        __touch(12077);
        t[8] = 1 - (xx + yy);
        __touch(12078);
        return result;
        __touch(12079);
    };
    __touch(11914);
    Quaternion.prototype.fromVectorToVector = function (from, to) {
        var a = from;
        __touch(12081);
        var b = to;
        __touch(12082);
        var factor = a.length() * b.length();
        __touch(12083);
        if (Math.abs(factor) > MathUtils.EPSILON) {
            var pivotVector = new Vector3();
            __touch(12084);
            var dot = a.dot(b) / factor;
            __touch(12085);
            var theta = Math.acos(Math.max(-1, Math.min(dot, 1)));
            __touch(12086);
            Vector3.cross(a, b, pivotVector);
            __touch(12087);
            if (dot < 0 && pivotVector.length() < MathUtils.EPSILON) {
                var dominantIndex;
                __touch(12089);
                if (Math.abs(a.x) > Math.abs(a.y)) {
                    if (Math.abs(a.x) > Math.abs(a.z)) {
                        dominantIndex = 0;
                        __touch(12093);
                    } else {
                        dominantIndex = 2;
                        __touch(12094);
                    }
                } else {
                    if (Math.abs(a.y) > Math.abs(a.z)) {
                        dominantIndex = 1;
                        __touch(12095);
                    } else {
                        dominantIndex = 2;
                        __touch(12096);
                    }
                }
                pivotVector.setValue(dominantIndex, -a[(dominantIndex + 1) % 3]);
                __touch(12090);
                pivotVector.setValue((dominantIndex + 1) % 3, a[dominantIndex]);
                __touch(12091);
                pivotVector.setValue((dominantIndex + 2) % 3, 0);
                __touch(12092);
            }
            return this.fromAngleAxis(theta, pivotVector);
            __touch(12088);
        } else {
            return this.set(Quaternion.IDENTITY);
            __touch(12097);
        }
    };
    __touch(11915);
    Quaternion.prototype.normalize = function () {
        var n = 1 / this.magnitude();
        __touch(12098);
        var xx = this.x * n;
        __touch(12099);
        var yy = this.y * n;
        __touch(12100);
        var zz = this.z * n;
        __touch(12101);
        var ww = this.w * n;
        __touch(12102);
        return this.set(xx, yy, zz, ww);
        __touch(12103);
    };
    __touch(11916);
    Quaternion.prototype.magnitude = function () {
        var magnitudeSQ = this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2] + this.data[3] * this.data[3];
        __touch(12104);
        if (magnitudeSQ === 1) {
            return 1;
            __touch(12106);
        }
        return Math.sqrt(magnitudeSQ);
        __touch(12105);
    };
    __touch(11917);
    Quaternion.prototype.magnitudeSquared = function () {
        return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2] + this.data[3] * this.data[3];
        __touch(12107);
    };
    __touch(11918);
    Quaternion.prototype.fromAngleAxis = function (angle, axis) {
        var temp = new Vector3(axis).normalize();
        __touch(12108);
        return this.fromAngleNormalAxis(angle, temp);
        __touch(12109);
    };
    __touch(11919);
    Quaternion.prototype.fromAngleNormalAxis = function (angle, axis) {
        if (axis.equals(Vector3.ZERO)) {
            return this.set(Quaternion.IDENTITY);
            __touch(12117);
        }
        var halfAngle = 0.5 * angle;
        __touch(12110);
        var sin = Math.sin(halfAngle);
        __touch(12111);
        var w = Math.cos(halfAngle);
        __touch(12112);
        var x = sin * axis.x;
        __touch(12113);
        var y = sin * axis.y;
        __touch(12114);
        var z = sin * axis.z;
        __touch(12115);
        return this.set(x, y, z, w);
        __touch(12116);
    };
    __touch(11920);
    Quaternion.prototype.toAngleAxis = function (axisStore) {
        var sqrLength = this.x * this.x + this.y * this.y + this.z * this.z;
        __touch(12118);
        var angle;
        __touch(12119);
        if (Math.abs(sqrLength) <= Quaternion.ALLOWED_DEVIANCE) {
            angle = 0;
            __touch(12121);
            if (axisStore !== null) {
                axisStore.x = 1;
                __touch(12122);
                axisStore.y = 0;
                __touch(12123);
                axisStore.z = 0;
                __touch(12124);
            }
        } else {
            angle = 2 * Math.acos(this.w);
            __touch(12125);
            if (axisStore !== null) {
                var invLength = 1 / Math.sqrt(sqrLength);
                __touch(12126);
                axisStore.x = this.x * invLength;
                __touch(12127);
                axisStore.y = this.y * invLength;
                __touch(12128);
                axisStore.z = this.z * invLength;
                __touch(12129);
            }
        }
        return angle;
        __touch(12120);
    };
    __touch(11921);
    Quaternion.prototype.equals = function (o) {
        if (this === o) {
            return true;
            __touch(12131);
        }
        if (!(o instanceof Quaternion)) {
            return false;
            __touch(12132);
        }
        return Math.abs(this.data[0] - o.data[0]) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.data[1] - o.data[1]) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.data[2] - o.data[2]) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.data[3] - o.data[3]) < Quaternion.ALLOWED_DEVIANCE;
        __touch(12130);
    };
    __touch(11922);
    Quaternion.prototype.setd = function (x, y, z, w) {
        this.data[0] = x;
        __touch(12133);
        this.data[1] = y;
        __touch(12134);
        this.data[2] = z;
        __touch(12135);
        this.data[3] = w;
        __touch(12136);
        return this;
        __touch(12137);
    };
    __touch(11923);
    Quaternion.prototype.seta = function (array) {
        this.data[0] = array[0];
        __touch(12138);
        this.data[1] = array[1];
        __touch(12139);
        this.data[2] = array[2];
        __touch(12140);
        this.data[3] = array[3];
        __touch(12141);
        return this;
        __touch(12142);
    };
    __touch(11924);
    Quaternion.prototype.setv = function (quat) {
        this.data[0] = quat.data[0];
        __touch(12143);
        this.data[1] = quat.data[1];
        __touch(12144);
        this.data[2] = quat.data[2];
        __touch(12145);
        this.data[3] = quat.data[3];
        __touch(12146);
        return this;
        __touch(12147);
    };
    __touch(11925);
    return Quaternion;
    __touch(11926);
});
__touch(11885);
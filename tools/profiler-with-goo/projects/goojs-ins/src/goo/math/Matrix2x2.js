define([
    'goo/math/MathUtils',
    'goo/math/Matrix'
], function (MathUtils, Matrix) {
    'use strict';
    __touch(10895);
    function Matrix2x2() {
        Matrix.call(this, 2, 2);
        __touch(10922);
        if (arguments.length === 0) {
            this.setIdentity();
            __touch(10923);
        } else {
            Matrix.prototype.set.apply(this, arguments);
            __touch(10924);
        }
    }
    __touch(10896);
    Matrix2x2.prototype = Object.create(Matrix.prototype);
    __touch(10897);
    Matrix.setupAliases(Matrix2x2.prototype, [
        ['e00'],
        ['e10'],
        ['e01'],
        ['e11']
    ]);
    __touch(10898);
    Matrix2x2.IDENTITY = new Matrix2x2(1, 0, 0, 1);
    __touch(10899);
    Matrix2x2.add = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10926);
        }
        if (rhs instanceof Matrix2x2) {
            target.e00 = lhs.e00 + rhs.e00;
            __touch(10927);
            target.e10 = lhs.e10 + rhs.e10;
            __touch(10928);
            target.e01 = lhs.e01 + rhs.e01;
            __touch(10929);
            target.e11 = lhs.e11 + rhs.e11;
            __touch(10930);
        } else {
            target.e00 = lhs.e00 + rhs;
            __touch(10931);
            target.e10 = lhs.e10 + rhs;
            __touch(10932);
            target.e01 = lhs.e01 + rhs;
            __touch(10933);
            target.e11 = lhs.e11 + rhs;
            __touch(10934);
        }
        return target;
        __touch(10925);
    };
    __touch(10900);
    Matrix2x2.prototype.add = function (rhs) {
        return Matrix2x2.add(this, rhs, this);
        __touch(10935);
    };
    __touch(10901);
    Matrix2x2.sub = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10937);
        }
        if (rhs instanceof Matrix2x2) {
            target.e00 = lhs.e00 - rhs.e00;
            __touch(10938);
            target.e10 = lhs.e10 - rhs.e10;
            __touch(10939);
            target.e01 = lhs.e01 - rhs.e01;
            __touch(10940);
            target.e11 = lhs.e11 - rhs.e11;
            __touch(10941);
        } else {
            target.e00 = lhs.e00 - rhs;
            __touch(10942);
            target.e10 = lhs.e10 - rhs;
            __touch(10943);
            target.e01 = lhs.e01 - rhs;
            __touch(10944);
            target.e11 = lhs.e11 - rhs;
            __touch(10945);
        }
        return target;
        __touch(10936);
    };
    __touch(10902);
    Matrix2x2.prototype.sub = function (rhs) {
        return Matrix2x2.sub(this, rhs, this);
        __touch(10946);
    };
    __touch(10903);
    Matrix2x2.mul = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10948);
        }
        if (rhs instanceof Matrix2x2) {
            target.e00 = lhs.e00 * rhs.e00;
            __touch(10949);
            target.e10 = lhs.e10 * rhs.e10;
            __touch(10950);
            target.e01 = lhs.e01 * rhs.e01;
            __touch(10951);
            target.e11 = lhs.e11 * rhs.e11;
            __touch(10952);
        } else {
            target.e00 = lhs.e00 * rhs;
            __touch(10953);
            target.e10 = lhs.e10 * rhs;
            __touch(10954);
            target.e01 = lhs.e01 * rhs;
            __touch(10955);
            target.e11 = lhs.e11 * rhs;
            __touch(10956);
        }
        return target;
        __touch(10947);
    };
    __touch(10904);
    Matrix2x2.prototype.mul = function (rhs) {
        return Matrix2x2.mul(this, rhs, this);
        __touch(10957);
    };
    __touch(10905);
    Matrix2x2.div = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10959);
        }
        if (rhs instanceof Matrix2x2) {
            target.e00 = lhs.e00 / rhs.e00;
            __touch(10960);
            target.e10 = lhs.e10 / rhs.e10;
            __touch(10961);
            target.e01 = lhs.e01 / rhs.e01;
            __touch(10962);
            target.e11 = lhs.e11 / rhs.e11;
            __touch(10963);
        } else {
            rhs = 1 / rhs;
            __touch(10964);
            target.e00 = lhs.e00 * rhs;
            __touch(10965);
            target.e10 = lhs.e10 * rhs;
            __touch(10966);
            target.e01 = lhs.e01 * rhs;
            __touch(10967);
            target.e11 = lhs.e11 * rhs;
            __touch(10968);
        }
        return target;
        __touch(10958);
    };
    __touch(10906);
    Matrix2x2.prototype.div = function (rhs) {
        return Matrix2x2.div(this, rhs, this);
        __touch(10969);
    };
    __touch(10907);
    Matrix2x2.combine = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10975);
        }
        if (target === lhs || target === rhs) {
            return Matrix.copy(Matrix2x2.combine(lhs, rhs), target);
            __touch(10976);
        }
        target.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10;
        __touch(10970);
        target.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10;
        __touch(10971);
        target.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11;
        __touch(10972);
        target.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11;
        __touch(10973);
        return target;
        __touch(10974);
    };
    __touch(10908);
    Matrix2x2.prototype.combine = function (rhs) {
        return Matrix2x2.combine(this, rhs, this);
        __touch(10977);
    };
    __touch(10909);
    Matrix2x2.transpose = function (source, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10983);
        }
        if (target === source) {
            return Matrix.copy(Matrix2x2.transpose(source), target);
            __touch(10984);
        }
        target.e00 = source.e00;
        __touch(10978);
        target.e10 = source.e01;
        __touch(10979);
        target.e01 = source.e10;
        __touch(10980);
        target.e11 = source.e11;
        __touch(10981);
        return target;
        __touch(10982);
    };
    __touch(10910);
    Matrix2x2.prototype.transpose = function () {
        return Matrix2x2.transpose(this, this);
        __touch(10985);
    };
    __touch(10911);
    Matrix2x2.invert = function (source, target) {
        if (!target) {
            target = new Matrix2x2();
            __touch(10993);
        }
        if (target === source) {
            return Matrix.copy(Matrix2x2.invert(source), target);
            __touch(10994);
        }
        var det = source.determinant();
        __touch(10986);
        if (Math.abs(det) < MathUtils.EPSILON) {
            return target;
            __touch(10995);
        }
        det = 1 / det;
        __touch(10987);
        target.e00 = source.e11 * det;
        __touch(10988);
        target.e10 = 0 - source.e10 * det;
        __touch(10989);
        target.e01 = 0 - source.e01 * det;
        __touch(10990);
        target.e11 = source.e00 * det;
        __touch(10991);
        return target;
        __touch(10992);
    };
    __touch(10912);
    Matrix2x2.prototype.invert = function () {
        return Matrix2x2.invert(this, this);
        __touch(10996);
    };
    __touch(10913);
    Matrix2x2.prototype.isOrthogonal = function () {
        var dot;
        __touch(10997);
        dot = this.e00 * this.e01 + this.e10 * this.e11;
        __touch(10998);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11000);
        }
        return true;
        __touch(10999);
    };
    __touch(10914);
    Matrix2x2.prototype.isNormal = function () {
        var l;
        __touch(11001);
        l = this.e00 * this.e00 + this.e10 * this.e10;
        __touch(11002);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11005);
        }
        l = this.e01 * this.e01 + this.e11 * this.e11;
        __touch(11003);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11006);
        }
        return true;
        __touch(11004);
    };
    __touch(10915);
    Matrix2x2.prototype.isOrthonormal = function () {
        return this.isOrthogonal() && this.isNormal();
        __touch(11007);
    };
    __touch(10916);
    Matrix2x2.prototype.determinant = function () {
        return this.e00 * this.e11 - this.e01 * this.e10;
        __touch(11008);
    };
    __touch(10917);
    Matrix2x2.prototype.setIdentity = function () {
        this.set(Matrix2x2.IDENTITY);
        __touch(11009);
        return this;
        __touch(11010);
    };
    __touch(10918);
    Matrix2x2.prototype.copy = function (source) {
        var t = this.data;
        __touch(11011);
        var s = source.data;
        __touch(11012);
        t[0] = s[0];
        __touch(11013);
        t[1] = s[1];
        __touch(11014);
        t[2] = s[2];
        __touch(11015);
        t[3] = s[3];
        __touch(11016);
        return this;
        __touch(11017);
    };
    __touch(10919);
    Matrix2x2.prototype.clone = function () {
        var d = this.data;
        __touch(11018);
        return new Matrix2x2(d[0], d[1], d[2], d[3]);
        __touch(11019);
    };
    __touch(10920);
    return Matrix2x2;
    __touch(10921);
});
__touch(10894);
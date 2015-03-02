define([
    'goo/math/MathUtils',
    'goo/math/Matrix'
], function (MathUtils, Matrix) {
    'use strict';
    __touch(11407);
    function Matrix4x4() {
        Matrix.call(this, 4, 4);
        __touch(11445);
        if (arguments.length === 0) {
            this.setIdentity();
            __touch(11446);
        } else {
            Matrix.prototype.set.apply(this, arguments);
            __touch(11447);
        }
    }
    __touch(11408);
    Matrix4x4.prototype = Object.create(Matrix.prototype);
    __touch(11409);
    Matrix.setupAliases(Matrix4x4.prototype, [
        ['e00'],
        ['e10'],
        ['e20'],
        ['e30'],
        ['e01'],
        ['e11'],
        ['e21'],
        ['e31'],
        ['e02'],
        ['e12'],
        ['e22'],
        ['e32'],
        ['e03'],
        ['e13'],
        ['e23'],
        ['e33']
    ]);
    __touch(11410);
    Matrix4x4.IDENTITY = new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    __touch(11411);
    Matrix4x4.add = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11449);
        }
        if (rhs instanceof Matrix4x4) {
            target.e00 = lhs.e00 + rhs.e00;
            __touch(11450);
            target.e10 = lhs.e10 + rhs.e10;
            __touch(11451);
            target.e20 = lhs.e20 + rhs.e20;
            __touch(11452);
            target.e30 = lhs.e30 + rhs.e30;
            __touch(11453);
            target.e01 = lhs.e01 + rhs.e01;
            __touch(11454);
            target.e11 = lhs.e11 + rhs.e11;
            __touch(11455);
            target.e21 = lhs.e21 + rhs.e21;
            __touch(11456);
            target.e31 = lhs.e31 + rhs.e31;
            __touch(11457);
            target.e02 = lhs.e02 + rhs.e02;
            __touch(11458);
            target.e12 = lhs.e12 + rhs.e12;
            __touch(11459);
            target.e22 = lhs.e22 + rhs.e22;
            __touch(11460);
            target.e32 = lhs.e32 + rhs.e32;
            __touch(11461);
            target.e03 = lhs.e03 + rhs.e03;
            __touch(11462);
            target.e13 = lhs.e13 + rhs.e13;
            __touch(11463);
            target.e23 = lhs.e23 + rhs.e23;
            __touch(11464);
            target.e33 = lhs.e33 + rhs.e33;
            __touch(11465);
        } else {
            target.e00 = lhs.e00 + rhs;
            __touch(11466);
            target.e10 = lhs.e10 + rhs;
            __touch(11467);
            target.e20 = lhs.e20 + rhs;
            __touch(11468);
            target.e30 = lhs.e30 + rhs;
            __touch(11469);
            target.e01 = lhs.e01 + rhs;
            __touch(11470);
            target.e11 = lhs.e11 + rhs;
            __touch(11471);
            target.e21 = lhs.e21 + rhs;
            __touch(11472);
            target.e31 = lhs.e31 + rhs;
            __touch(11473);
            target.e02 = lhs.e02 + rhs;
            __touch(11474);
            target.e12 = lhs.e12 + rhs;
            __touch(11475);
            target.e22 = lhs.e22 + rhs;
            __touch(11476);
            target.e32 = lhs.e32 + rhs;
            __touch(11477);
            target.e03 = lhs.e03 + rhs;
            __touch(11478);
            target.e13 = lhs.e13 + rhs;
            __touch(11479);
            target.e23 = lhs.e23 + rhs;
            __touch(11480);
            target.e33 = lhs.e33 + rhs;
            __touch(11481);
        }
        return target;
        __touch(11448);
    };
    __touch(11412);
    Matrix4x4.prototype.add = function (rhs) {
        return Matrix4x4.add(this, rhs, this);
        __touch(11482);
    };
    __touch(11413);
    Matrix4x4.sub = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11484);
        }
        if (rhs instanceof Matrix4x4) {
            target.e00 = lhs.e00 - rhs.e00;
            __touch(11485);
            target.e10 = lhs.e10 - rhs.e10;
            __touch(11486);
            target.e20 = lhs.e20 - rhs.e20;
            __touch(11487);
            target.e30 = lhs.e30 - rhs.e30;
            __touch(11488);
            target.e01 = lhs.e01 - rhs.e01;
            __touch(11489);
            target.e11 = lhs.e11 - rhs.e11;
            __touch(11490);
            target.e21 = lhs.e21 - rhs.e21;
            __touch(11491);
            target.e31 = lhs.e31 - rhs.e31;
            __touch(11492);
            target.e02 = lhs.e02 - rhs.e02;
            __touch(11493);
            target.e12 = lhs.e12 - rhs.e12;
            __touch(11494);
            target.e22 = lhs.e22 - rhs.e22;
            __touch(11495);
            target.e32 = lhs.e32 - rhs.e32;
            __touch(11496);
            target.e03 = lhs.e03 - rhs.e03;
            __touch(11497);
            target.e13 = lhs.e13 - rhs.e13;
            __touch(11498);
            target.e23 = lhs.e23 - rhs.e23;
            __touch(11499);
            target.e33 = lhs.e33 - rhs.e33;
            __touch(11500);
        } else {
            target.e00 = lhs.e00 - rhs;
            __touch(11501);
            target.e10 = lhs.e10 - rhs;
            __touch(11502);
            target.e20 = lhs.e20 - rhs;
            __touch(11503);
            target.e30 = lhs.e30 - rhs;
            __touch(11504);
            target.e01 = lhs.e01 - rhs;
            __touch(11505);
            target.e11 = lhs.e11 - rhs;
            __touch(11506);
            target.e21 = lhs.e21 - rhs;
            __touch(11507);
            target.e31 = lhs.e31 - rhs;
            __touch(11508);
            target.e02 = lhs.e02 - rhs;
            __touch(11509);
            target.e12 = lhs.e12 - rhs;
            __touch(11510);
            target.e22 = lhs.e22 - rhs;
            __touch(11511);
            target.e32 = lhs.e32 - rhs;
            __touch(11512);
            target.e03 = lhs.e03 - rhs;
            __touch(11513);
            target.e13 = lhs.e13 - rhs;
            __touch(11514);
            target.e23 = lhs.e23 - rhs;
            __touch(11515);
            target.e33 = lhs.e33 - rhs;
            __touch(11516);
        }
        return target;
        __touch(11483);
    };
    __touch(11414);
    Matrix4x4.prototype.sub = function (rhs) {
        return Matrix4x4.sub(this, rhs, this);
        __touch(11517);
    };
    __touch(11415);
    Matrix4x4.mul = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11519);
        }
        if (rhs instanceof Matrix4x4) {
            target.e00 = lhs.e00 * rhs.e00;
            __touch(11520);
            target.e10 = lhs.e10 * rhs.e10;
            __touch(11521);
            target.e20 = lhs.e20 * rhs.e20;
            __touch(11522);
            target.e30 = lhs.e30 * rhs.e30;
            __touch(11523);
            target.e01 = lhs.e01 * rhs.e01;
            __touch(11524);
            target.e11 = lhs.e11 * rhs.e11;
            __touch(11525);
            target.e21 = lhs.e21 * rhs.e21;
            __touch(11526);
            target.e31 = lhs.e31 * rhs.e31;
            __touch(11527);
            target.e02 = lhs.e02 * rhs.e02;
            __touch(11528);
            target.e12 = lhs.e12 * rhs.e12;
            __touch(11529);
            target.e22 = lhs.e22 * rhs.e22;
            __touch(11530);
            target.e32 = lhs.e32 * rhs.e32;
            __touch(11531);
            target.e03 = lhs.e03 * rhs.e03;
            __touch(11532);
            target.e13 = lhs.e13 * rhs.e13;
            __touch(11533);
            target.e23 = lhs.e23 * rhs.e23;
            __touch(11534);
            target.e33 = lhs.e33 * rhs.e33;
            __touch(11535);
        } else {
            target.e00 = lhs.e00 * rhs;
            __touch(11536);
            target.e10 = lhs.e10 * rhs;
            __touch(11537);
            target.e20 = lhs.e20 * rhs;
            __touch(11538);
            target.e30 = lhs.e30 * rhs;
            __touch(11539);
            target.e01 = lhs.e01 * rhs;
            __touch(11540);
            target.e11 = lhs.e11 * rhs;
            __touch(11541);
            target.e21 = lhs.e21 * rhs;
            __touch(11542);
            target.e31 = lhs.e31 * rhs;
            __touch(11543);
            target.e02 = lhs.e02 * rhs;
            __touch(11544);
            target.e12 = lhs.e12 * rhs;
            __touch(11545);
            target.e22 = lhs.e22 * rhs;
            __touch(11546);
            target.e32 = lhs.e32 * rhs;
            __touch(11547);
            target.e03 = lhs.e03 * rhs;
            __touch(11548);
            target.e13 = lhs.e13 * rhs;
            __touch(11549);
            target.e23 = lhs.e23 * rhs;
            __touch(11550);
            target.e33 = lhs.e33 * rhs;
            __touch(11551);
        }
        return target;
        __touch(11518);
    };
    __touch(11416);
    Matrix4x4.prototype.mul = function (rhs) {
        return Matrix4x4.mul(this, rhs, this);
        __touch(11552);
    };
    __touch(11417);
    Matrix4x4.div = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11554);
        }
        if (rhs instanceof Matrix4x4) {
            target.e00 = lhs.e00 / rhs.e00;
            __touch(11555);
            target.e10 = lhs.e10 / rhs.e10;
            __touch(11556);
            target.e20 = lhs.e20 / rhs.e20;
            __touch(11557);
            target.e30 = lhs.e30 / rhs.e30;
            __touch(11558);
            target.e01 = lhs.e01 / rhs.e01;
            __touch(11559);
            target.e11 = lhs.e11 / rhs.e11;
            __touch(11560);
            target.e21 = lhs.e21 / rhs.e21;
            __touch(11561);
            target.e31 = lhs.e31 / rhs.e31;
            __touch(11562);
            target.e02 = lhs.e02 / rhs.e02;
            __touch(11563);
            target.e12 = lhs.e12 / rhs.e12;
            __touch(11564);
            target.e22 = lhs.e22 / rhs.e22;
            __touch(11565);
            target.e32 = lhs.e32 / rhs.e32;
            __touch(11566);
            target.e03 = lhs.e03 / rhs.e03;
            __touch(11567);
            target.e13 = lhs.e13 / rhs.e13;
            __touch(11568);
            target.e23 = lhs.e23 / rhs.e23;
            __touch(11569);
            target.e33 = lhs.e33 / rhs.e33;
            __touch(11570);
        } else {
            rhs = 1 / rhs;
            __touch(11571);
            target.e00 = lhs.e00 * rhs;
            __touch(11572);
            target.e10 = lhs.e10 * rhs;
            __touch(11573);
            target.e20 = lhs.e20 * rhs;
            __touch(11574);
            target.e30 = lhs.e30 * rhs;
            __touch(11575);
            target.e01 = lhs.e01 * rhs;
            __touch(11576);
            target.e11 = lhs.e11 * rhs;
            __touch(11577);
            target.e21 = lhs.e21 * rhs;
            __touch(11578);
            target.e31 = lhs.e31 * rhs;
            __touch(11579);
            target.e02 = lhs.e02 * rhs;
            __touch(11580);
            target.e12 = lhs.e12 * rhs;
            __touch(11581);
            target.e22 = lhs.e22 * rhs;
            __touch(11582);
            target.e32 = lhs.e32 * rhs;
            __touch(11583);
            target.e03 = lhs.e03 * rhs;
            __touch(11584);
            target.e13 = lhs.e13 * rhs;
            __touch(11585);
            target.e23 = lhs.e23 * rhs;
            __touch(11586);
            target.e33 = lhs.e33 * rhs;
            __touch(11587);
        }
        return target;
        __touch(11553);
    };
    __touch(11418);
    Matrix4x4.prototype.div = function (rhs) {
        return Matrix4x4.div(this, rhs, this);
        __touch(11588);
    };
    __touch(11419);
    Matrix4x4.combine = function (lhs, rhs, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11611);
        }
        var s1d = lhs.data;
        __touch(11589);
        var m00 = s1d[0], m01 = s1d[4], m02 = s1d[8], m03 = s1d[12], m10 = s1d[1], m11 = s1d[5], m12 = s1d[9], m13 = s1d[13], m20 = s1d[2], m21 = s1d[6], m22 = s1d[10], m23 = s1d[14], m30 = s1d[3], m31 = s1d[7], m32 = s1d[11], m33 = s1d[15];
        __touch(11590);
        var s2d = rhs.data;
        __touch(11591);
        var n00 = s2d[0], n01 = s2d[4], n02 = s2d[8], n03 = s2d[12], n10 = s2d[1], n11 = s2d[5], n12 = s2d[9], n13 = s2d[13], n20 = s2d[2], n21 = s2d[6], n22 = s2d[10], n23 = s2d[14], n30 = s2d[3], n31 = s2d[7], n32 = s2d[11], n33 = s2d[15];
        __touch(11592);
        var rd = target.data;
        __touch(11593);
        rd[0] = m00 * n00 + m01 * n10 + m02 * n20 + m03 * n30;
        __touch(11594);
        rd[4] = m00 * n01 + m01 * n11 + m02 * n21 + m03 * n31;
        __touch(11595);
        rd[8] = m00 * n02 + m01 * n12 + m02 * n22 + m03 * n32;
        __touch(11596);
        rd[12] = m00 * n03 + m01 * n13 + m02 * n23 + m03 * n33;
        __touch(11597);
        rd[1] = m10 * n00 + m11 * n10 + m12 * n20 + m13 * n30;
        __touch(11598);
        rd[5] = m10 * n01 + m11 * n11 + m12 * n21 + m13 * n31;
        __touch(11599);
        rd[9] = m10 * n02 + m11 * n12 + m12 * n22 + m13 * n32;
        __touch(11600);
        rd[13] = m10 * n03 + m11 * n13 + m12 * n23 + m13 * n33;
        __touch(11601);
        rd[2] = m20 * n00 + m21 * n10 + m22 * n20 + m23 * n30;
        __touch(11602);
        rd[6] = m20 * n01 + m21 * n11 + m22 * n21 + m23 * n31;
        __touch(11603);
        rd[10] = m20 * n02 + m21 * n12 + m22 * n22 + m23 * n32;
        __touch(11604);
        rd[14] = m20 * n03 + m21 * n13 + m22 * n23 + m23 * n33;
        __touch(11605);
        rd[3] = m30 * n00 + m31 * n10 + m32 * n20 + m33 * n30;
        __touch(11606);
        rd[7] = m30 * n01 + m31 * n11 + m32 * n21 + m33 * n31;
        __touch(11607);
        rd[11] = m30 * n02 + m31 * n12 + m32 * n22 + m33 * n32;
        __touch(11608);
        rd[15] = m30 * n03 + m31 * n13 + m32 * n23 + m33 * n33;
        __touch(11609);
        return target;
        __touch(11610);
    };
    __touch(11420);
    Matrix4x4.prototype.combine = function (rhs) {
        return Matrix4x4.combine(this, rhs, this);
        __touch(11612);
    };
    __touch(11421);
    Matrix4x4.transpose = function (source, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11632);
        }
        var s = source.data;
        __touch(11613);
        var t = target.data;
        __touch(11614);
        if (target === source) {
            var e01 = s[4];
            __touch(11633);
            var e02 = s[8];
            __touch(11634);
            var e03 = s[12];
            __touch(11635);
            var e12 = s[9];
            __touch(11636);
            var e13 = s[13];
            __touch(11637);
            var e23 = s[14];
            __touch(11638);
            t[4] = s[1];
            __touch(11639);
            t[8] = s[2];
            __touch(11640);
            t[12] = s[3];
            __touch(11641);
            t[9] = s[6];
            __touch(11642);
            t[13] = s[7];
            __touch(11643);
            t[14] = s[11];
            __touch(11644);
            t[1] = e01;
            __touch(11645);
            t[2] = e02;
            __touch(11646);
            t[3] = e03;
            __touch(11647);
            t[6] = e12;
            __touch(11648);
            t[7] = e13;
            __touch(11649);
            t[11] = e23;
            __touch(11650);
            return target;
            __touch(11651);
        }
        t[0] = s[0];
        __touch(11615);
        t[1] = s[4];
        __touch(11616);
        t[2] = s[8];
        __touch(11617);
        t[3] = s[12];
        __touch(11618);
        t[4] = s[1];
        __touch(11619);
        t[5] = s[5];
        __touch(11620);
        t[6] = s[9];
        __touch(11621);
        t[7] = s[13];
        __touch(11622);
        t[8] = s[2];
        __touch(11623);
        t[9] = s[6];
        __touch(11624);
        t[10] = s[10];
        __touch(11625);
        t[11] = s[14];
        __touch(11626);
        t[12] = s[3];
        __touch(11627);
        t[13] = s[7];
        __touch(11628);
        t[14] = s[11];
        __touch(11629);
        t[15] = s[15];
        __touch(11630);
        return target;
        __touch(11631);
    };
    __touch(11422);
    Matrix4x4.prototype.transpose = function () {
        return Matrix4x4.transpose(this, this);
        __touch(11652);
    };
    __touch(11423);
    Matrix4x4.invert = function (source, target) {
        if (!target) {
            target = new Matrix4x4();
            __touch(11674);
        }
        if (target === source) {
            return Matrix.copy(Matrix4x4.invert(source), target);
            __touch(11675);
        }
        var det = source.determinant();
        __touch(11653);
        if (!det) {
            return target;
            __touch(11676);
        }
        var s = source.data;
        __touch(11654);
        var t = target.data;
        __touch(11655);
        det = 1 / det;
        __touch(11656);
        t[0] = (s[5] * (s[10] * s[15] - s[14] * s[11]) - s[9] * (s[6] * s[15] - s[14] * s[7]) + s[13] * (s[6] * s[11] - s[10] * s[7])) * det;
        __touch(11657);
        t[1] = (s[1] * (s[14] * s[11] - s[10] * s[15]) - s[9] * (s[14] * s[3] - s[2] * s[15]) + s[13] * (s[10] * s[3] - s[2] * s[11])) * det;
        __touch(11658);
        t[2] = (s[1] * (s[6] * s[15] - s[14] * s[7]) - s[5] * (s[2] * s[15] - s[14] * s[3]) + s[13] * (s[2] * s[7] - s[6] * s[3])) * det;
        __touch(11659);
        t[3] = (s[1] * (s[10] * s[7] - s[6] * s[11]) - s[5] * (s[10] * s[3] - s[2] * s[11]) + s[9] * (s[6] * s[3] - s[2] * s[7])) * det;
        __touch(11660);
        t[4] = (s[4] * (s[14] * s[11] - s[10] * s[15]) - s[8] * (s[14] * s[7] - s[6] * s[15]) + s[12] * (s[10] * s[7] - s[6] * s[11])) * det;
        __touch(11661);
        t[5] = (s[0] * (s[10] * s[15] - s[14] * s[11]) - s[8] * (s[2] * s[15] - s[14] * s[3]) + s[12] * (s[2] * s[11] - s[10] * s[3])) * det;
        __touch(11662);
        t[6] = (s[0] * (s[14] * s[7] - s[6] * s[15]) - s[4] * (s[14] * s[3] - s[2] * s[15]) + s[12] * (s[6] * s[3] - s[2] * s[7])) * det;
        __touch(11663);
        t[7] = (s[0] * (s[6] * s[11] - s[10] * s[7]) - s[4] * (s[2] * s[11] - s[10] * s[3]) + s[8] * (s[2] * s[7] - s[6] * s[3])) * det;
        __touch(11664);
        t[8] = (s[4] * (s[9] * s[15] - s[13] * s[11]) - s[8] * (s[5] * s[15] - s[13] * s[7]) + s[12] * (s[5] * s[11] - s[9] * s[7])) * det;
        __touch(11665);
        t[9] = (s[0] * (s[13] * s[11] - s[9] * s[15]) - s[8] * (s[13] * s[3] - s[1] * s[15]) + s[12] * (s[9] * s[3] - s[1] * s[11])) * det;
        __touch(11666);
        t[10] = (s[0] * (s[5] * s[15] - s[13] * s[7]) - s[4] * (s[1] * s[15] - s[13] * s[3]) + s[12] * (s[1] * s[7] - s[5] * s[3])) * det;
        __touch(11667);
        t[11] = (s[0] * (s[9] * s[7] - s[5] * s[11]) - s[4] * (s[9] * s[3] - s[1] * s[11]) + s[8] * (s[5] * s[3] - s[1] * s[7])) * det;
        __touch(11668);
        t[12] = (s[4] * (s[13] * s[10] - s[9] * s[14]) - s[8] * (s[13] * s[6] - s[5] * s[14]) + s[12] * (s[9] * s[6] - s[5] * s[10])) * det;
        __touch(11669);
        t[13] = (s[0] * (s[9] * s[14] - s[13] * s[10]) - s[8] * (s[1] * s[14] - s[13] * s[2]) + s[12] * (s[1] * s[10] - s[9] * s[2])) * det;
        __touch(11670);
        t[14] = (s[0] * (s[13] * s[6] - s[5] * s[14]) - s[4] * (s[13] * s[2] - s[1] * s[14]) + s[12] * (s[5] * s[2] - s[1] * s[6])) * det;
        __touch(11671);
        t[15] = (s[0] * (s[5] * s[10] - s[9] * s[6]) - s[4] * (s[1] * s[10] - s[9] * s[2]) + s[8] * (s[1] * s[6] - s[5] * s[2])) * det;
        __touch(11672);
        return target;
        __touch(11673);
    };
    __touch(11424);
    Matrix4x4.prototype.invert = function () {
        return Matrix4x4.invert(this, this);
        __touch(11677);
    };
    __touch(11425);
    Matrix4x4.prototype.isOrthogonal = function () {
        var dot;
        __touch(11678);
        dot = this.e00 * this.e01 + this.e10 * this.e11 + this.e20 * this.e21 + this.e30 * this.e31;
        __touch(11679);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11686);
        }
        dot = this.e00 * this.e02 + this.e10 * this.e12 + this.e20 * this.e22 + this.e30 * this.e32;
        __touch(11680);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11687);
        }
        dot = this.e00 * this.e03 + this.e10 * this.e13 + this.e20 * this.e23 + this.e30 * this.e33;
        __touch(11681);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11688);
        }
        dot = this.e01 * this.e02 + this.e11 * this.e12 + this.e21 * this.e22 + this.e31 * this.e32;
        __touch(11682);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11689);
        }
        dot = this.e01 * this.e03 + this.e11 * this.e13 + this.e21 * this.e23 + this.e31 * this.e33;
        __touch(11683);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11690);
        }
        dot = this.e02 * this.e03 + this.e12 * this.e13 + this.e22 * this.e23 + this.e32 * this.e33;
        __touch(11684);
        if (Math.abs(dot) > MathUtils.EPSILON) {
            return false;
            __touch(11691);
        }
        return true;
        __touch(11685);
    };
    __touch(11426);
    Matrix4x4.prototype.isNormal = function () {
        var l;
        __touch(11692);
        l = this.e00 * this.e00 + this.e10 * this.e10 + this.e20 * this.e20 + this.e30 * this.e30;
        __touch(11693);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11698);
        }
        l = this.e01 * this.e01 + this.e11 * this.e11 + this.e21 * this.e21 + this.e31 * this.e31;
        __touch(11694);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11699);
        }
        l = this.e02 * this.e02 + this.e12 * this.e12 + this.e22 * this.e22 + this.e32 * this.e32;
        __touch(11695);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11700);
        }
        l = this.e03 * this.e03 + this.e13 * this.e13 + this.e23 * this.e23 + this.e33 * this.e33;
        __touch(11696);
        if (Math.abs(l - 1) > MathUtils.EPSILON) {
            return false;
            __touch(11701);
        }
        return true;
        __touch(11697);
    };
    __touch(11427);
    Matrix4x4.prototype.isOrthonormal = function () {
        return this.isOrthogonal() && this.isNormal();
        __touch(11702);
    };
    __touch(11428);
    Matrix4x4.prototype.determinant = function () {
        var d = this.data;
        __touch(11703);
        var val1 = d[5] * d[10] * d[15] + d[9] * d[14] * d[7] + d[13] * d[6] * d[11] - d[13] * d[10] * d[7] - d[9] * d[6] * d[15] - d[5] * d[14] * d[11];
        __touch(11704);
        var val2 = d[1] * d[10] * d[15] + d[9] * d[14] * d[3] + d[13] * d[2] * d[11] - d[13] * d[10] * d[3] - d[9] * d[2] * d[15] - d[1] * d[14] * d[11];
        __touch(11705);
        var val3 = d[1] * d[6] * d[15] + d[5] * d[14] * d[3] + d[13] * d[2] * d[7] - d[13] * d[6] * d[3] - d[5] * d[2] * d[15] - d[1] * d[14] * d[7];
        __touch(11706);
        var val4 = d[1] * d[6] * d[11] + d[5] * d[10] * d[3] + d[9] * d[2] * d[7] - d[9] * d[6] * d[3] - d[5] * d[2] * d[11] - d[1] * d[10] * d[7];
        __touch(11707);
        return d[0] * val1 - d[4] * val2 + d[8] * val3 - d[12] * val4;
        __touch(11708);
    };
    __touch(11429);
    Matrix4x4.prototype.setIdentity = function () {
        var d = this.data;
        __touch(11709);
        d[0] = 1;
        __touch(11710);
        d[1] = 0;
        __touch(11711);
        d[2] = 0;
        __touch(11712);
        d[3] = 0;
        __touch(11713);
        d[4] = 0;
        __touch(11714);
        d[5] = 1;
        __touch(11715);
        d[6] = 0;
        __touch(11716);
        d[7] = 0;
        __touch(11717);
        d[8] = 0;
        __touch(11718);
        d[9] = 0;
        __touch(11719);
        d[10] = 1;
        __touch(11720);
        d[11] = 0;
        __touch(11721);
        d[12] = 0;
        __touch(11722);
        d[13] = 0;
        __touch(11723);
        d[14] = 0;
        __touch(11724);
        d[15] = 1;
        __touch(11725);
        return this;
        __touch(11726);
    };
    __touch(11430);
    Matrix4x4.prototype.setRotationFromVector = function (angles) {
        var sx = Math.sin(angles.x);
        __touch(11727);
        var cx = Math.cos(angles.x);
        __touch(11728);
        var sy = Math.sin(angles.y);
        __touch(11729);
        var cy = Math.cos(angles.y);
        __touch(11730);
        var sz = Math.sin(angles.z);
        __touch(11731);
        var cz = Math.cos(angles.z);
        __touch(11732);
        this.e00 = cz * cy;
        __touch(11733);
        this.e10 = sz * cy;
        __touch(11734);
        this.e20 = 0 - sy;
        __touch(11735);
        this.e01 = cz * sy * sx - sz * cx;
        __touch(11736);
        this.e11 = sz * sy * sx + cz * cx;
        __touch(11737);
        this.e21 = cy * sx;
        __touch(11738);
        this.e02 = cz * sy * cx + sz * sx;
        __touch(11739);
        this.e12 = sz * sy * cx - cz * sx;
        __touch(11740);
        this.e22 = cy * cx;
        __touch(11741);
        return this;
        __touch(11742);
    };
    __touch(11431);
    Matrix4x4.prototype.setRotationFromQuaternion = function (quaternion) {
        var l = quaternion.lengthSquared();
        __touch(11743);
        l = l > 0 ? 2 / l : 0;
        __touch(11744);
        var a = quaternion.x * l;
        __touch(11745);
        var b = quaternion.y * l;
        __touch(11746);
        var c = quaternion.z * l;
        __touch(11747);
        var wa = quaternion.w * a;
        __touch(11748);
        var wb = quaternion.w * b;
        __touch(11749);
        var wc = quaternion.w * c;
        __touch(11750);
        var xa = quaternion.x * a;
        __touch(11751);
        var xb = quaternion.x * b;
        __touch(11752);
        var xc = quaternion.x * c;
        __touch(11753);
        var yb = quaternion.y * b;
        __touch(11754);
        var yc = quaternion.y * c;
        __touch(11755);
        var zc = quaternion.z * c;
        __touch(11756);
        this.e00 = 1 - yb - zc;
        __touch(11757);
        this.e10 = xb + wc;
        __touch(11758);
        this.e20 = xc - wb;
        __touch(11759);
        this.e01 = xb - wc;
        __touch(11760);
        this.e11 = 1 - xa - zc;
        __touch(11761);
        this.e21 = yc + wa;
        __touch(11762);
        this.e02 = xc + wb;
        __touch(11763);
        this.e12 = yc - wa;
        __touch(11764);
        this.e22 = 1 - xa - yb;
        __touch(11765);
        return this;
        __touch(11766);
    };
    __touch(11432);
    Matrix4x4.prototype.setTranslation = function (translation) {
        this.e03 = translation.x;
        __touch(11767);
        this.e13 = translation.y;
        __touch(11768);
        this.e23 = translation.z;
        __touch(11769);
        return this;
        __touch(11770);
    };
    __touch(11433);
    Matrix4x4.prototype.getTranslation = function (store) {
        store.x = this.data[12];
        __touch(11771);
        store.y = this.data[13];
        __touch(11772);
        store.z = this.data[14];
        __touch(11773);
        return this;
        __touch(11774);
    };
    __touch(11434);
    Matrix4x4.prototype.getRotation = function (store) {
        var d = this.data;
        __touch(11775);
        store.set(d[0], d[1], d[2], d[4], d[5], d[6], d[8], d[9], d[10]);
        __touch(11776);
        return this;
        __touch(11777);
    };
    __touch(11435);
    Matrix4x4.prototype.getScale = function (store) {
        var sx = Math.sqrt(store.setd(this.data[0], this.data[4], this.data[8]).lengthSquared());
        __touch(11778);
        var sy = Math.sqrt(store.setd(this.data[1], this.data[5], this.data[9]).lengthSquared());
        __touch(11779);
        var sz = Math.sqrt(store.setd(this.data[2], this.data[6], this.data[10]).lengthSquared());
        __touch(11780);
        store.x = sx;
        __touch(11781);
        store.y = sy;
        __touch(11782);
        store.z = sz;
        __touch(11783);
        return this;
        __touch(11784);
    };
    __touch(11436);
    Matrix4x4.prototype.setScale = function (scale) {
        this.e00 *= scale.x;
        __touch(11785);
        this.e10 *= scale.y;
        __touch(11786);
        this.e20 *= scale.z;
        __touch(11787);
        this.e01 *= scale.x;
        __touch(11788);
        this.e11 *= scale.y;
        __touch(11789);
        this.e21 *= scale.z;
        __touch(11790);
        this.e02 *= scale.x;
        __touch(11791);
        this.e12 *= scale.y;
        __touch(11792);
        this.e22 *= scale.z;
        __touch(11793);
        return this;
        __touch(11794);
    };
    __touch(11437);
    Matrix4x4.prototype.applyPre = function (rhs) {
        var x = rhs.data[0];
        __touch(11795);
        var y = rhs.data[1];
        __touch(11796);
        var z = rhs.data[2];
        __touch(11797);
        var w = rhs.data[3];
        __touch(11798);
        var s = this.data;
        __touch(11799);
        rhs.data[0] = s[0] * x + s[1] * y + s[2] * z + s[3] * w;
        __touch(11800);
        rhs.data[1] = s[4] * x + s[5] * y + s[6] * z + s[7] * w;
        __touch(11801);
        rhs.data[2] = s[8] * x + s[9] * y + s[10] * z + s[11] * w;
        __touch(11802);
        rhs.data[3] = s[12] * x + s[13] * y + s[14] * z + s[15] * w;
        __touch(11803);
        return rhs;
        __touch(11804);
    };
    __touch(11438);
    Matrix4x4.prototype.applyPost = function (rhs) {
        var x = rhs.data[0];
        __touch(11805);
        var y = rhs.data[1];
        __touch(11806);
        var z = rhs.data[2];
        __touch(11807);
        var w = rhs.data[3];
        __touch(11808);
        var s = this.data;
        __touch(11809);
        rhs.data[0] = s[0] * x + s[4] * y + s[8] * z + s[12] * w;
        __touch(11810);
        rhs.data[1] = s[1] * x + s[5] * y + s[9] * z + s[13] * w;
        __touch(11811);
        rhs.data[2] = s[2] * x + s[6] * y + s[10] * z + s[14] * w;
        __touch(11812);
        rhs.data[3] = s[3] * x + s[7] * y + s[11] * z + s[15] * w;
        __touch(11813);
        return rhs;
        __touch(11814);
    };
    __touch(11439);
    Matrix4x4.prototype.applyPostPoint = function (rhs) {
        var x = rhs.data[0];
        __touch(11815);
        var y = rhs.data[1];
        __touch(11816);
        var z = rhs.data[2];
        __touch(11817);
        var d = this.data;
        __touch(11818);
        rhs.data[0] = d[0] * x + d[4] * y + d[8] * z + d[12];
        __touch(11819);
        rhs.data[1] = d[1] * x + d[5] * y + d[9] * z + d[13];
        __touch(11820);
        rhs.data[2] = d[2] * x + d[6] * y + d[10] * z + d[14];
        __touch(11821);
        return rhs;
        __touch(11822);
    };
    __touch(11440);
    Matrix4x4.prototype.applyPostVector = function (rhs) {
        var x = rhs.x;
        __touch(11823);
        var y = rhs.y;
        __touch(11824);
        var z = rhs.z;
        __touch(11825);
        var d = this.data;
        __touch(11826);
        rhs.x = d[0] * x + d[4] * y + d[8] * z;
        __touch(11827);
        rhs.y = d[1] * x + d[5] * y + d[9] * z;
        __touch(11828);
        rhs.z = d[2] * x + d[6] * y + d[10] * z;
        __touch(11829);
        return rhs;
        __touch(11830);
    };
    __touch(11441);
    Matrix4x4.prototype.copy = function (source) {
        var t = this.data;
        __touch(11831);
        var s = source.data;
        __touch(11832);
        t[0] = s[0];
        __touch(11833);
        t[1] = s[1];
        __touch(11834);
        t[2] = s[2];
        __touch(11835);
        t[3] = s[3];
        __touch(11836);
        t[4] = s[4];
        __touch(11837);
        t[5] = s[5];
        __touch(11838);
        t[6] = s[6];
        __touch(11839);
        t[7] = s[7];
        __touch(11840);
        t[8] = s[8];
        __touch(11841);
        t[9] = s[9];
        __touch(11842);
        t[10] = s[10];
        __touch(11843);
        t[11] = s[11];
        __touch(11844);
        t[12] = s[12];
        __touch(11845);
        t[13] = s[13];
        __touch(11846);
        t[14] = s[14];
        __touch(11847);
        t[15] = s[15];
        __touch(11848);
        return this;
        __touch(11849);
    };
    __touch(11442);
    Matrix4x4.prototype.clone = function () {
        var d = this.data;
        __touch(11850);
        return new Matrix4x4(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10], d[11], d[12], d[13], d[14], d[15]);
        __touch(11851);
    };
    __touch(11443);
    return Matrix4x4;
    __touch(11444);
});
__touch(11406);
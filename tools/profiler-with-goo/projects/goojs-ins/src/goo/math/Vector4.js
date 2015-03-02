define(['goo/math/Vector'], function (Vector) {
    'use strict';
    __touch(12712);
    function Vector4() {
        Vector.call(this, 4);
        __touch(12739);
        if (arguments.length !== 0) {
            this.set(arguments);
            __touch(12740);
        } else {
            this.setd(0, 0, 0, 0);
            __touch(12741);
        }
    }
    __touch(12713);
    Vector4.prototype = Object.create(Vector.prototype);
    __touch(12714);
    Vector.setupAliases(Vector4.prototype, [
        [
            'x',
            'r'
        ],
        [
            'y',
            'g'
        ],
        [
            'z',
            'b'
        ],
        [
            'w',
            'a'
        ]
    ]);
    __touch(12715);
    Vector4.ZERO = new Vector4(0, 0, 0, 0);
    __touch(12716);
    Vector4.ONE = new Vector4(1, 1, 1, 1);
    __touch(12717);
    Vector4.UNIT_X = new Vector4(1, 0, 0, 0);
    __touch(12718);
    Vector4.UNIT_Y = new Vector4(0, 1, 0, 0);
    __touch(12719);
    Vector4.UNIT_Z = new Vector4(0, 0, 1, 0);
    __touch(12720);
    Vector4.UNIT_W = new Vector4(0, 0, 0, 1);
    __touch(12721);
    Vector4.add = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs,
                lhs
            ];
            __touch(12749);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs,
                rhs
            ];
            __touch(12750);
        }
        if (!target) {
            target = new Vector4();
            __touch(12751);
        }
        var ldata = lhs.data || lhs;
        __touch(12742);
        var rdata = rhs.data || rhs;
        __touch(12743);
        target.data[0] = ldata[0] + rdata[0];
        __touch(12744);
        target.data[1] = ldata[1] + rdata[1];
        __touch(12745);
        target.data[2] = ldata[2] + rdata[2];
        __touch(12746);
        target.data[3] = ldata[3] + rdata[3];
        __touch(12747);
        return target;
        __touch(12748);
    };
    __touch(12722);
    Vector4.prototype.add = function (rhs) {
        return Vector4.add(this, rhs, this);
        __touch(12752);
    };
    __touch(12723);
    Vector4.sub = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs,
                lhs
            ];
            __touch(12760);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs,
                rhs
            ];
            __touch(12761);
        }
        if (!target) {
            target = new Vector4();
            __touch(12762);
        }
        var ldata = lhs.data || lhs;
        __touch(12753);
        var rdata = rhs.data || rhs;
        __touch(12754);
        target.data[0] = ldata[0] - rdata[0];
        __touch(12755);
        target.data[1] = ldata[1] - rdata[1];
        __touch(12756);
        target.data[2] = ldata[2] - rdata[2];
        __touch(12757);
        target.data[3] = ldata[3] - rdata[3];
        __touch(12758);
        return target;
        __touch(12759);
    };
    __touch(12724);
    Vector4.prototype.sub = function (rhs) {
        return Vector4.sub(this, rhs, this);
        __touch(12763);
    };
    __touch(12725);
    Vector4.mul = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs,
                lhs
            ];
            __touch(12771);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs,
                rhs
            ];
            __touch(12772);
        }
        if (!target) {
            target = new Vector4();
            __touch(12773);
        }
        var ldata = lhs.data || lhs;
        __touch(12764);
        var rdata = rhs.data || rhs;
        __touch(12765);
        target.data[0] = ldata[0] * rdata[0];
        __touch(12766);
        target.data[1] = ldata[1] * rdata[1];
        __touch(12767);
        target.data[2] = ldata[2] * rdata[2];
        __touch(12768);
        target.data[3] = ldata[3] * rdata[3];
        __touch(12769);
        return target;
        __touch(12770);
    };
    __touch(12726);
    Vector4.prototype.mul = function (rhs) {
        return Vector4.mul(this, rhs, this);
        __touch(12774);
    };
    __touch(12727);
    Vector4.div = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs,
                lhs
            ];
            __touch(12782);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs,
                rhs
            ];
            __touch(12783);
        }
        if (!target) {
            target = new Vector4();
            __touch(12784);
        }
        var ldata = lhs.data || lhs;
        __touch(12775);
        var rdata = rhs.data || rhs;
        __touch(12776);
        target.data[0] = ldata[0] / rdata[0];
        __touch(12777);
        target.data[1] = ldata[1] / rdata[1];
        __touch(12778);
        target.data[2] = ldata[2] / rdata[2];
        __touch(12779);
        target.data[3] = ldata[3] / rdata[3];
        __touch(12780);
        return target;
        __touch(12781);
    };
    __touch(12728);
    Vector4.prototype.div = function (rhs) {
        return Vector4.div(this, rhs, this);
        __touch(12785);
    };
    __touch(12729);
    Vector4.dot = function (lhs, rhs) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs,
                lhs
            ];
            __touch(12789);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs,
                rhs
            ];
            __touch(12790);
        }
        var ldata = lhs.data || lhs;
        __touch(12786);
        var rdata = rhs.data || rhs;
        __touch(12787);
        return ldata[0] * rdata[0] + ldata[1] * rdata[1] + ldata[2] * rdata[2] + ldata[3] * rdata[3];
        __touch(12788);
    };
    __touch(12730);
    Vector4.prototype.dot = function (rhs) {
        return Vector4.dot(this, rhs);
        __touch(12791);
    };
    __touch(12731);
    Vector4.prototype.lerp = function (end, factor) {
        this.x = (1 - factor) * this.x + factor * end.x;
        __touch(12792);
        this.y = (1 - factor) * this.y + factor * end.y;
        __touch(12793);
        this.z = (1 - factor) * this.z + factor * end.z;
        __touch(12794);
        this.w = (1 - factor) * this.w + factor * end.w;
        __touch(12795);
        return this;
        __touch(12796);
    };
    __touch(12732);
    Vector4.prototype.setd = function (x, y, z, w) {
        this.data[0] = x;
        __touch(12797);
        this.data[1] = y;
        __touch(12798);
        this.data[2] = z;
        __touch(12799);
        this.data[3] = w;
        __touch(12800);
        return this;
        __touch(12801);
    };
    __touch(12733);
    Vector4.prototype.seta = function (array) {
        this.data[0] = array[0];
        __touch(12802);
        this.data[1] = array[1];
        __touch(12803);
        this.data[2] = array[2];
        __touch(12804);
        this.data[3] = array[3];
        __touch(12805);
        return this;
        __touch(12806);
    };
    __touch(12734);
    Vector4.prototype.setv = function (vec4) {
        this.data[0] = vec4.data[0];
        __touch(12807);
        this.data[1] = vec4.data[1];
        __touch(12808);
        this.data[2] = vec4.data[2];
        __touch(12809);
        this.data[3] = vec4.data[3];
        __touch(12810);
        return this;
        __touch(12811);
    };
    __touch(12735);
    Vector4.prototype.scale = function (factor) {
        this.data[0] *= factor;
        __touch(12812);
        this.data[1] *= factor;
        __touch(12813);
        this.data[2] *= factor;
        __touch(12814);
        this.data[3] *= factor;
        __touch(12815);
        return this;
        __touch(12816);
    };
    __touch(12736);
    Vector4.prototype.clone = function () {
        return new Vector4(this);
        __touch(12817);
    };
    __touch(12737);
    return Vector4;
    __touch(12738);
});
__touch(12711);
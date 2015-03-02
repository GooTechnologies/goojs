define(['goo/math/Vector'], function (Vector) {
    'use strict';
    __touch(12432);
    function Vector2() {
        Vector.call(this, 2);
        __touch(12456);
        if (arguments.length !== 0) {
            this.set(arguments);
            __touch(12457);
        } else {
            this.setd(0, 0);
            __touch(12458);
        }
    }
    __touch(12433);
    Vector2.prototype = Object.create(Vector.prototype);
    __touch(12434);
    Vector.setupAliases(Vector2.prototype, [
        [
            'x',
            'u',
            's'
        ],
        [
            'y',
            'v',
            't'
        ]
    ]);
    __touch(12435);
    Vector2.ZERO = new Vector2(0, 0);
    __touch(12436);
    Vector2.ONE = new Vector2(1, 1);
    __touch(12437);
    Vector2.UNIT_X = new Vector2(1, 0);
    __touch(12438);
    Vector2.UNIT_Y = new Vector2(0, 1);
    __touch(12439);
    Vector2.add = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs
            ];
            __touch(12464);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs
            ];
            __touch(12465);
        }
        if (!target) {
            target = new Vector2();
            __touch(12466);
        }
        var ldata = lhs.data || lhs;
        __touch(12459);
        var rdata = rhs.data || rhs;
        __touch(12460);
        target.data[0] = ldata[0] + rdata[0];
        __touch(12461);
        target.data[1] = ldata[1] + rdata[1];
        __touch(12462);
        return target;
        __touch(12463);
    };
    __touch(12440);
    Vector2.prototype.add = function (rhs) {
        return Vector2.add(this, rhs, this);
        __touch(12467);
    };
    __touch(12441);
    Vector2.sub = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs
            ];
            __touch(12473);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs
            ];
            __touch(12474);
        }
        if (!target) {
            target = new Vector2();
            __touch(12475);
        }
        var ldata = lhs.data || lhs;
        __touch(12468);
        var rdata = rhs.data || rhs;
        __touch(12469);
        target.data[0] = ldata[0] - rdata[0];
        __touch(12470);
        target.data[1] = ldata[1] - rdata[1];
        __touch(12471);
        return target;
        __touch(12472);
    };
    __touch(12442);
    Vector2.prototype.sub = function (rhs) {
        return Vector2.sub(this, rhs, this);
        __touch(12476);
    };
    __touch(12443);
    Vector2.mul = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs
            ];
            __touch(12482);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs
            ];
            __touch(12483);
        }
        if (!target) {
            target = new Vector2();
            __touch(12484);
        }
        var ldata = lhs.data || lhs;
        __touch(12477);
        var rdata = rhs.data || rhs;
        __touch(12478);
        target.data[0] = ldata[0] * rdata[0];
        __touch(12479);
        target.data[1] = ldata[1] * rdata[1];
        __touch(12480);
        return target;
        __touch(12481);
    };
    __touch(12444);
    Vector2.prototype.mul = function (rhs) {
        return Vector2.mul(this, rhs, this);
        __touch(12485);
    };
    __touch(12445);
    Vector2.div = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs
            ];
            __touch(12491);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs
            ];
            __touch(12492);
        }
        if (!target) {
            target = new Vector2();
            __touch(12493);
        }
        var ldata = lhs.data || lhs;
        __touch(12486);
        var rdata = rhs.data || rhs;
        __touch(12487);
        target.data[0] = ldata[0] / rdata[0];
        __touch(12488);
        target.data[1] = ldata[1] / rdata[1];
        __touch(12489);
        return target;
        __touch(12490);
    };
    __touch(12446);
    Vector2.prototype.div = function (rhs) {
        return Vector2.div(this, rhs, this);
        __touch(12494);
    };
    __touch(12447);
    Vector2.dot = function (lhs, rhs) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs
            ];
            __touch(12498);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs
            ];
            __touch(12499);
        }
        var ldata = lhs.data || lhs;
        __touch(12495);
        var rdata = rhs.data || rhs;
        __touch(12496);
        return ldata[0] * rdata[0] + ldata[1] * rdata[1];
        __touch(12497);
    };
    __touch(12448);
    Vector2.prototype.dot = function (rhs) {
        return Vector2.dot(this, rhs);
        __touch(12500);
    };
    __touch(12449);
    Vector2.prototype.setd = function (x, y) {
        this.data[0] = x;
        __touch(12501);
        this.data[1] = y;
        __touch(12502);
        return this;
        __touch(12503);
    };
    __touch(12450);
    Vector2.prototype.seta = function (array) {
        this.data[0] = array[0];
        __touch(12504);
        this.data[1] = array[1];
        __touch(12505);
        return this;
        __touch(12506);
    };
    __touch(12451);
    Vector2.prototype.setv = function (vec2) {
        this.data[0] = vec2.data[0];
        __touch(12507);
        this.data[1] = vec2.data[1];
        __touch(12508);
        return this;
        __touch(12509);
    };
    __touch(12452);
    Vector2.prototype.scale = function (factor) {
        this.data[0] *= factor;
        __touch(12510);
        this.data[1] *= factor;
        __touch(12511);
        return this;
        __touch(12512);
    };
    __touch(12453);
    Vector2.prototype.clone = function () {
        return new Vector2(this);
        __touch(12513);
    };
    __touch(12454);
    return Vector2;
    __touch(12455);
});
__touch(12431);
define(['goo/math/Vector'], function (Vector) {
    'use strict';
    __touch(12515);
    function Vector3() {
        Vector.call(this, 3);
        __touch(12560);
        if (arguments.length !== 0) {
            this.set(arguments);
            __touch(12561);
        } else {
            this.setd(0, 0, 0);
            __touch(12562);
        }
    }
    __touch(12516);
    Vector3.prototype = Object.create(Vector.prototype);
    __touch(12517);
    Vector.setupAliases(Vector3.prototype, [
        [
            'x',
            'u',
            'r'
        ],
        [
            'y',
            'v',
            'g'
        ],
        [
            'z',
            'w',
            'b'
        ]
    ]);
    __touch(12518);
    Vector3.ZERO = new Vector3(0, 0, 0);
    __touch(12519);
    Vector3.ONE = new Vector3(1, 1, 1);
    __touch(12520);
    Vector3.UNIT_X = new Vector3(1, 0, 0);
    __touch(12521);
    Vector3.UNIT_Y = new Vector3(0, 1, 0);
    __touch(12522);
    Vector3.UNIT_Z = new Vector3(0, 0, 1);
    __touch(12523);
    Vector3.add = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs
            ];
            __touch(12569);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs
            ];
            __touch(12570);
        }
        if (!target) {
            target = new Vector3();
            __touch(12571);
        }
        var ldata = lhs.data || lhs;
        __touch(12563);
        var rdata = rhs.data || rhs;
        __touch(12564);
        target.data[0] = ldata[0] + rdata[0];
        __touch(12565);
        target.data[1] = ldata[1] + rdata[1];
        __touch(12566);
        target.data[2] = ldata[2] + rdata[2];
        __touch(12567);
        return target;
        __touch(12568);
    };
    __touch(12524);
    Vector3.addv = function (lhs, rhs, target) {
        if (!target) {
            target = new Vector3();
            __touch(12576);
        }
        target.data[0] = lhs.data[0] + rhs.data[0];
        __touch(12572);
        target.data[1] = lhs.data[1] + rhs.data[1];
        __touch(12573);
        target.data[2] = lhs.data[2] + rhs.data[2];
        __touch(12574);
        return target;
        __touch(12575);
    };
    __touch(12525);
    Vector3.prototype.add = function (rhs) {
        return Vector3.add(this, rhs, this);
        __touch(12577);
    };
    __touch(12526);
    Vector3.sub = function (lhs, rhs, target) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs
            ];
            __touch(12584);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs
            ];
            __touch(12585);
        }
        if (!target) {
            target = new Vector3();
            __touch(12586);
        }
        var ldata = lhs.data || lhs;
        __touch(12578);
        var rdata = rhs.data || rhs;
        __touch(12579);
        target.data[0] = ldata[0] - rdata[0];
        __touch(12580);
        target.data[1] = ldata[1] - rdata[1];
        __touch(12581);
        target.data[2] = ldata[2] - rdata[2];
        __touch(12582);
        return target;
        __touch(12583);
    };
    __touch(12527);
    Vector3.subv = function (lhs, rhs, target) {
        if (!target) {
            target = new Vector3();
            __touch(12591);
        }
        target.data[0] = lhs.data[0] - rhs.data[0];
        __touch(12587);
        target.data[1] = lhs.data[1] - rhs.data[1];
        __touch(12588);
        target.data[2] = lhs.data[2] - rhs.data[2];
        __touch(12589);
        return target;
        __touch(12590);
    };
    __touch(12528);
    Vector3.prototype.sub = function (rhs) {
        return Vector3.sub(this, rhs, this);
        __touch(12592);
    };
    __touch(12529);
    Vector3.prototype.invert = function () {
        this.data[0] = 0 - this.data[0];
        __touch(12593);
        this.data[1] = 0 - this.data[1];
        __touch(12594);
        this.data[2] = 0 - this.data[2];
        __touch(12595);
        return this;
        __touch(12596);
    };
    __touch(12530);
    Vector3.mul = function (lhs, rhs, target) {
        if (!target) {
            target = new Vector3();
            __touch(12598);
        }
        if (typeof lhs === 'number') {
            var rdata = rhs.data || rhs;
            __touch(12599);
            target.data[0] = lhs * rdata[0];
            __touch(12600);
            target.data[1] = lhs * rdata[1];
            __touch(12601);
            target.data[2] = lhs * rdata[2];
            __touch(12602);
        } else if (typeof rhs === 'number') {
            var ldata = lhs.data || lhs;
            __touch(12603);
            target.data[0] = ldata[0] * rhs;
            __touch(12604);
            target.data[1] = ldata[1] * rhs;
            __touch(12605);
            target.data[2] = ldata[2] * rhs;
            __touch(12606);
        } else {
            var ldata = lhs.data || lhs;
            __touch(12607);
            var rdata = rhs.data || rhs;
            __touch(12608);
            target.data[0] = ldata[0] * rdata[0];
            __touch(12609);
            target.data[1] = ldata[1] * rdata[1];
            __touch(12610);
            target.data[2] = ldata[2] * rdata[2];
            __touch(12611);
        }
        return target;
        __touch(12597);
    };
    __touch(12531);
    Vector3.prototype.mul = function (rhs) {
        return Vector3.mul(this, rhs, this);
        __touch(12612);
    };
    __touch(12532);
    Vector3.div = function (lhs, rhs, target) {
        if (!target) {
            target = new Vector3();
            __touch(12614);
        }
        if (typeof lhs === 'number') {
            var rdata = rhs.data || rhs;
            __touch(12615);
            target.data[0] = lhs / rdata[0];
            __touch(12616);
            target.data[1] = lhs / rdata[1];
            __touch(12617);
            target.data[2] = lhs / rdata[2];
            __touch(12618);
        } else if (typeof rhs === 'number') {
            var irhs = 1 / rhs;
            __touch(12619);
            var ldata = lhs.data || lhs;
            __touch(12620);
            target.data[0] = ldata[0] * irhs;
            __touch(12621);
            target.data[1] = ldata[1] * irhs;
            __touch(12622);
            target.data[2] = ldata[2] * irhs;
            __touch(12623);
        } else {
            var ldata = lhs.data || lhs;
            __touch(12624);
            var rdata = rhs.data || rhs;
            __touch(12625);
            target.data[0] = ldata[0] / rdata[0];
            __touch(12626);
            target.data[1] = ldata[1] / rdata[1];
            __touch(12627);
            target.data[2] = ldata[2] / rdata[2];
            __touch(12628);
        }
        return target;
        __touch(12613);
    };
    __touch(12533);
    Vector3.prototype.div = function (rhs) {
        return Vector3.div(this, rhs, this);
        __touch(12629);
    };
    __touch(12534);
    Vector3.dot = function (lhs, rhs) {
        if (typeof lhs === 'number') {
            lhs = [
                lhs,
                lhs,
                lhs
            ];
            __touch(12633);
        }
        if (typeof rhs === 'number') {
            rhs = [
                rhs,
                rhs,
                rhs
            ];
            __touch(12634);
        }
        var ldata = lhs.data || lhs;
        __touch(12630);
        var rdata = rhs.data || rhs;
        __touch(12631);
        return ldata[0] * rdata[0] + ldata[1] * rdata[1] + ldata[2] * rdata[2];
        __touch(12632);
    };
    __touch(12535);
    Vector3.dotv = function (lhs, rhs) {
        var ldata = lhs.data;
        __touch(12635);
        var rdata = rhs.data;
        __touch(12636);
        return ldata[0] * rdata[0] + ldata[1] * rdata[1] + ldata[2] * rdata[2];
        __touch(12637);
    };
    __touch(12536);
    Vector3.prototype.dot = function (rhs) {
        return Vector3.dot(this, rhs);
        __touch(12638);
    };
    __touch(12537);
    Vector3.cross = function (lhs, rhs, target) {
        if (!target) {
            target = new Vector3();
            __touch(12648);
        }
        var ldata = lhs.data || lhs;
        __touch(12639);
        var rdata = rhs.data || rhs;
        __touch(12640);
        var x = rdata[2] * ldata[1] - rdata[1] * ldata[2];
        __touch(12641);
        var y = rdata[0] * ldata[2] - rdata[2] * ldata[0];
        __touch(12642);
        var z = rdata[1] * ldata[0] - rdata[0] * ldata[1];
        __touch(12643);
        target.data[0] = x;
        __touch(12644);
        target.data[1] = y;
        __touch(12645);
        target.data[2] = z;
        __touch(12646);
        return target;
        __touch(12647);
    };
    __touch(12538);
    Vector3.prototype.cross = function (rhs) {
        return Vector3.cross(this, rhs, this);
        __touch(12649);
    };
    __touch(12539);
    Vector3.prototype.lerp = function (end, factor) {
        this.data[0] = (1 - factor) * this.data[0] + factor * end.data[0];
        __touch(12650);
        this.data[1] = (1 - factor) * this.data[1] + factor * end.data[1];
        __touch(12651);
        this.data[2] = (1 - factor) * this.data[2] + factor * end.data[2];
        __touch(12652);
        return this;
        __touch(12653);
    };
    __touch(12540);
    Vector3.prototype.setd = function (x, y, z) {
        this.data[0] = x;
        __touch(12654);
        this.data[1] = y;
        __touch(12655);
        this.data[2] = z;
        __touch(12656);
        return this;
        __touch(12657);
    };
    __touch(12541);
    Vector3.prototype.seta = function (array) {
        this.data[0] = array[0];
        __touch(12658);
        this.data[1] = array[1];
        __touch(12659);
        this.data[2] = array[2];
        __touch(12660);
        return this;
        __touch(12661);
    };
    __touch(12542);
    Vector3.prototype.setv = function (vec3) {
        this.data[0] = vec3.data[0];
        __touch(12662);
        this.data[1] = vec3.data[1];
        __touch(12663);
        this.data[2] = vec3.data[2];
        __touch(12664);
        return this;
        __touch(12665);
    };
    __touch(12543);
    Vector3.prototype.add_d = function (x, y, z) {
        this.data[0] += x;
        __touch(12666);
        this.data[1] += y;
        __touch(12667);
        this.data[2] += z;
        __touch(12668);
        return this;
        __touch(12669);
    };
    __touch(12544);
    Vector3.prototype.addv = function (vec3) {
        this.data[0] += vec3.data[0];
        __touch(12670);
        this.data[1] += vec3.data[1];
        __touch(12671);
        this.data[2] += vec3.data[2];
        __touch(12672);
        return this;
        __touch(12673);
    };
    __touch(12545);
    Vector3.prototype.mulv = function (vec3) {
        this.data[0] *= vec3.data[0];
        __touch(12674);
        this.data[1] *= vec3.data[1];
        __touch(12675);
        this.data[2] *= vec3.data[2];
        __touch(12676);
        return this;
        __touch(12677);
    };
    __touch(12546);
    Vector3.prototype.muld = function (x, y, z) {
        this.data[0] *= x;
        __touch(12678);
        this.data[1] *= y;
        __touch(12679);
        this.data[2] *= z;
        __touch(12680);
        return this;
        __touch(12681);
    };
    __touch(12547);
    Vector3.prototype.subv = function (vec3) {
        this.data[0] -= vec3.data[0];
        __touch(12682);
        this.data[1] -= vec3.data[1];
        __touch(12683);
        this.data[2] -= vec3.data[2];
        __touch(12684);
        return this;
        __touch(12685);
    };
    __touch(12548);
    Vector3.prototype.sub_d = function (x, y, z) {
        this.data[0] -= x;
        __touch(12686);
        this.data[1] -= y;
        __touch(12687);
        this.data[2] -= z;
        __touch(12688);
        return this;
        __touch(12689);
    };
    __touch(12549);
    Vector3.prototype.scale = function (factor) {
        this.data[0] *= factor;
        __touch(12690);
        this.data[1] *= factor;
        __touch(12691);
        this.data[2] *= factor;
        __touch(12692);
        return this;
        __touch(12693);
    };
    __touch(12550);
    Vector3.prototype.lengthSquared = function () {
        return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
        __touch(12694);
    };
    __touch(12551);
    Vector3.prototype.length = function () {
        return Math.sqrt(this.lengthSquared());
        __touch(12695);
    };
    __touch(12552);
    Vector3.prototype.normalize = function () {
        var l = this.length();
        __touch(12696);
        if (l < 1e-7) {
            this.data[0] = 0;
            __touch(12698);
            this.data[1] = 0;
            __touch(12699);
            this.data[2] = 0;
            __touch(12700);
        } else {
            l = 1 / l;
            __touch(12701);
            this.data[0] *= l;
            __touch(12702);
            this.data[1] *= l;
            __touch(12703);
            this.data[2] *= l;
            __touch(12704);
        }
        return this;
        __touch(12697);
    };
    __touch(12553);
    Vector3.distanceSquared = function (lhs, rhs) {
        var x = lhs.data[0] - rhs.data[0], y = lhs.data[1] - rhs.data[1], z = lhs.data[2] - rhs.data[2];
        __touch(12705);
        return x * x + y * y + z * z;
        __touch(12706);
    };
    __touch(12554);
    Vector3.distance = function (lhs, rhs) {
        return Math.sqrt(Vector3.distanceSquared(lhs, rhs));
        __touch(12707);
    };
    __touch(12555);
    Vector3.prototype.distanceSquared = function (v) {
        return Vector3.distanceSquared(this, v);
        __touch(12708);
    };
    __touch(12556);
    Vector3.prototype.distance = function (v) {
        return Vector3.distance(this, v);
        __touch(12709);
    };
    __touch(12557);
    Vector3.prototype.clone = function () {
        return new Vector3(this);
        __touch(12710);
    };
    __touch(12558);
    return Vector3;
    __touch(12559);
});
__touch(12514);
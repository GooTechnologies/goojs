define(['goo/math/MathUtils'], function (MathUtils) {
    'use strict';
    __touch(12307);
    function Vector(size) {
        this.data = new Float32Array(size);
        __touch(12339);
    }
    __touch(12308);
    Vector.setupAliases = function (prototype, aliases) {
        for (var i = 0; i < aliases.length; i++) {
            (function (index) {
                for (var j = 0; j < aliases[index].length; j++) {
                    Object.defineProperty(prototype, aliases[index][j], {
                        get: function () {
                            return this.data[index];
                            __touch(12343);
                        },
                        set: function (value) {
                            this.data[index] = value;
                            __touch(12344);
                        }
                    });
                    __touch(12342);
                }
                Object.defineProperty(prototype, i, {
                    get: function () {
                        return this.data[index];
                        __touch(12345);
                    },
                    set: function (value) {
                        this.data[index] = value;
                        __touch(12346);
                    }
                });
                __touch(12341);
            }(i));
            __touch(12340);
        }
    };
    __touch(12309);
    Vector.add = function (lhs, rhs, target) {
        var ldata = lhs.data || lhs;
        __touch(12347);
        var rdata = rhs.data || rhs;
        __touch(12348);
        var size = ldata.length;
        __touch(12349);
        if (!target) {
            target = new Vector(size);
            __touch(12351);
        }
        for (var i = 0; i < size; i++) {
            target.data[i] = ldata[i] + rdata[i];
            __touch(12352);
        }
        return target;
        __touch(12350);
    };
    __touch(12310);
    Vector.prototype.add = function (rhs) {
        return Vector.add(this, rhs, this);
        __touch(12353);
    };
    __touch(12311);
    Vector.sub = function (lhs, rhs, target) {
        var ldata = lhs.data || lhs;
        __touch(12354);
        var rdata = rhs.data || rhs;
        __touch(12355);
        var size = ldata.length;
        __touch(12356);
        if (!target) {
            target = new Vector(size);
            __touch(12358);
        }
        for (var i = 0; i < size; i++) {
            target.data[i] = ldata[i] - rdata[i];
            __touch(12359);
        }
        return target;
        __touch(12357);
    };
    __touch(12312);
    Vector.prototype.sub = function (rhs) {
        return Vector.sub(this, rhs, this);
        __touch(12360);
    };
    __touch(12313);
    Vector.mul = function (lhs, rhs, target) {
        var ldata = lhs.data || lhs;
        __touch(12361);
        var rdata = rhs.data || rhs;
        __touch(12362);
        var size = ldata.length;
        __touch(12363);
        if (!target) {
            target = new Vector(size);
            __touch(12365);
        }
        for (var i = 0; i < size; i++) {
            target.data[i] = ldata[i] * rdata[i];
            __touch(12366);
        }
        return target;
        __touch(12364);
    };
    __touch(12314);
    Vector.prototype.mul = function (rhs) {
        return Vector.mul(this, rhs, this);
        __touch(12367);
    };
    __touch(12315);
    Vector.div = function (lhs, rhs, target) {
        var ldata = lhs.data || lhs;
        __touch(12368);
        var rdata = rhs.data || rhs;
        __touch(12369);
        var size = ldata.length;
        __touch(12370);
        if (!target) {
            target = new Vector(size);
            __touch(12372);
        }
        for (var i = 0; i < size; i++) {
            target.data[i] = ldata[i] / rdata[i];
            __touch(12373);
        }
        return target;
        __touch(12371);
    };
    __touch(12316);
    Vector.prototype.div = function (rhs) {
        return Vector.div(this, rhs, this);
        __touch(12374);
    };
    __touch(12317);
    Vector.copy = function (source, target) {
        var size = source.data.length;
        __touch(12375);
        if (!target) {
            target = new Vector(size);
            __touch(12378);
        }
        target.data.set(source.data);
        __touch(12376);
        return target;
        __touch(12377);
    };
    __touch(12318);
    Vector.prototype.copy = function (source) {
        return Vector.copy(source, this);
        __touch(12379);
    };
    __touch(12319);
    Vector.dot = function (lhs, rhs) {
        var ldata = lhs.data || lhs;
        __touch(12380);
        var rdata = rhs.data || rhs;
        __touch(12381);
        var size = ldata.length;
        __touch(12382);
        var sum = 0;
        __touch(12383);
        for (var i = 0; i < size; i++) {
            sum += ldata[i] * rdata[i];
            __touch(12385);
        }
        return sum;
        __touch(12384);
    };
    __touch(12320);
    Vector.prototype.dot = function (rhs) {
        return Vector.dot(this, rhs);
        __touch(12386);
    };
    __touch(12321);
    Vector.apply = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(12387);
        var cols = lhs.cols;
        __touch(12388);
        var size = rhs.data.length;
        __touch(12389);
        if (!target) {
            target = new Vector(rows);
            __touch(12391);
        }
        if (target === rhs) {
            return Vector.copy(Vector.apply(lhs, rhs), target);
            __touch(12392);
        }
        for (var c = 0; c < cols; c++) {
            var o = c * rows;
            __touch(12393);
            for (var r = 0; r < rows; r++) {
                var sum = 0;
                __touch(12394);
                for (var i = 0; i < size; i++) {
                    sum += lhs.data[i * lhs.rows + r] * rhs.data[i];
                    __touch(12396);
                }
                target.data[o + r] = sum;
                __touch(12395);
            }
        }
        return target;
        __touch(12390);
    };
    __touch(12322);
    Vector.prototype.apply = function (lhs) {
        return Vector.apply(lhs, this, this);
        __touch(12397);
    };
    __touch(12323);
    Vector.equals = function (lhs, rhs) {
        var lhsLength = lhs.data.length;
        __touch(12398);
        if (lhsLength !== rhs.data.length) {
            return false;
            __touch(12400);
        }
        for (var i = 0; i < lhsLength; i++) {
            if (Math.abs(lhs.data[i] - rhs.data[i]) > MathUtils.EPSILON) {
                return false;
                __touch(12401);
            }
        }
        return true;
        __touch(12399);
    };
    __touch(12324);
    Vector.prototype.equals = function (rhs) {
        return Vector.equals(this, rhs);
        __touch(12402);
    };
    __touch(12325);
    Vector.distanceSquared = function (lhs, rhs) {
        return Vector.sub(lhs, rhs).lengthSquared();
        __touch(12403);
    };
    __touch(12326);
    Vector.prototype.distanceSquared = function (rhs) {
        return Vector.sub(this, rhs).lengthSquared();
        __touch(12404);
    };
    __touch(12327);
    Vector.distance = function (lhs, rhs) {
        return Vector.sub(lhs, rhs).length();
        __touch(12405);
    };
    __touch(12328);
    Vector.prototype.distance = function (rhs) {
        return Vector.sub(this, rhs).length();
        __touch(12406);
    };
    __touch(12329);
    Vector.prototype.lengthSquared = function () {
        return Vector.dot(this, this);
        __touch(12407);
    };
    __touch(12330);
    Vector.prototype.length = function () {
        return Math.sqrt(Vector.dot(this, this));
        __touch(12408);
    };
    __touch(12331);
    Vector.prototype.scale = function (factor) {
        for (var i = this.data.length - 1; i >= 0; i--) {
            this.data[i] *= factor;
            __touch(12410);
        }
        return this;
        __touch(12409);
    };
    __touch(12332);
    Vector.prototype.invert = function () {
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] = 0 - this.data[i];
            __touch(12412);
        }
        return this;
        __touch(12411);
    };
    __touch(12333);
    Vector.prototype.normalize = function () {
        var l = this.length();
        __touch(12413);
        var dataLength = this.data.length;
        __touch(12414);
        if (l < MathUtils.EPSILON) {
            for (var i = 0; i < dataLength; i++) {
                this.data[i] = 0;
                __touch(12416);
            }
        } else {
            l = 1 / l;
            __touch(12417);
            for (var i = 0; i < dataLength; i++) {
                this.data[i] *= l;
                __touch(12418);
            }
        }
        return this;
        __touch(12415);
    };
    __touch(12334);
    Vector.prototype.clone = function () {
        return Vector.copy(this);
        __touch(12419);
    };
    __touch(12335);
    Vector.prototype.set = function () {
        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            if (arguments[0] instanceof Vector) {
                this.copy(arguments[0]);
                __touch(12421);
            } else if (arguments[0].length > 1) {
                for (var i = 0; i < arguments[0].length; i++) {
                    this.data[i] = arguments[0][i];
                    __touch(12422);
                }
            } else {
                this.set(arguments[0][0]);
                __touch(12423);
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                this.data[i] = arguments[i];
                __touch(12424);
            }
        }
        return this;
        __touch(12420);
    };
    __touch(12336);
    Vector.prototype.toString = function () {
        var string = '';
        __touch(12425);
        string += '[';
        __touch(12426);
        for (var i = 0; i < this.data.length; i++) {
            string += this.data[i];
            __touch(12429);
            string += i !== this.data.length - 1 ? ', ' : '';
            __touch(12430);
        }
        string += ']';
        __touch(12427);
        return string;
        __touch(12428);
    };
    __touch(12337);
    return Vector;
    __touch(12338);
});
__touch(12306);
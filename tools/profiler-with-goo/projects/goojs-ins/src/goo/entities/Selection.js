define([], function () {
    'use strict';
    __touch(4407);
    function Selection() {
        this.stack = [];
        __touch(4429);
        if (arguments.length === 1) {
            var argument = arguments[0];
            __touch(4431);
            if (argument instanceof Selection) {
                if (argument.top) {
                    this.stack.push(argument.top);
                    __touch(4432);
                }
            } else if (Array.isArray(argument)) {
                this.stack.push(argument);
                __touch(4433);
            } else {
                this.stack.push([argument]);
                __touch(4434);
            }
        } else if (arguments.length > 1) {
            this.stack.push(Array.prototype.slice.call(arguments, 0));
            __touch(4435);
        }
        if (this.stack.length > 0) {
            this.stack[0] = removeDuplicates(this.stack[0]);
            __touch(4436);
        }
        this.top = this.stack.length === 0 ? null : this.stack[0];
        __touch(4430);
    }
    __touch(4408);
    Selection.EMPTY = new Selection();
    __touch(4409);
    Selection.prototype.contains = function (element) {
        if (this.top === null) {
            return false;
            __touch(4438);
        }
        return this.top.indexOf(element) !== -1;
        __touch(4437);
    };
    __touch(4410);
    Selection.prototype.size = function () {
        if (this.top === null) {
            return 0;
            __touch(4440);
        }
        return this.top.length;
        __touch(4439);
    };
    __touch(4411);
    Selection.prototype.each = function (fun) {
        if (this.top === null) {
            return this;
            __touch(4442);
        }
        for (var i = 0; i < this.top.length; i++) {
            if (fun(this.top[i], i) === false) {
                break;
                __touch(4443);
            }
        }
        return this;
        __touch(4441);
    };
    __touch(4412);
    Selection.prototype.filter = function (predicate) {
        if (this.top === null) {
            return this;
            __touch(4448);
        }
        var top = this.top.filter(predicate);
        __touch(4444);
        this.stack.push(top);
        __touch(4445);
        this.top = top;
        __touch(4446);
        return this;
        __touch(4447);
    };
    __touch(4413);
    Selection.prototype.map = function (fun) {
        if (this.top === null) {
            return this;
            __touch(4453);
        }
        var top = this.top.map(fun);
        __touch(4449);
        this.stack.push(top);
        __touch(4450);
        this.top = top;
        __touch(4451);
        return this;
        __touch(4452);
    };
    __touch(4414);
    Selection.prototype.flatMap = function (fun) {
        if (this.top === null) {
            return this;
            __touch(4459);
        }
        var map = this.top.map(fun);
        __touch(4454);
        var flatMap = map.reduce(function (prev, cur) {
            return prev.concat(cur);
            __touch(4460);
        }, []);
        __touch(4455);
        this.stack.push(flatMap);
        __touch(4456);
        this.top = flatMap;
        __touch(4457);
        return this;
        __touch(4458);
    };
    __touch(4415);
    Selection.prototype.reduce = function (fun, initialValue) {
        if (this.top === null) {
            return this;
            __touch(4465);
        }
        var top = [this.top.reduce(fun, initialValue)];
        __touch(4461);
        this.stack.push(top);
        __touch(4462);
        this.top = top;
        __touch(4463);
        return this;
        __touch(4464);
    };
    __touch(4416);
    Selection.prototype.and = function () {
        if (this.top === null) {
            return this;
            __touch(4472);
        }
        var that = toArray.apply(null, arguments);
        __touch(4466);
        var union = this.top.concat(that);
        __touch(4467);
        union = removeDuplicates(union);
        __touch(4468);
        this.stack.push(union);
        __touch(4469);
        this.top = union;
        __touch(4470);
        return this;
        __touch(4471);
    };
    __touch(4417);
    Selection.prototype.intersects = function (that) {
        if (this.top === null) {
            return this;
            __touch(4479);
        }
        var that = toArray.apply(null, arguments);
        __touch(4473);
        var intersection = [];
        __touch(4474);
        var shortArray, longArray;
        __touch(4475);
        if (that.length > this.top.length) {
            shortArray = this.top;
            __touch(4480);
            longArray = that;
            __touch(4481);
        } else {
            shortArray = that;
            __touch(4482);
            longArray = this.top;
            __touch(4483);
        }
        for (var i = 0; i < shortArray.length; i++) {
            var element = shortArray[i];
            __touch(4484);
            if (longArray.indexOf(element) !== -1) {
                intersection.push(element);
                __touch(4485);
            }
        }
        this.stack.push(intersection);
        __touch(4476);
        this.top = intersection;
        __touch(4477);
        return this;
        __touch(4478);
    };
    __touch(4418);
    Selection.prototype.without = function () {
        if (this.top === null) {
            return this;
            __touch(4491);
        }
        var that = toArray.apply(null, arguments);
        __touch(4486);
        var difference = [];
        __touch(4487);
        for (var i = 0; i < this.top.length; i++) {
            var element = this.top[i];
            __touch(4492);
            if (that.indexOf(element) === -1) {
                difference.push(element);
                __touch(4493);
            }
        }
        this.stack.push(difference);
        __touch(4488);
        this.top = difference;
        __touch(4489);
        return this;
        __touch(4490);
    };
    __touch(4419);
    Selection.prototype.andSelf = function () {
        if (this.top === null) {
            return this;
            __touch(4500);
        }
        if (this.stack.length <= 1) {
            return this;
            __touch(4501);
        }
        var prev = this.stack[this.stack.length - 2];
        __touch(4494);
        var union = prev.concat(this.top);
        __touch(4495);
        union = removeDuplicates(union);
        __touch(4496);
        this.stack.push(union);
        __touch(4497);
        this.top = union;
        __touch(4498);
        return this;
        __touch(4499);
    };
    __touch(4420);
    Selection.prototype.end = function () {
        if (this.top === null) {
            return this;
            __touch(4504);
        }
        this.stack.pop();
        __touch(4502);
        if (this.stack.length === 0) {
            this.top = null;
            __touch(4505);
        } else {
            this.top = this.stack[this.stack.length - 1];
            __touch(4506);
        }
        return this;
        __touch(4503);
    };
    __touch(4421);
    Selection.prototype.first = function () {
        return this.top === null ? null : this.top[0];
        __touch(4507);
    };
    __touch(4422);
    Selection.prototype.clone = function () {
        var clone = new Selection();
        __touch(4508);
        clone.top = this.top;
        __touch(4509);
        clone.stack = this.stack.concat([]);
        __touch(4510);
        return clone;
        __touch(4511);
    };
    __touch(4423);
    Selection.prototype.get = function (index) {
        if (typeof index !== 'number') {
            return this.top === null ? [] : this.top.concat([]);
            __touch(4512);
        }
        if (index < 0) {
            return this.top === null ? undefined : this.top[this.top.length + index];
            __touch(4513);
        } else {
            return this.top === null ? undefined : this.top[index];
            __touch(4514);
        }
    };
    __touch(4424);
    Selection.prototype.toArray = function () {
        return this.top === null ? [] : this.top.concat([]);
        __touch(4515);
    };
    __touch(4425);
    function removeDuplicates(array) {
        var newArray = [];
        __touch(4516);
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            __touch(4518);
            if (array.lastIndexOf(element) === i) {
                newArray.push(element);
                __touch(4519);
            }
        }
        return newArray;
        __touch(4517);
    }
    __touch(4426);
    function toArray() {
        if (arguments.length === 1) {
            var argument = arguments[0];
            __touch(4520);
            if (argument instanceof Selection) {
                if (argument.top) {
                    return argument.top;
                    __touch(4521);
                } else {
                    return [];
                    __touch(4522);
                }
            } else if (Array.isArray(argument)) {
                return argument;
                __touch(4523);
            } else {
                return [argument];
                __touch(4524);
            }
        } else if (arguments.length > 1) {
            return Array.prototype.slice.call(arguments, 0);
            __touch(4525);
        } else {
            return [];
            __touch(4526);
        }
    }
    __touch(4427);
    return Selection;
    __touch(4428);
});
__touch(4406);
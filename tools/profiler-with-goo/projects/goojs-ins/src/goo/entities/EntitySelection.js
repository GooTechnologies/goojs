define(['goo/entities/Selection'], function (Selection) {
    'use strict';
    __touch(3963);
    function EntitySelection() {
        Selection.apply(this, arguments);
        __touch(3975);
    }
    __touch(3964);
    EntitySelection.prototype = Object.create(Selection.prototype);
    __touch(3965);
    EntitySelection.prototype.constructor = EntitySelection;
    __touch(3966);
    EntitySelection.prototype.and = function (that) {
        if (this.top === null) {
            return this;
            __touch(3984);
        }
        var union;
        __touch(3976);
        var that = toArray.apply(null, arguments);
        __touch(3977);
        var shortArray, longArray;
        __touch(3978);
        if (that.length > this.top.length) {
            shortArray = this.top;
            __touch(3985);
            longArray = that;
            __touch(3986);
        } else {
            shortArray = that;
            __touch(3987);
            longArray = this.top;
            __touch(3988);
        }
        var hashTable = [];
        __touch(3979);
        for (var i = 0; i < longArray.length; i++) {
            var id = longArray[i].id;
            __touch(3989);
            hashTable[id] = true;
            __touch(3990);
        }
        union = longArray.concat([]);
        __touch(3980);
        for (var i = 0; i < shortArray.length; i++) {
            if (!hashTable[shortArray[i].id]) {
                union.push(shortArray[i]);
                __touch(3991);
            }
        }
        this.stack.push(union);
        __touch(3981);
        this.top = union;
        __touch(3982);
        return this;
        __touch(3983);
    };
    __touch(3967);
    EntitySelection.prototype.intersects = function (that) {
        if (this.top === null) {
            return this;
            __touch(4000);
        }
        var intersection;
        __touch(3992);
        var that = toArray.apply(null, arguments);
        __touch(3993);
        var shortArray, longArray;
        __touch(3994);
        if (that.length > this.top.length) {
            shortArray = this.top;
            __touch(4001);
            longArray = that;
            __touch(4002);
        } else {
            shortArray = that;
            __touch(4003);
            longArray = this.top;
            __touch(4004);
        }
        var hashTable = [];
        __touch(3995);
        for (var i = 0; i < longArray.length; i++) {
            var id = longArray[i].id;
            __touch(4005);
            hashTable[id] = true;
            __touch(4006);
        }
        intersection = [];
        __touch(3996);
        for (var i = 0; i < shortArray.length; i++) {
            if (hashTable[shortArray[i].id]) {
                intersection.push(shortArray[i]);
                __touch(4007);
            }
        }
        this.stack.push(intersection);
        __touch(3997);
        this.top = intersection;
        __touch(3998);
        return this;
        __touch(3999);
    };
    __touch(3968);
    EntitySelection.prototype.without = function () {
        if (this.top === null) {
            return this;
            __touch(4015);
        }
        var difference;
        __touch(4008);
        var that = toArray.apply(null, arguments);
        __touch(4009);
        var hashTable = [];
        __touch(4010);
        for (var i = 0; i < that.length; i++) {
            var id = that[i].id;
            __touch(4016);
            hashTable[id] = true;
            __touch(4017);
        }
        difference = [];
        __touch(4011);
        for (var i = 0; i < this.top.length; i++) {
            if (!hashTable[this.top[i].id]) {
                difference.push(this.top[i]);
                __touch(4018);
            }
        }
        this.stack.push(difference);
        __touch(4012);
        this.top = difference;
        __touch(4013);
        return this;
        __touch(4014);
    };
    __touch(3969);
    EntitySelection.prototype.andSelf = function () {
        if (this.top === null) {
            return this;
            __touch(4021);
        }
        if (this.stack.length <= 1) {
            return this;
            __touch(4022);
        }
        var prev = this.stack[this.stack.length - 2];
        __touch(4019);
        return this.and.apply(this, prev);
        __touch(4020);
    };
    __touch(3970);
    EntitySelection.prototype.parent = function () {
        if (this.top === null) {
            return this;
            __touch(4028);
        }
        var hashTable = [];
        __touch(4023);
        var parents = this.top.filter(function (entity) {
            if (!entity.transformComponent.parent) {
                return false;
                __touch(4029);
            } else if (hashTable[entity.transformComponent.parent.entity.id]) {
                return false;
                __touch(4030);
            } else {
                hashTable[entity.transformComponent.parent.entity.id] = true;
                __touch(4031);
                return true;
                __touch(4032);
            }
        }).map(function (entity) {
            return entity.transformComponent.parent.entity;
            __touch(4033);
        });
        __touch(4024);
        this.stack.push(parents);
        __touch(4025);
        this.top = parents;
        __touch(4026);
        return this;
        __touch(4027);
    };
    __touch(3971);
    EntitySelection.prototype.children = function () {
        if (this.top === null) {
            return this;
            __touch(4039);
        }
        var children = this.top.map(function (entity) {
            return entity.transformComponent.children.map(function (childTransform) {
                return childTransform.entity;
                __touch(4041);
            });
            __touch(4040);
        });
        __touch(4034);
        var flatChildren = children.reduce(function (prev, cur) {
            return prev.concat(cur);
            __touch(4042);
        }, []);
        __touch(4035);
        this.stack.push(flatChildren);
        __touch(4036);
        this.top = flatChildren;
        __touch(4037);
        return this;
        __touch(4038);
    };
    __touch(3972);
    function toArray() {
        if (arguments.length === 1) {
            var argument = arguments[0];
            __touch(4043);
            if (argument instanceof EntitySelection) {
                if (argument.top) {
                    return argument.top;
                    __touch(4044);
                } else {
                    return [];
                    __touch(4045);
                }
            } else if (Array.isArray(argument)) {
                return argument;
                __touch(4046);
            } else {
                return [argument];
                __touch(4047);
            }
        } else if (arguments.length > 1) {
            return Array.prototype.slice.call(arguments, 0);
            __touch(4048);
        } else {
            return [];
            __touch(4049);
        }
    }
    __touch(3973);
    return EntitySelection;
    __touch(3974);
});
__touch(3962);
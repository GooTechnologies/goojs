define([], function () {
    'use strict';
    __touch(21989);
    var _ = {};
    __touch(21990);
    var ArrayProto = Array.prototype;
    __touch(21991);
    var slice = ArrayProto.slice;
    __touch(21992);
    var nativeForEach = ArrayProto.forEach;
    __touch(21993);
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (typeof obj[prop] === 'undefined' || obj[prop] === null) {
                        obj[prop] = source[prop];
                        __touch(22004);
                    }
                }
                __touch(22003);
            }
        });
        __touch(22001);
        return obj;
        __touch(22002);
    };
    __touch(21994);
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                    __touch(22008);
                }
                __touch(22007);
            }
        });
        __touch(22005);
        return obj;
        __touch(22006);
    };
    __touch(21995);
    _.isObject = function (obj) {
        return obj === Object(obj);
        __touch(22009);
    };
    __touch(21996);
    _.clone = function (obj) {
        if (!_.isObject(obj)) {
            return obj;
            __touch(22011);
        }
        return Array.isArray(obj) ? obj.slice() : _.extend({}, obj);
        __touch(22010);
    };
    __touch(21997);
    var each = _.each = _.forEach = function (obj, iterator, context, sortProp) {
        if (typeof obj === 'undefined' || obj === null) {
            return;
            __touch(22012);
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
            __touch(22013);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                iterator.call(context, obj[i], i, obj);
                __touch(22014);
            }
        } else {
            var keys = Object.keys(obj);
            __touch(22015);
            if (sortProp !== undefined) {
                keys.sort(function (a, b) {
                    return obj[a][sortProp] - obj[b][sortProp];
                    __touch(22017);
                });
                __touch(22016);
            }
            for (var i = 0, length = keys.length; i < length; i++) {
                iterator.call(context, obj[keys[i]], keys[i], obj);
                __touch(22018);
            }
        }
    };
    __touch(21998);
    _.deepClone = function (item) {
        if (!item) {
            return item;
            __touch(22023);
        }
        var types = [
            Number,
            String,
            Boolean
        ];
        __touch(22019);
        var result;
        __touch(22020);
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
                __touch(22024);
            }
        });
        __touch(22021);
        if (typeof result === 'undefined') {
            if (Object.prototype.toString.call(item) === '[object Array]') {
                result = [];
                __touch(22025);
                item.forEach(function (child, index) {
                    result[index] = _.deepClone(child);
                    __touch(22027);
                });
                __touch(22026);
            } else if (typeof item === 'object') {
                if (item.nodeType && typeof item.cloneNode === 'function') {
                    var result = item.cloneNode(true);
                    __touch(22028);
                } else if (!item.prototype) {
                    if (item instanceof Date) {
                        result = new Date(item);
                        __touch(22029);
                    } else {
                        result = {};
                        __touch(22030);
                        for (var i in item) {
                            result[i] = _.deepClone(item[i]);
                            __touch(22032);
                        }
                        __touch(22031);
                    }
                } else {
                    if (false && item.constructor) {
                        result = new item.constructor();
                        __touch(22033);
                    } else {
                        result = item;
                        __touch(22034);
                    }
                }
            } else {
                result = item;
                __touch(22035);
            }
        }
        return result;
        __touch(22022);
    };
    __touch(21999);
    return _;
    __touch(22000);
});
__touch(21988);
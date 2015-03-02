define([], function () {
    'use strict';
    __touch(21614);
    var ArrayUtil = {};
    __touch(21615);
    ArrayUtil.getTypedArray = function (arrayBuffer, pointer) {
        var start = pointer[0];
        __touch(21620);
        var length = pointer[1];
        __touch(21621);
        var format = pointer[2];
        __touch(21622);
        if (format === 'float32') {
            return new Float32Array(arrayBuffer, start, length);
            __touch(21623);
        } else if (format === 'uint8') {
            return new Uint8Array(arrayBuffer, start, length);
            __touch(21624);
        } else if (format === 'uint16') {
            return new Uint16Array(arrayBuffer, start, length);
            __touch(21625);
        } else if (format === 'uint32') {
            return new Uint32Array(arrayBuffer, start, length);
            __touch(21626);
        } else {
            throw new Error('Binary format ' + format + ' is not supported');
            __touch(21627);
        }
    };
    __touch(21616);
    ArrayUtil.remove = function (array, value, equals) {
        var idx = -1;
        __touch(21628);
        if (typeof equals === 'function') {
            for (var i = 0; i < array.length; i++) {
                if (equals(array[i], value)) {
                    idx = i;
                    __touch(21629);
                    break;
                    __touch(21630);
                }
            }
        } else {
            idx = array.indexOf(value);
            __touch(21631);
        }
        if (idx > -1) {
            array.splice(idx, 1);
            __touch(21632);
        }
    };
    __touch(21617);
    ArrayUtil.find = function (array, predicate) {
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                return array[i];
                __touch(21634);
            }
        }
        return null;
        __touch(21633);
    };
    __touch(21618);
    return ArrayUtil;
    __touch(21619);
});
__touch(21613);
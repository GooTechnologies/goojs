define(['goo/math/Transform'], function (Transform) {
    'use strict';
    __touch(2121);
    function Joint(name) {
        this._name = name;
        __touch(2125);
        this._index = 0;
        __touch(2126);
        this._parentIndex = 0;
        __touch(2127);
        this._inverseBindPose = new Transform();
        __touch(2128);
    }
    __touch(2122);
    Joint.NO_PARENT = -32768;
    __touch(2123);
    return Joint;
    __touch(2124);
});
__touch(2120);
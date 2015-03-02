(function () {
    'use strict';
    __touch(6);
    for (var i = 0; i < 3; i++) {
        console.log('asd');
        __touch(7);
    }
    for (var i = 0; i < 5; i++) {
        console.log('fgh');
        __touch(8);
        if (i % 2 === 0) {
            console.log('zxc');
            __touch(9);
        }
    }
}());
__touch(5);
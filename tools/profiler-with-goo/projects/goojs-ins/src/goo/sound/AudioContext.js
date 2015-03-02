define([], function () {
    'use strict';
    __touch(21109);
    try {
        var Context = window.AudioContext || window.webkitAudioContext;
        __touch(21111);
        return new Context();
        __touch(21112);
    } catch (e) {
        console.warn('Web audio not supported');
        __touch(21113);
    }
    __touch(21110);
});
__touch(21108);
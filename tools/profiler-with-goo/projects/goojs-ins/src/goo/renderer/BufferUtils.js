define(function () {
    'use strict';
    __touch(15406);
    function BufferUtils() {
    }
    __touch(15407);
    BufferUtils.createIndexBuffer = function (indexCount, vertexCount) {
        var indices;
        __touch(15412);
        if (vertexCount <= 256) {
            if (BufferUtils.browserType === 'Trident') {
                indices = new Uint16Array(indexCount);
                __touch(15414);
            } else {
                indices = new Uint8Array(indexCount);
                __touch(15415);
            }
        } else if (vertexCount <= 65536) {
            indices = new Uint16Array(indexCount);
            __touch(15416);
        } else {
            throw new Error('Maximum number of vertices is 65536. Got: ' + vertexCount);
            __touch(15417);
        }
        return indices;
        __touch(15413);
    };
    __touch(15408);
    function storeBrowserType() {
        var aKeys = [
                'Trident',
                'MSIE',
                'Firefox',
                'Safari',
                'Chrome',
                'Opera'
            ], sUsrAg = navigator.userAgent, nIdx = aKeys.length - 1;
        __touch(15418);
        for (nIdx; nIdx > -1 && sUsrAg.indexOf(aKeys[nIdx]) === -1; nIdx--) {
        }
        BufferUtils.browserType = aKeys[nIdx];
        __touch(15419);
    }
    __touch(15409);
    storeBrowserType();
    __touch(15410);
    return BufferUtils;
    __touch(15411);
});
__touch(15405);
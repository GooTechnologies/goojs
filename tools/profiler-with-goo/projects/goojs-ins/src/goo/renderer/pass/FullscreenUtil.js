define([
    'goo/shapes/Quad',
    'goo/renderer/Camera',
    'goo/math/Vector3'
], function (Quad, Camera, Vector3) {
    'use strict';
    __touch(18482);
    function FullscreenUtil() {
    }
    __touch(18483);
    var camera = new Camera();
    __touch(18484);
    camera.projectionMode = Camera.Parallel;
    __touch(18485);
    camera.setFrustum(0, 1, -1, 1, 1, -1);
    __touch(18486);
    camera._left.copy(Vector3.UNIT_X).invert();
    __touch(18487);
    camera._up.copy(Vector3.UNIT_Y);
    __touch(18488);
    camera._direction.copy(Vector3.UNIT_Z);
    __touch(18489);
    camera.onFrameChange();
    __touch(18490);
    FullscreenUtil.camera = camera;
    __touch(18491);
    FullscreenUtil.quad = new Quad(2, 2);
    __touch(18492);
    return FullscreenUtil;
    __touch(18493);
});
__touch(18481);
define([
    'goo/scripts/Scripts',
    'goo/scripts/OrbitCamControlScript',
    'goo/scriptpack/OrbitNPanControlScript',
    'goo/scriptpack/FlyControlScript',
    'goo/scriptpack/AxisAlignedCamControlScript',
    'goo/scriptpack/PanCamScript',
    'goo/scriptpack/MouseLookControlScript',
    'goo/scriptpack/WASDControlScript',
    'goo/scriptpack/ButtonScript',
    'goo/scriptpack/PickAndRotateScript',
    'goo/scriptpack/LensFlareScript'
], function (Scripts) {
    'use strict';
    __touch(20088);
    for (var i = 1; i < arguments.length; i++) {
        Scripts.register(arguments[i]);
        __touch(20089);
        Scripts.addClass(arguments[i].name, arguments[i]);
        __touch(20090);
    }
});
__touch(20087);
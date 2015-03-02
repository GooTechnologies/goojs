define([
    'goo/scripts/Scripts',
    'goo/passpack/BloomPass',
    'goo/passpack/BlurPass',
    'goo/passpack/DOFPass',
    'goo/passpack/DepthPass',
    'goo/passpack/DoGPass',
    'goo/passpack/MotionBlurPass',
    'goo/passpack/NesPass',
    'goo/passpack/PassLib',
    'goo/passpack/SSAOPass'
], function (Scripts) {
    'use strict';
    __touch(15015);
    var defines = [
        'goo/scripts/Scripts',
        'goo/passpack/BloomPass',
        'goo/passpack/BlurPass',
        'goo/passpack/DOFPass',
        'goo/passpack/DepthPass',
        'goo/passpack/DoGPass',
        'goo/passpack/MotionBlurPass',
        'goo/passpack/NesPass',
        'goo/passpack/PassLib',
        'goo/passpack/SSAOPass'
    ];
    __touch(15016);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(15017);
        Scripts.addClass(name, arguments[i]);
        __touch(15018);
    }
});
__touch(15014);
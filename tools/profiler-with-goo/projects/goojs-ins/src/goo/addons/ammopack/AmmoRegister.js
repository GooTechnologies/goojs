define([
    'goo/scripts/Scripts',
    'goo/addons/ammopack/AmmoSystem',
    'goo/addons/ammopack/AmmoComponent',
    'goo/addons/ammopack/calculateTriangleMeshShape'
], function (Scripts) {
    'use strict';
    __touch(105);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/ammopack/AmmoSystem',
        'goo/addons/ammopack/AmmoComponent',
        'goo/addons/ammopack/calculateTriangleMeshShape'
    ];
    __touch(106);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(107);
        Scripts.addClass(name, arguments[i]);
        __touch(108);
    }
});
__touch(104);
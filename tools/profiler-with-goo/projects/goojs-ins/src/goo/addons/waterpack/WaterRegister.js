define([
    'goo/scripts/Scripts',
    'goo/addons/waterpack/FlatWaterRenderer',
    'goo/addons/waterpack/ProjectedGridWaterRenderer'
], function (Scripts) {
    'use strict';
    __touch(2111);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/waterpack/FlatWaterRenderer',
        'goo/addons/waterpack/ProjectedGridWaterRenderer'
    ];
    __touch(2112);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(2113);
        Scripts.addClass(name, arguments[i]);
        __touch(2114);
    }
});
__touch(2110);
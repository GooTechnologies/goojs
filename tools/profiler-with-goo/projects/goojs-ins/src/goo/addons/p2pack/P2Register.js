define([
    'goo/scripts/Scripts',
    'goo/addons/p2pack/P2Component',
    'goo/addons/p2pack/P2System'
], function (Scripts) {
    'use strict';
    __touch(653);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/p2pack/P2Component',
        'goo/addons/p2pack/P2System'
    ];
    __touch(654);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(655);
        Scripts.addClass(name, arguments[i]);
        __touch(656);
    }
});
__touch(652);
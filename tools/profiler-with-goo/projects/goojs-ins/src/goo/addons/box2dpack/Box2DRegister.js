define([
    'goo/scripts/Scripts',
    'goo/addons/box2dpack/systems/Box2DSystem',
    'goo/addons/box2dpack/components/Box2DComponent'
], function (Scripts) {
    'use strict';
    __touch(162);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/box2dpack/systems/Box2DSystem',
        'goo/addons/box2dpack/components/Box2DComponent'
    ];
    __touch(163);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(164);
        Scripts.addClass(name, arguments[i]);
        __touch(165);
    }
});
__touch(161);
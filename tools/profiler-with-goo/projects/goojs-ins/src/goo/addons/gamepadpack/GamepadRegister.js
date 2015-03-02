define([
    'goo/scripts/Scripts',
    'goo/addons/gamepadpack/GamepadComponent',
    'goo/addons/gamepadpack/GamepadSystem',
    'goo/addons/gamepadpack/GamepadData'
], function (Scripts) {
    'use strict';
    __touch(561);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/gamepadpack/GamepadComponent',
        'goo/addons/gamepadpack/GamepadSystem',
        'goo/addons/gamepadpack/GamepadData'
    ];
    __touch(562);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(563);
        Scripts.addClass(name, arguments[i]);
        __touch(564);
    }
});
__touch(560);
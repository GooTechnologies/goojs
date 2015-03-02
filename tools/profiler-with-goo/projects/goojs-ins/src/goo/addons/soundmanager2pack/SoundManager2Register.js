define([
    'goo/scripts/Scripts',
    'goo/addons/soundmanager2pack/systems/SoundManager2System',
    'goo/addons/soundmanager2pack/components/SoundManager2Component'
], function (Scripts) {
    'use strict';
    __touch(693);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/soundmanager2pack/systems/SoundManager2System',
        'goo/addons/soundmanager2pack/components/SoundManager2Component'
    ];
    __touch(694);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(695);
        Scripts.addClass(name, arguments[i]);
        __touch(696);
    }
});
__touch(692);
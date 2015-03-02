define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(698);
    function SoundManager2Component(settings) {
        this.type = 'SoundManager2Component';
        __touch(704);
        this.settings = settings || {};
        __touch(705);
        this.sounds = {};
        __touch(706);
    }
    __touch(699);
    SoundManager2Component.prototype = Object.create(Component.prototype);
    __touch(700);
    SoundManager2Component.prototype.addSound = function (soundName, settings) {
        this.sounds[soundName] = settings;
        __touch(707);
    };
    __touch(701);
    SoundManager2Component.prototype.playSound = function (soundName) {
        this.sounds[soundName].soundObject.play();
        __touch(708);
    };
    __touch(702);
    return SoundManager2Component;
    __touch(703);
});
__touch(697);
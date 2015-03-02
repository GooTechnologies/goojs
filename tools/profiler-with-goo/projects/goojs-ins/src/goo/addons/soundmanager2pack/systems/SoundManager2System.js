define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(710);
    function SoundManager2System(settings) {
        System.call(this, 'SoundManager2System', [
            'SoundManager2Component',
            'TransformComponent'
        ]);
        __touch(717);
        settings = settings || {};
        __touch(718);
        this.isReady = false;
        __touch(719);
        if (!window.soundManager) {
            console.warn('SoundManager2System: soundManager global not found');
            __touch(720);
        } else {
            window.soundManager.bind(this).setup({
                url: 'swf',
                onready: function () {
                    this.isReady = true;
                    __touch(722);
                },
                ontimeout: function () {
                    console.warn('Failed to load soundmanager');
                    __touch(723);
                }
            });
            __touch(721);
        }
    }
    __touch(711);
    SoundManager2System.prototype = Object.create(System.prototype);
    __touch(712);
    SoundManager2System.prototype.inserted = function (entity) {
        var soundManagerComponent = entity.soundManager2Component;
        __touch(724);
        for (var i = 0; i < soundManagerComponent.sounds.length; i++) {
            var sound = soundManagerComponent.sounds[i];
            __touch(725);
            var soundObject = window.soundManager.createSound(sound);
            __touch(726);
            sound.soundObject = soundObject;
            __touch(727);
        }
    };
    __touch(713);
    SoundManager2System.prototype.deleted = function () {
    };
    __touch(714);
    SoundManager2System.prototype.process = function () {
    };
    __touch(715);
    return SoundManager2System;
    __touch(716);
});
__touch(709);
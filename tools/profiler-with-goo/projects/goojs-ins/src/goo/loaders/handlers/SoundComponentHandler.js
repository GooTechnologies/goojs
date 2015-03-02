define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/SoundComponent',
    'goo/sound/AudioContext',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ComponentHandler, SoundComponent, AudioContext, RSVP, PromiseUtil, _) {
    'use strict';
    __touch(9491);
    function SoundComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9501);
        this._type = 'SoundComponent';
        __touch(9502);
    }
    __touch(9492);
    SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9493);
    SoundComponentHandler.prototype.constructor = SoundComponentHandler;
    __touch(9494);
    ComponentHandler._registerClass('sound', SoundComponentHandler);
    __touch(9495);
    SoundComponentHandler.prototype._remove = function (entity) {
        var component = entity.soundComponent;
        __touch(9503);
        if (component && component.sounds) {
            var sounds = component.sounds;
            __touch(9504);
            for (var i = 0; i < sounds.length; i++) {
                sounds[i].stop();
                __touch(9505);
            }
        }
    };
    __touch(9496);
    SoundComponentHandler.prototype._prepare = function (config) {
        _.defaults(config, {
            volume: 1,
            reverb: 0
        });
        __touch(9506);
    };
    __touch(9497);
    SoundComponentHandler.prototype._create = function () {
        return new SoundComponent();
        __touch(9507);
    };
    __touch(9498);
    SoundComponentHandler.prototype.update = function (entity, config, options) {
        if (!AudioContext) {
            return PromiseUtil.resolve();
            __touch(9510);
        }
        var that = this;
        __touch(9508);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(9515);
            }
            component.updateConfig(config);
            __touch(9511);
            for (var i = 0; i < component.sounds.length; i++) {
                var sound = component.sounds[i];
                __touch(9516);
                if (!config.sounds[sound.id]) {
                    component.removeSound(sound);
                    __touch(9517);
                }
            }
            var promises = [];
            __touch(9512);
            _.forEach(config.sounds, function (soundCfg) {
                promises.push(that._load(soundCfg.soundRef, options));
                __touch(9518);
            }, null, 'sortValue');
            __touch(9513);
            return RSVP.all(promises).then(function (sounds) {
                for (var i = 0; i < sounds.length; i++) {
                    if (component.sounds.indexOf(sounds[i]) === -1) {
                        component.addSound(sounds[i]);
                        __touch(9520);
                    }
                }
                return component;
                __touch(9519);
            });
            __touch(9514);
        });
        __touch(9509);
    };
    __touch(9499);
    return SoundComponentHandler;
    __touch(9500);
});
__touch(9490);
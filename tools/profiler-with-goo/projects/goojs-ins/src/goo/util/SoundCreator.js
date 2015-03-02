define([
    'goo/renderer/Util',
    'goo/loaders/handlers/SoundHandler',
    'goo/util/Ajax',
    'goo/util/StringUtil'
], function (Util, SoundHandler, Ajax, StringUtil) {
    'use strict';
    __touch(22383);
    function SoundCreator() {
        var ajax = this.ajax = new Ajax();
        __touch(22388);
        this.soundHandler = new SoundHandler({}, function (ref, options) {
            return ajax.load(ref, options ? options.noCache : false);
            __touch(22390);
        }, function () {
        }, function (ref, options) {
            return ajax.load(ref, options ? options.noCache : false);
            __touch(22391);
        });
        __touch(22389);
    }
    __touch(22384);
    SoundCreator.prototype.clear = function () {
        this.ajax.clear();
        __touch(22392);
        this.soundHandler.clear();
        __touch(22393);
    };
    __touch(22385);
    SoundCreator.prototype.loadSound = function (url, settings, callback) {
        var id = StringUtil.createUniqueId('sound');
        __touch(22394);
        settings = settings || {};
        __touch(22395);
        settings.audioRefs = {};
        __touch(22396);
        var fileExtension = StringUtil.getAfterLast(url, '.');
        __touch(22397);
        settings.audioRefs[fileExtension] = url;
        __touch(22398);
        var sound = this.soundHandler._objects[id] = this.soundHandler._create();
        __touch(22399);
        this.soundHandler.update(id, settings, {}).then(function () {
            if (callback) {
                callback(sound);
                __touch(22402);
            }
        });
        __touch(22400);
        return sound;
        __touch(22401);
    };
    __touch(22386);
    return SoundCreator;
    __touch(22387);
});
__touch(22382);
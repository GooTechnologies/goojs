define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/sound/AudioContext',
    'goo/sound/Sound',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ConfigHandler, AudioContext, Sound, RSVP, PromiseUtil, _) {
    'use strict';
    __touch(9522);
    function SoundHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9532);
        this._audioCache = {};
        __touch(9533);
        if (window.Audio !== undefined) {
            var audioTest = new Audio();
            __touch(9534);
            this._codecs = [
                {
                    type: 'mp3',
                    enabled: !!audioTest.canPlayType('audio/mpeg;')
                },
                {
                    type: 'ogg',
                    enabled: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"')
                },
                {
                    type: 'wav',
                    enabled: !!audioTest.canPlayType('audio/wav; codecs="1"')
                }
            ];
            __touch(9535);
        } else {
            this._codecs = [];
            __touch(9536);
        }
    }
    __touch(9523);
    SoundHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9524);
    SoundHandler.prototype.constructor = SoundHandler;
    __touch(9525);
    ConfigHandler._registerClass('sound', SoundHandler);
    __touch(9526);
    SoundHandler.prototype._remove = function (ref) {
        var sound = this._objects[ref];
        __touch(9537);
        if (sound) {
            sound.stop();
            __touch(9539);
        }
        delete this._objects[ref];
        __touch(9538);
    };
    __touch(9527);
    SoundHandler.prototype._prepare = function (config) {
        _.defaults(config, {
            loop: false,
            audioRefs: {},
            volume: 1,
            name: 'A Sound'
        });
        __touch(9540);
    };
    __touch(9528);
    SoundHandler.prototype._create = function () {
        return new Sound();
        __touch(9541);
    };
    __touch(9529);
    SoundHandler.prototype._update = function (ref, config, options) {
        if (!AudioContext) {
            return PromiseUtil.resolve();
            __touch(9544);
        }
        var that = this;
        __touch(9542);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (sound) {
            if (!sound) {
                return;
                __touch(9548);
            }
            sound.update(config);
            __touch(9545);
            for (var i = 0; i < that._codecs.length; i++) {
                var codec = that._codecs[i];
                __touch(9549);
                var ref = config.audioRefs[codec.type];
                __touch(9550);
                if (ref && codec.enabled) {
                    if (that._audioCache[ref]) {
                        sound.setAudioBuffer(that._audioCache[ref]);
                        __touch(9551);
                        return sound;
                        __touch(9552);
                    } else {
                        return that.loadObject(ref).then(function (buffer) {
                            return PromiseUtil.createPromise(function (resolve, reject) {
                                AudioContext.decodeAudioData(buffer, function (audioBuffer) {
                                    resolve(audioBuffer);
                                    __touch(9556);
                                }, function () {
                                    console.error('Could not decode audio ' + ref);
                                    __touch(9557);
                                    resolve(null);
                                    __touch(9558);
                                });
                                __touch(9555);
                            });
                            __touch(9554);
                        }).then(function (audioBuffer) {
                            if (audioBuffer) {
                                that._audioCache[ref] = audioBuffer;
                                __touch(9560);
                                sound.setAudioBuffer(audioBuffer);
                                __touch(9561);
                            }
                            return sound;
                            __touch(9559);
                        });
                        __touch(9553);
                    }
                }
            }
            console.warn('No supported audioformat was found');
            __touch(9546);
            return sound;
            __touch(9547);
        });
        __touch(9543);
    };
    __touch(9530);
    return SoundHandler;
    __touch(9531);
});
__touch(9521);
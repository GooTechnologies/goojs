define([
    'goo/sound/AudioContext',
    'goo/math/MathUtils',
    'goo/util/rsvp'
], function (AudioContext, MathUtils, RSVP) {
    'use strict';
    __touch(21149);
    function Sound() {
        this.id = null;
        __touch(21165);
        this.name = null;
        __touch(21166);
        this._loop = false;
        __touch(21167);
        this._rate = 1;
        __touch(21168);
        this._offset = 0;
        __touch(21169);
        this._duration = null;
        __touch(21170);
        this._volume = 1;
        __touch(21171);
        this._buffer = null;
        __touch(21172);
        this._stream = null;
        __touch(21173);
        this._streamSource = null;
        __touch(21174);
        this._currentSource = null;
        __touch(21175);
        this._outNode = AudioContext.createGain();
        __touch(21176);
        this.connectTo();
        __touch(21177);
        this._playStart = 0;
        __touch(21178);
        this._pausePos = 0;
        __touch(21179);
        this._endPromise = null;
        __touch(21180);
        this._paused = false;
        __touch(21181);
    }
    __touch(21150);
    Sound.prototype.play = function () {
        if (this._currentSource) {
            return this._endPromise;
            __touch(21194);
        }
        this._endPromise = new RSVP.Promise();
        __touch(21182);
        if (!this._buffer || this._stream) {
            return this._endPromise;
            __touch(21195);
        }
        var currentSource = this._currentSource = AudioContext.createBufferSource();
        __touch(21183);
        this._paused = false;
        __touch(21184);
        this._currentSource.onended = function () {
            if (this._currentSource === currentSource && !this._paused) {
                this.stop();
                __touch(21196);
            }
        }.bind(this);
        __touch(21185);
        this._currentSource.playbackRate.value = this._rate;
        __touch(21186);
        this._currentSource.connect(this._outNode);
        __touch(21187);
        this._currentSource.buffer = this._buffer;
        __touch(21188);
        this._currentSource.loop = this._loop;
        __touch(21189);
        if (this._loop) {
            this._currentSource.loopStart = this._offset;
            __touch(21197);
            this._currentSource.loopEnd = this._duration + this._offset;
            __touch(21198);
        }
        this._playStart = AudioContext.currentTime - this._pausePos;
        __touch(21190);
        var duration = this._duration - this._pausePos;
        __touch(21191);
        this._currentSource.start(0, this._pausePos + this._offset, duration);
        __touch(21192);
        return this._endPromise;
        __touch(21193);
    };
    __touch(21151);
    Sound.prototype.pause = function () {
        if (!this._currentSource) {
            return;
            __touch(21203);
        }
        this._paused = true;
        __touch(21199);
        this._pausePos = (AudioContext.currentTime - this._playStart) % this._duration;
        __touch(21200);
        this._pausePos /= this._rate;
        __touch(21201);
        this._stop();
        __touch(21202);
    };
    __touch(21152);
    Sound.prototype.stop = function () {
        this._paused = false;
        __touch(21204);
        this._pausePos = 0;
        __touch(21205);
        if (this._endPromise) {
            this._endPromise.resolve();
            __touch(21206);
        }
        if (this._currentSource) {
            this._stop();
            __touch(21207);
        }
    };
    __touch(21153);
    Sound.prototype.fadeIn = function (time) {
        this.stop();
        __touch(21208);
        var volume = this._volume;
        __touch(21209);
        this._outNode.gain.value = 0;
        __touch(21210);
        var p = this.fade(volume, time);
        __touch(21211);
        this.play();
        __touch(21212);
        return p;
        __touch(21213);
    };
    __touch(21154);
    Sound.prototype.fadeOut = function (time) {
        return this.fade(0, time);
        __touch(21214);
    };
    __touch(21155);
    Sound.prototype.fade = function (volume, time) {
        this._outNode.gain.setValueAtTime(this._outNode.gain.value, AudioContext.currentTime);
        __touch(21215);
        this._outNode.gain.linearRampToValueAtTime(volume, AudioContext.currentTime + time);
        __touch(21216);
        var p = new RSVP.Promise();
        __touch(21217);
        setTimeout(function () {
            p.resolve();
            __touch(21220);
        }, time * 1000);
        __touch(21218);
        return p;
        __touch(21219);
    };
    __touch(21156);
    Sound.prototype.isPlaying = function () {
        return !!this._currentSource;
        __touch(21221);
    };
    __touch(21157);
    Sound.prototype._stop = function () {
        this._currentSource.stop(0);
        __touch(21222);
        this._currentSource = null;
        __touch(21223);
    };
    __touch(21158);
    Sound.prototype.update = function (config) {
        config = config || {};
        __touch(21224);
        if (config.id !== undefined) {
            this.id = config.id;
            __touch(21225);
        }
        if (config.name !== undefined) {
            this.name = config.name;
            __touch(21226);
        }
        if (config.loop !== undefined) {
            this._loop = !!config.loop;
            __touch(21227);
            if (this._currentSource) {
                this._currentSource.loop = this._loop;
                __touch(21228);
            }
        }
        if (config.volume !== undefined) {
            this._volume = MathUtils.clamp(config.volume, 0, 1);
            __touch(21229);
            this._outNode.gain.value = this._volume;
            __touch(21230);
        }
        if (config.offset !== undefined) {
            this._offset = config.offset;
            __touch(21231);
        }
        if (config.duration !== undefined) {
            this._duration = config.duration;
            __touch(21232);
        }
        if (config.timeScale !== undefined) {
            this._rate = config.timeScale;
            __touch(21233);
            if (this._currentSource) {
                this._currentSource.playbackRate.value = config.timeScale;
                __touch(21234);
            }
        }
        if (this._buffer) {
            this._clampInterval();
            __touch(21235);
        }
    };
    __touch(21159);
    Sound.prototype._clampInterval = function () {
        this._offset = Math.min(this._offset, this._buffer.duration);
        __touch(21236);
        if (this._duration !== null) {
            this._duration = Math.min(this._buffer.duration - this._offset, this._duration);
            __touch(21238);
        } else {
            this._duration = this._buffer.duration - this._offset;
            __touch(21239);
        }
        this._pausePos = MathUtils.clamp(this._pausePos, 0, this._duration);
        __touch(21237);
    };
    __touch(21160);
    Sound.prototype.connectTo = function (nodes) {
        this._outNode.disconnect();
        __touch(21240);
        if (!nodes) {
            return;
            __touch(21241);
        }
        if (!(nodes instanceof Array)) {
            nodes = [nodes];
            __touch(21242);
        }
        for (var i = 0; i < nodes.length; i++) {
            this._outNode.connect(nodes[i]);
            __touch(21243);
        }
    };
    __touch(21161);
    Sound.prototype.setAudioBuffer = function (buffer) {
        this.setAudioStream(null);
        __touch(21244);
        this._buffer = buffer;
        __touch(21245);
        this._clampInterval();
        __touch(21246);
    };
    __touch(21162);
    Sound.prototype.setAudioStream = function (stream) {
        if (!stream) {
            if (this._streamSource) {
                this._streamSource.disconnect();
                __touch(21252);
                this._streamSource = null;
                __touch(21253);
            }
            return;
            __touch(21251);
        }
        this.stop();
        __touch(21247);
        this._stream = stream;
        __touch(21248);
        this._streamSource = AudioContext.createMediaStreamSource(stream);
        __touch(21249);
        this._streamSource.connect(this._outNode);
        __touch(21250);
    };
    __touch(21163);
    return Sound;
    __touch(21164);
});
__touch(21148);
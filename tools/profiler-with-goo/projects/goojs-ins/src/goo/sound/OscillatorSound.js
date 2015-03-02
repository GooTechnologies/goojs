define([
    'goo/sound/AudioContext',
    'goo/math/MathUtils'
], function (AudioContext, MathUtils) {
    'use strict';
    __touch(21115);
    function OscillatorSound() {
        this.id = null;
        __touch(21123);
        this._volume = 1;
        __touch(21124);
        this._frequency = 440;
        __touch(21125);
        this._type = 'sine';
        __touch(21126);
        this._outNode = AudioContext.createGain();
        __touch(21127);
        this.connectTo();
        __touch(21128);
    }
    __touch(21116);
    OscillatorSound.prototype.stop = function () {
        this._oscNode.stop();
        __touch(21129);
        this._oscNode = null;
        __touch(21130);
    };
    __touch(21117);
    OscillatorSound.prototype.play = function () {
        this._oscNode = AudioContext.createOscillator();
        __touch(21131);
        this._oscNode.connect(this._outNode);
        __touch(21132);
        this._oscNode.frequency.value = this._frequency;
        __touch(21133);
        this._oscNode.type = this._type;
        __touch(21134);
        this._oscNode.start();
        __touch(21135);
    };
    __touch(21118);
    OscillatorSound.prototype.update = function (config) {
        if (config.volume !== undefined) {
            this._volume = MathUtils.clamp(config.volume, 0, 1);
            __touch(21136);
            this._outNode.gain.value = this._volume;
            __touch(21137);
        }
        if (config.frequency !== undefined) {
            this._frequency = config.frequency;
            __touch(21138);
            if (this._oscNode) {
                this._oscNode.frequency.value = this._frequency;
                __touch(21139);
            }
        }
        if (config.type !== undefined && OscillatorSound.TYPES.indexOf(config.type) !== -1) {
            this._type = config.type;
            __touch(21140);
            if (this._oscNode) {
                this._oscNode.type = this._type;
                __touch(21141);
            }
        }
    };
    __touch(21119);
    OscillatorSound.prototype.connectTo = function (nodes) {
        if (!AudioContext) {
            console.warn('Webaudio not supported');
            __touch(21143);
            return;
            __touch(21144);
        }
        this._outNode.disconnect();
        __touch(21142);
        if (!nodes) {
            return;
            __touch(21145);
        }
        if (!(nodes instanceof Array)) {
            nodes = [nodes];
            __touch(21146);
        }
        for (var i = 0; i < nodes.length; i++) {
            this._outNode.connect(nodes[i]);
            __touch(21147);
        }
    };
    __touch(21120);
    OscillatorSound.TYPES = [
        'sine',
        'square',
        'sawtooth',
        'triangle',
        'custom'
    ];
    __touch(21121);
    return OscillatorSound;
    __touch(21122);
});
__touch(21114);
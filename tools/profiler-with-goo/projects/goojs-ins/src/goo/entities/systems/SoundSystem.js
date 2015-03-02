define([
    'goo/entities/systems/System',
    'goo/sound/AudioContext',
    'goo/math/Vector3',
    'goo/math/MathUtils',
    'goo/entities/SystemBus',
    'goo/util/ObjectUtil',
    'goo/math/Matrix4x4'
], function (System, AudioContext, Vector3, MathUtils, SystemBus, _, Matrix4x4) {
    'use strict';
    __touch(5704);
    function SoundSystem() {
        if (!AudioContext) {
            console.warn('Cannot create soundsystem, webaudio not supported');
            __touch(5737);
            return;
            __touch(5738);
        }
        System.call(this, 'SoundSystem', [
            'SoundComponent',
            'TransformComponent'
        ]);
        __touch(5717);
        this.entities = [];
        __touch(5718);
        this._outNode = AudioContext.createGain();
        __touch(5719);
        this._outNode.connect(AudioContext.destination);
        __touch(5720);
        this._wetNode = AudioContext.createGain();
        __touch(5721);
        this._wetNode.connect(this._outNode);
        __touch(5722);
        this._convolver = AudioContext.createConvolver();
        __touch(5723);
        this._convolver.connect(this._wetNode);
        __touch(5724);
        this._listener = AudioContext.listener;
        __touch(5725);
        this._listener.dopplerFactor = 0;
        __touch(5726);
        this._relativeTransform = new Matrix4x4();
        __touch(5727);
        this._camera = null;
        __touch(5728);
        this._settings = {
            rolloffFactor: 0.4,
            maxDistance: 100
        };
        __touch(5729);
        this._wetNode.gain.value = 0.2;
        __touch(5730);
        this._pausedSounds = {};
        __touch(5731);
        this._listener.setPosition(0, 0, 0);
        __touch(5732);
        this._listener.setVelocity(0, 0, 0);
        __touch(5733);
        this._listener.setOrientation(0, 0, -1, 0, 1, 0);
        __touch(5734);
        var that = this;
        __touch(5735);
        SystemBus.addListener('goo.setCurrentCamera', function (camConfig) {
            that._camera = camConfig.camera;
            __touch(5739);
        });
        __touch(5736);
    }
    __touch(5705);
    SoundSystem.prototype = Object.create(System.prototype);
    __touch(5706);
    SoundSystem.prototype.constructor = SoundSystem;
    __touch(5707);
    SoundSystem.prototype.inserted = function (entity) {
        entity.soundComponent.connectTo({
            dry: this._outNode,
            wet: this._convolver
        });
        __touch(5740);
    };
    __touch(5708);
    SoundSystem.prototype.deleted = function (entity) {
        if (entity.soundComponent) {
            var sounds = entity.soundComponent.sounds;
            __touch(5741);
            for (var i = 0; i < sounds.length; i++) {
                sounds[i].stop();
                __touch(5743);
            }
            entity.soundComponent.connectTo();
            __touch(5742);
        }
    };
    __touch(5709);
    SoundSystem.prototype.updateConfig = function (config) {
        if (!AudioContext) {
            console.warn('Webaudio not supported');
            __touch(5745);
            return;
            __touch(5746);
        }
        _.extend(this._settings, config);
        __touch(5744);
        if (config.dopplerFactor !== undefined) {
            this._listener.dopplerFactor = config.dopplerFactor * 0.05;
            __touch(5747);
        }
        if (config.volume !== undefined) {
            this._outNode.gain.value = MathUtils.clamp(config.volume, 0, 1);
            __touch(5748);
        }
        if (config.reverb !== undefined) {
            this._wetNode.gain.value = MathUtils.clamp(config.reverb, 0, 1);
            __touch(5749);
        }
    };
    __touch(5710);
    SoundSystem.prototype.setReverb = function (audioBuffer) {
        if (!AudioContext) {
            console.warn('Webaudio not supported');
            __touch(5751);
            return;
            __touch(5752);
        }
        this._wetNode.disconnect();
        __touch(5750);
        if (!audioBuffer && this._wetNode) {
            this._convolver.buffer = null;
            __touch(5753);
        } else {
            this._convolver.buffer = audioBuffer;
            __touch(5754);
            this._wetNode.connect(this._outNode);
            __touch(5755);
        }
    };
    __touch(5711);
    SoundSystem.prototype.pause = function () {
        if (this._pausedSounds) {
            return;
            __touch(5757);
        }
        this._pausedSounds = {};
        __touch(5756);
        for (var i = 0; i < this.entities.length; i++) {
            var sounds = this.entities[i].soundComponent.sounds;
            __touch(5758);
            for (var j = 0; j < sounds.length; j++) {
                var sound = sounds[j];
                __touch(5759);
                if (sound.isPlaying()) {
                    sound.pause();
                    __touch(5760);
                    this._pausedSounds[sound.id] = true;
                    __touch(5761);
                }
            }
        }
    };
    __touch(5712);
    SoundSystem.prototype.stop = function () {
        for (var i = 0; i < this.entities.length; i++) {
            var sounds = this.entities[i].soundComponent.sounds;
            __touch(5763);
            for (var j = 0; j < sounds.length; j++) {
                var sound = sounds[j];
                __touch(5764);
                sound.stop();
                __touch(5765);
            }
        }
        this._pausedSounds = null;
        __touch(5762);
    };
    __touch(5713);
    SoundSystem.prototype.resume = function () {
        if (!this._pausedSounds) {
            return;
            __touch(5767);
        }
        for (var i = 0; i < this.entities.length; i++) {
            var sounds = this.entities[i].soundComponent.sounds;
            __touch(5768);
            for (var j = 0; j < sounds.length; j++) {
                var sound = sounds[j];
                __touch(5769);
                if (this._pausedSounds[sound.id]) {
                    sound.play();
                    __touch(5770);
                }
            }
        }
        this._pausedSounds = null;
        __touch(5766);
    };
    __touch(5714);
    SoundSystem.prototype.process = function (entities, tpf) {
        if (!AudioContext) {
            return;
            __touch(5774);
        }
        this.entities = entities;
        __touch(5771);
        var relativeTransform = this._relativeTransform;
        __touch(5772);
        var viewMat;
        __touch(5773);
        if (this._camera) {
            viewMat = this._camera.getViewMatrix();
            __touch(5775);
        }
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            __touch(5776);
            var component = e.soundComponent;
            __touch(5777);
            component._attachedToCamera = !!(e.cameraComponent && e.cameraComponent.camera === this._camera);
            __touch(5778);
            if (this._camera && !component._attachedToCamera) {
                Matrix4x4.combine(viewMat, e.transformComponent.worldTransform.matrix, relativeTransform);
                __touch(5779);
                component.process(this._settings, relativeTransform, tpf);
                __touch(5780);
            } else {
                component.process(this._settings, null, tpf);
                __touch(5781);
            }
        }
    };
    __touch(5715);
    return SoundSystem;
    __touch(5716);
});
__touch(5703);
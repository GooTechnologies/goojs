define([
    'goo/entities/components/Component',
    'goo/sound/AudioContext',
    'goo/math/Vector3',
    'goo/math/MathUtils'
], function (Component, AudioContext, Vector3, MathUtils) {
    'use strict';
    __touch(4948);
    function SoundComponent() {
        this.type = 'SoundComponent';
        __touch(4959);
        this.sounds = [];
        __touch(4960);
        this._isPanned = true;
        __touch(4961);
        this._outDryNode = AudioContext.createGain();
        __touch(4962);
        this._outWetNode = AudioContext.createGain();
        __touch(4963);
        this.connectTo();
        __touch(4964);
        this._pannerNode = AudioContext.createPanner();
        __touch(4965);
        this._pannerNode.connect(this._outDryNode);
        __touch(4966);
        this._inNode = AudioContext.createGain();
        __touch(4967);
        this._inNode.connect(this._pannerNode);
        __touch(4968);
        this._oldPosition = new Vector3();
        __touch(4969);
        this._position = new Vector3();
        __touch(4970);
        this._orientation = new Vector3();
        __touch(4971);
        this._velocity = new Vector3();
        __touch(4972);
        this._attachedToCamera = false;
        __touch(4973);
    }
    __touch(4949);
    SoundComponent.prototype = Object.create(Component.prototype);
    __touch(4950);
    SoundComponent.prototype.constructor = SoundComponent;
    __touch(4951);
    SoundComponent.prototype.addSound = function (sound) {
        if (this.sounds.indexOf(sound) === -1) {
            sound.connectTo([
                this._inNode,
                this._outWetNode
            ]);
            __touch(4974);
            this.sounds.push(sound);
            __touch(4975);
        }
    };
    __touch(4952);
    SoundComponent.prototype.removeSound = function (sound) {
        var idx = this.sounds.indexOf(sound);
        __touch(4976);
        if (idx > -1) {
            sound.stop();
            __touch(4977);
            this.sounds.splice(idx, 1);
            __touch(4978);
            sound.connectTo();
            __touch(4979);
        }
    };
    __touch(4953);
    SoundComponent.prototype.getSoundById = function (id) {
        for (var i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].id === id) {
                return this.sounds[i];
                __touch(4980);
            }
        }
    };
    __touch(4954);
    SoundComponent.prototype.connectTo = function (nodes) {
        this._outDryNode.disconnect();
        __touch(4981);
        this._outWetNode.disconnect();
        __touch(4982);
        if (nodes && nodes.dry) {
            this._outDryNode.connect(nodes.dry);
            __touch(4983);
        }
        if (nodes && nodes.wet) {
            this._outWetNode.connect(nodes.wet);
            __touch(4984);
        }
    };
    __touch(4955);
    SoundComponent.prototype.updateConfig = function (config) {
        if (config.volume !== undefined) {
            this._outDryNode.gain.value = MathUtils.clamp(config.volume, 0, 1);
            __touch(4985);
        }
        if (config.reverb !== undefined) {
            this._outWetNode.gain.value = MathUtils.clamp(config.reverb, 0, 1);
            __touch(4986);
        }
    };
    __touch(4956);
    SoundComponent.prototype.process = function (settings, mvMat, tpf) {
        this._pannerNode.rolloffFactor = settings.rolloffFactor;
        __touch(4987);
        this._pannerNode.maxDistance = settings.maxDistance;
        __touch(4988);
        if (this._attachedToCamera || !mvMat) {
            if (this._isPanned) {
                this._inNode.disconnect();
                __touch(5004);
                this._inNode.connect(this._outDryNode);
                __touch(5005);
                this._isPanned = false;
                __touch(5006);
            }
            this._pannerNode.setPosition(0, 0, 0);
            __touch(5000);
            this._pannerNode.setVelocity(0, 0, 0);
            __touch(5001);
            this._pannerNode.setOrientation(0, 0, 0);
            __touch(5002);
            return;
            __touch(5003);
        } else if (!this._isPanned) {
            this._inNode.disconnect();
            __touch(5007);
            this._inNode.connect(this._pannerNode);
            __touch(5008);
            this._isPanned = true;
            __touch(5009);
        }
        mvMat.getTranslation(this._position);
        __touch(4989);
        this._velocity.setv(this._position).subv(this._oldPosition).div(tpf);
        __touch(4990);
        this._oldPosition.setv(this._position);
        __touch(4991);
        this._orientation.setd(0, 0, -1);
        __touch(4992);
        mvMat.applyPostVector(this._orientation);
        __touch(4993);
        var pd = this._position.data;
        __touch(4994);
        this._pannerNode.setPosition(pd[0], pd[1], pd[2]);
        __touch(4995);
        var vd = this._velocity.data;
        __touch(4996);
        this._pannerNode.setVelocity(vd[0], vd[1], vd[2]);
        __touch(4997);
        var od = this._orientation.data;
        __touch(4998);
        this._pannerNode.setOrientation(od[0], od[1], od[2]);
        __touch(4999);
    };
    __touch(4957);
    return SoundComponent;
    __touch(4958);
});
__touch(4947);
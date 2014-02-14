define([
	'goo/entities/systems/System',
	'goo/sound/AudioContext',
	'goo/math/Vector3',
	'goo/entities/SystemBus',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	System,
	AudioContext,
	Vector3,
	SystemBus,
	_
) {
	'use strict';
	function SoundSystem(settings) {
		System.call(this, 'SoundSystem', ['SoundComponent', 'TransformComponent']);

		this.settings = settings || {};
		this.entities = [];
		this._outNode = AudioContext.createGain();
		this._outNode.connect(AudioContext.destination);
		this._wetNode = AudioContext.createGain();
		this._wetNode.connect(this._outNode);
		this._wetNode.gain.value = 0.2;
		this._convolver = AudioContext.createConvolver();
		this._convolver.connect(this._wetNode);

		this._listener = AudioContext.listener;

		this._position = new Vector3();
		this._oldPosition = new Vector3();
		this._velocity = new Vector3();
		this._orientation = new Vector3();

		this._camera = null;
		this._up = new Vector3();
		this._left = new Vector3();

		this._settings = {
			rolloffFactor: 0.4,
			maxDistance: 100
		};

		var that = this;
		SystemBus.addListener('goo.setCurrentCamera', function (camConfig) {
			that._camera = camConfig.camera;
		});
	}

	SoundSystem.prototype = Object.create(System.prototype);
	SoundSystem.prototype.constructor = SoundSystem;

	SoundSystem.prototype.inserted = function(entity) {
		entity.soundComponent.connectTo({
			dry: this._outNode,
			wet: this._convolver
		});
	};

	SoundSystem.prototype.deleted = function(entity) {
		if (entity.soundComponent) {
			var sounds = entity.soundComponent.sounds;
			for (var i = 0; i < sounds.length; i++) {
				sounds[i].stop();
			}
			entity.soundComponent.connectTo(this._outNode);
		}
	};

	SoundSystem.prototype.updateConfig = function(config) {
		_.extend(this._settings, config);
		if (config.dopplerFactor !== undefined) {
			this._listener.dopplerFactor = config.dopplerFactor;
		}
	};

	SoundSystem.prototype.setReverb = function(audioBuffer) {
		this._wetNode.disconnect();
		if(!audioBuffer && this._wetNode) {
			this._convolver.buffer = null;
		} else {
			this._convolver.buffer = audioBuffer;
			this._wetNode.connect(this._outNode);
		}
	};

	SoundSystem.prototype.process = function(entities, tpf) {
		this.entities = entities;
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].soundComponent;
			component.process(this._settings, entities[i].transformComponent.worldTransform, tpf);
		}
		if (this._camera) {
			var cam = this._camera;
			this._position.setv(cam.translation);
			this._velocity.setv(this._position).subv(this._oldPosition).div(tpf);
			this._oldPosition.setv(this._position);
			this._orientation.setv(cam._direction);
			this._up.setv(cam._up);
			this._left.setv(cam._left);
			var pd = this._position.data;
			this._listener.setPosition(pd[0], pd[1], pd[2]);
			var vd = this._velocity.data;
			this._listener.setVelocity(vd[0], vd[1], vd[2]);
			var od = this._orientation.data;
			var ud = this._up.data;
			this._listener.setOrientation(
				od[0], od[1], od[2],
				ud[0], ud[1], ud[2]
			);
		}
	};

	return SoundSystem;
});
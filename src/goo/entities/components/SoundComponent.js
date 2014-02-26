define([
	'goo/entities/components/Component',
	'goo/sound/AudioContext',
	'goo/math/Vector3',
	'goo/math/MathUtils'
],
/** @lends */
function(
	Component,
	AudioContext,
	Vector3,
	MathUtils
) {
	'use strict';
	function SoundComponent() {
		if (!AudioContext) {
			console.warn('Cannot create soundComponent, webaudio not supported');
			return;
		}
		this.type = "SoundComponent";
		this.sounds = [];
		this._outDryNode = AudioContext.createGain();
		this._outWetNode = AudioContext.createGain();
		this.connectTo();
		this._pannerNode = AudioContext.createPanner();

		this._pannerNode.connect(this._outDryNode);
		this._oldPosition = new Vector3();
		this._position = new Vector3();
		this._orientation = new Vector3();
		this._velocity = new Vector3();
	}
	SoundComponent.prototype = Object.create(Component.prototype);
	SoundComponent.prototype.constructor = SoundComponent;

	/**
	 * Add a sound to the component
	 * @param {Sound} sound
	 */
	SoundComponent.prototype.addSound = function(sound) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		if (this.sounds.indexOf(sound) === -1) {
			sound.connectTo([this._pannerNode, this._outWetNode]);
			this.sounds.push(sound);
		}
	};

	/**
	 * Remove sound from component
	 * @param {Sound} sound
	 */
	SoundComponent.prototype.removeSound = function(sound) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		var idx = this.sounds.indexOf(sound);
		if (idx > -1) {
			sound.stop();
			this.sounds.splice(idx, 1);
			sound.connectTo();
		}
	};

	/**
	 * Get a component's sound by id
	 * @param {string} id
	 * @returns {Sound}
	 */
	SoundComponent.prototype.getSoundById = function(id) {
		for (var i = 0; i < this.sounds.length; i++) {
			if (this.sounds[i].id === id) {
				return this.sounds[i];
			}
		}
	};

	/**
	 * Connect output of component to audionodes
	 * @param {object} [nodes]
	 * @param {AudioNode} [nodes.dry]
	 * @param {AudioNode} [nodes.wet]
	 */
	SoundComponent.prototype.connectTo = function(nodes) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		this._outDryNode.disconnect();
		this._outWetNode.disconnect();
		if (nodes && nodes.dry) {
			this._outDryNode.connect(nodes.dry);
		}
		if (nodes && nodes.wet) {
			this._outWetNode.connect(nodes.wet);
		}
	};

	/**
	 * Updates the component valueas according to config
	 * @param {object} [config]
	 * @param {number} config.volume
	 * @param {number} config.reverb
	 */
	SoundComponent.prototype.updateConfig = function(config) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		if (config.volume !== undefined) {
			this._outDryNode.gain.value = MathUtils.clamp(config.volume, 0, 1);
		}
		if (config.reverb !== undefined) {
			this._outWetNode.gain.value = MathUtils.clamp(config.reverb, 0, 1);
		}
	};

	/**
	 * Updates position, velocity and orientation of component and thereby all connected sounds
	 * @param {settings} See {@link SoundSystem}
	 * @param {Transform} the entity's world transform
	 * @param {number} tpf
	 * @private
	 */
	SoundComponent.prototype.process = function(settings, transform, tpf) {
		if (!AudioContext) {
			// Should never happen
			return;
		}
		this._pannerNode.rolloffFactor = settings.rolloffFactor;
		this._pannerNode.maxDistance = settings.maxDistance;

		var matrix = transform.matrix;
		matrix.getTranslation(this._position);
		this._velocity.setv(this._position).subv(this._oldPosition).div(tpf);
		this._oldPosition.setv(this._position);
		this._orientation.setd(0,0,-1);
		matrix.applyPostVector(this._orientation);

		var pd = this._position.data;
		this._pannerNode.setPosition(pd[0], pd[1], pd[2]);
		var vd = this._velocity.data;
		this._pannerNode.setVelocity(vd[0], vd[1], vd[2]);
		var od = this._orientation.data;
		this._pannerNode.setOrientation(od[0], od[1], od[2]);
	};

	return SoundComponent;
});
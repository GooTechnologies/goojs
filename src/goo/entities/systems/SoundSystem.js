import System from '../../entities/systems/System';
import AudioContext from '../../sound/AudioContext';
import MathUtils from '../../math/MathUtils';
import SystemBus from '../../entities/SystemBus';
import Matrix4 from '../../math/Matrix4';



	/**
	 * System responsible for sound.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Sound/Sound-vtest.html Working example
	 * @extends System
	 */
	function SoundSystem() {
		this._isSupported = AudioContext.isSupported();
		if (!this._isSupported) {
			console.warn('Cannot create SoundSystem, WebAudio not supported');
			return;
		}
		System.call(this, 'SoundSystem', ['SoundComponent', 'TransformComponent']);

		this.entities = [];
		this._relativeTransform = new Matrix4();

		this._pausedSounds = {};

		this.initialized = false;

		/**
		 * @type {number}
		 * @readonly
		 */
		this.rolloffFactor = 0.4;

		/**
		 * @type {number}
		 * @readonly
		 */
		this.maxDistance = 100;

		/**
		 * @type {number}
		 * @readonly
		 */
		this.dopplerFactor = 0.05;

		/**
		 * @type {number}
		 * @readonly
		 */
		this.volume = 1;

		/**
		 * @type {number}
		 * @readonly
		 */
		this.reverb = 0;

		/**
		 * The muted state. To mute or unmute, see the mute() and unmute() methods.
		 * @type {boolean}
		 * @readonly
		 */
		this.muted = false;

		this.reverbAudioBuffer = null;

		this._reverbDirty = true;
		this._dirty = true;
		this._camera = null;

		var that = this;
		SystemBus.addListener('goo.setCurrentCamera', function (camConfig) {
			that._camera = camConfig.camera;
		});

		this._scheduledUpdates = [];
	}

	SoundSystem.prototype = Object.create(System.prototype);
	SoundSystem.prototype.constructor = SoundSystem;

	SoundSystem.prototype._initializeAudioNodes = function () {
		this._outNode = AudioContext.getContext().createGain();
		this._outNode.connect(AudioContext.getContext().destination);

		this._wetNode = AudioContext.getContext().createGain();
		this._wetNode.connect(this._outNode);
		this._wetNode.gain.value = 0.2;

		this._convolver = AudioContext.getContext().createConvolver();
		this._convolver.connect(this._wetNode);

		this._listener = AudioContext.getContext().listener;
		this._listener.dopplerFactor = 0;

		// Everything is relative to the camera
		this._listener.setPosition(0, 0, 0);
		this._listener.setVelocity(0, 0, 0);
		this._listener.setOrientation(
			0, 0, -1, // Orientation
			0, 1, 0  // Up
		);

		this.initialized = true;
	};

	/**
	 * Connect sound components output nodes to sound system buses. Called by world.process()
	 * @param {Entity} entity
	 * @private
	 */
	SoundSystem.prototype.inserted = function (entity) {
		if (!this.initialized) { this._initializeAudioNodes(); }

		entity.soundComponent.connectTo({
			dry: this._outNode,
			wet: this._convolver
		});

		entity.soundComponent._system = this;
	};

	/**
	 * Be sure to stop all playing sounds when a component is removed. Called by world.process()
	 * Sometimes this has already been done by the loader
	 * @param {Entity} entity
	 * @private
	 */
	SoundSystem.prototype.deleted = function (entity) {
		if (entity.soundComponent) {
			var sounds = entity.soundComponent.sounds;
			for (var i = 0; i < sounds.length; i++) {
				sounds[i].stop();
			}
			entity.soundComponent.connectTo();
			entity.soundComponent._system = null;
		}
	};

	/**
	 * Update the environmental sound system properties. The settings are applied on the next process().
	 * @param {Object} [config]
	 * @param {number} [config.dopplerFactor] How much doppler effect the sound will get.
	 * @param {number} [config.rolloffFactor] How fast the sound fades with distance.
	 * @param {number} [config.maxDistance] After this distance, sound will keep its volume.
	 * @param {number} [config.volume] Will be clamped between 0 and 1.
	 * @param {number} [config.reverb] Will be clamped between 0 and 1.
	 * @param {boolean} [config.muted]
	 */
	SoundSystem.prototype.updateConfig = function (config) {
		config = config || {};

		if (config.maxDistance !== undefined) {
			this.maxDistance = config.maxDistance;
		}
		if (config.rolloffFactor !== undefined) {
			this.rolloffFactor = config.rolloffFactor;
		}
		if (config.dopplerFactor !== undefined) {
			this.dopplerFactor = config.dopplerFactor * 0.05; // 0.05 ??? I have no idea
		}
		if (config.volume !== undefined) {
			this.volume = MathUtils.clamp(config.volume, 0, 1);
		}
		if (config.reverb !== undefined) {
			this.reverb = MathUtils.clamp(config.reverb, 0, 1);
		}
		if (config.muted !== undefined) {
			this.muted = config.muted;
		}

		this._dirty = true;
	};

	/**
	 * Set the reverb impulse response. The settings are not applied immediately.
	 * @param {?AudioBuffer} [audioBuffer] if empty will also empty existing reverb
	 */
	SoundSystem.prototype.setReverb = function (audioBuffer) {
		this.reverbAudioBuffer = audioBuffer;
		this._reverbDirty = true;
	};

	/**
	 * Pause the sound system and thereby all sounds in the scene
	 */
	SoundSystem.prototype.pause = function () {
		if (this._pausedSounds) { return; }
		this._pausedSounds = {};
		for (var i = 0; i < this.entities.length; i++) {
			var sounds = this.entities[i].soundComponent.sounds;
			for (var j = 0; j < sounds.length; j++) {
				var sound = sounds[j];
				if (sound.isPlaying()) {
					sound.pause();
					this._pausedSounds[sound.id] = true;
				}
			}
		}
	};

	/**
	 * Mute all sounds.
	 */
	SoundSystem.prototype.mute = function () {
		this.muted = true;
		this._dirty = true;
	};

	/**
	 * Unmute all sounds.
	 */
	SoundSystem.prototype.unmute = function () {
		this.muted = false;
		this._dirty = true;
	};

	/**
	 * Resumes playing of all sounds that were paused
	 */
	SoundSystem.prototype.resume = function () {
		if (!this._pausedSounds) { return; }

		for (var i = 0; i < this.entities.length; i++) {
			var sounds = this.entities[i].soundComponent.sounds;
			for (var j = 0; j < sounds.length; j++) {
				var sound = sounds[j];
				if (this._pausedSounds[sound.id]) {
					sound.play();
				}
			}
		}
		this._pausedSounds = null;
	};

	/**
	 * Resumes playing of all sounds that were paused.
	 */
	SoundSystem.prototype.play = function() {
		this.resume();
		this.passive = false;
	};

	/**
	 * Stopping the sound system and all sounds in scene
	 */
	SoundSystem.prototype.stop = function () {
		for (var i = 0; i < this.entities.length; i++) {
			var sounds = this.entities[i].soundComponent.sounds;
			for (var j = 0; j < sounds.length; j++) {
				var sound = sounds[j];
				sound.stop();
			}
		}
		this._pausedSounds = null;
		this.passive = true;
	};

	SoundSystem.prototype.process = function (entities, tpf) {
		if (!this._isSupported || entities.length === 0) {
			return;
		}

		if (!this.initialized) {
			this._initializeAudioNodes();
		}

		if (this._reverbDirty) {
			this._wetNode.disconnect();
			if (!this.reverbAudioBuffer && this._wetNode) {
				this._convolver.buffer = null;
			} else {
				this._convolver.buffer = this.reverbAudioBuffer;
				this._wetNode.connect(this._outNode);
			}
			this._reverbDirty = false;
		}

		if (this._dirty) {
			this._listener.dopplerFactor = this.dopplerFactor;
			this._outNode.gain.value = this.muted ? 0 : this.volume;
			this._wetNode.gain.value = this.reverb;
			this._dirty = false;
		}

		this.entities = entities;
		var relativeTransform = this._relativeTransform;

		var viewMat;
		if (this._camera) {
			viewMat = this._camera.getViewMatrix();
		}

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			var component = e.soundComponent;

			component._attachedToCamera = !!(e.cameraComponent && e.cameraComponent.camera === this._camera);

			if (this._camera && !component._attachedToCamera) {
				// Give the transform relative to the camera
				relativeTransform.mul2(viewMat, e.transformComponent.worldTransform.matrix);
				component.process(this, relativeTransform, tpf);
			} else {
				// Component is attached to camera.
				component.process(this, null, tpf);
			}
		}
	};

	export default SoundSystem;
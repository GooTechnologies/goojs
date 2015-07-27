define([
	'goo/sound/AudioContext',
	'goo/math/MathUtils',
	'goo/util/rsvp'
], function (
	AudioContext,
	MathUtils,
	RSVP
) {
	'use strict';

	/**
	 * A representation of a sound in the engine
	 */
	function Sound() {
		/** @type {string}
		 */
		this.id = null;
		/** @type {string}
		 */
		this.name = null;
		this._loop = false;
		this._rate = 1.0;
		this._offset = 0;
		this._duration = null;
		this._volume = 1.0;

		// Nodes
		this._buffer = null;
		this._stream = null;
		this._streamSource = null;
		this._currentSource = null;
		this._outNode = AudioContext.getContext().createGain();
		this.connectTo();

		// Playback memory
		this._playStart = 0;
		this._pausePos = 0;
		//this._endTimer = null;
		this._endPromise = null;

		this._paused = false;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	/**
	 * Plays the sound if it's not playing
	 * @param {number} when Time in seconds according to [AudioContext.currentTime]{@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/currentTime} when sound should start to play.
	 * @returns {RSVP.Promise} Resolves when sound has played through or when it's stopped.
	 * Looping sounds will never resolve
	 */
	Sound.prototype.play = function (when) {
		when = when || 0;
		if (this._currentSource) {
			return this._endPromise;
		}
		this._endPromise = new RSVP.Promise(); //! AT: this needs refactoring
		if (!this._buffer || this._stream) {
			return this._endPromise;
		}

		var currentSource = this._currentSource = AudioContext.getContext().createBufferSource();

		this._paused = false;
		this._currentSource.onended = function () {
			if (this._currentSource === currentSource && !this._paused) {
				this.stop();
			}
		}.bind(this);

		this._currentSource.playbackRate.value = this._rate;
		this._currentSource.connect(this._outNode);
		this._currentSource.buffer = this._buffer;
		this._currentSource.loop = this._loop;
		if (this._loop) {
			this._currentSource.loopStart = this._offset;
			this._currentSource.loopEnd = this._duration + this._offset;
		}

		this._playStart = AudioContext.getContext().currentTime - this._pausePos;
		var duration = this._duration - this._pausePos;

		if (this._loop) {
			this._currentSource.start(when, this._pausePos + this._offset);
		} else {
			this._currentSource.start(when, this._pausePos + this._offset, duration);
		}

		return this._endPromise;
	};

	/**
	 * Pauses the sound if it's playing
	 */
	Sound.prototype.pause = function () {

		if (!this._currentSource) {
			return;
		}
		this._paused = true;

		this._pausePos = (AudioContext.getContext().currentTime - this._playStart) % this._duration;
		this._pausePos /= this._rate;
		this._stop();
	};

	/**
	 * Stops the sound if it's playing
	 */
	Sound.prototype.stop = function () {
		this._paused = false;
		this._pausePos = 0;
		if (this._endPromise) {
			this._endPromise.resolve();
		}
		if (this._currentSource) {
			this._stop();
		}
	};

	Sound.prototype.fadeIn = function (time) {
		this.stop();
		var volume = this._volume;
		this._outNode.gain.value = 0;
		var p = this.fade(volume, time);
		this.play();
		return p;
	};

	Sound.prototype.fadeOut = function (time) {
		return this.fade(0, time);
	};

	Sound.prototype.fade = function (volume, time) {
		this._outNode.gain.setValueAtTime(this._outNode.gain.value, AudioContext.getContext().currentTime);
		this._outNode.gain.linearRampToValueAtTime(volume, AudioContext.getContext().currentTime + time);
		var p = new RSVP.Promise();
		setTimeout(function () {
			p.resolve();
		}, time * 1000);
		return p;
	};

	Sound.prototype.isPlaying = function () {
		return !!this._currentSource;
	};

	/**
	 * Does the actual stopping of the sound
	 * @private
	 */
	Sound.prototype._stop = function () {
		this._currentSource.stop(0);
		this._currentSource = null;
	};

	/**
	 * Updates the sound according to config
	 * @param {Object} [config]
	 * @param {boolean} [config.loop]
	 * @param {number} [config.volume]
	 * @param {number} [config.name] The sound name
	 * @param {number} [config.start] Start offset in seconds.
	 * Will be clamped to be in actual soundclip duration
	 * @param {number} [config.duration] Duration of the sound.
	 * Will be clamped to be in actual soundclip duration
	 * @param {number} [config.timeScale] Playback rate of the sound
	 */
	Sound.prototype.update = function (config) {
		config = config || {};
		if (config.id !== undefined) {
			this.id = config.id;
		}
		if (config.name !== undefined) {
			this.name = config.name;
		}
		if (config.loop !== undefined) {
			this._loop = !!config.loop;
			if (this._currentSource) {
				this._currentSource.loop = this._loop;
			}
		}
		if (config.volume !== undefined) {
			this._volume = MathUtils.clamp(config.volume, 0, 1);
			this._outNode.gain.value = this._volume;
		}
		if (config.offset !== undefined) {
			this._offset = config.offset;
		}
		if (config.duration !== undefined) {
			this._duration = config.duration;
		}
		if (config.timeScale !== undefined) {
			this._rate = config.timeScale;
			//! AT: should have the same name if they are the same thing
			// problem is that there are plenty of projects out there that have timeScale instead of rate
			// timeScale was considered because it's the same as for animations
			// rate would have been preferred to timeScale as it's the term used by WebAudio
			if (this._currentSource) {
				this._currentSource.playbackRate.value = config.timeScale;
			}
		}
		if (this._buffer) {
			this._clampInterval();
		}
	};

	/**
	 * Clamps the start offset and duration to be in sound range
	 * @private
	 */
	Sound.prototype._clampInterval = function () {
		this._offset = Math.min(this._offset, this._buffer.duration);
		if (this._duration !== null) {
			this._duration = Math.min(this._buffer.duration - this._offset, this._duration);
		} else {
			this._duration = this._buffer.duration - this._offset;
		}
		this._pausePos = MathUtils.clamp(this._pausePos, 0, this._duration);
	};

	/**
	 * Connect output of sound to audionodes
	 * @param {(Array<AudioNode> | AudioNode)} nodes
	 */
	Sound.prototype.connectTo = function (nodes) {
		this._outNode.disconnect();
		if (!nodes) {
			return;
		}
		if (!(nodes instanceof Array)) {
			nodes = [nodes];
		}
		for (var i = 0; i < nodes.length; i++) {
			this._outNode.connect(nodes[i]);
		}
	};

	/**
	 * Sets the audio buffer which will be the sound source
	 * @param {AudioBuffer} buffer
	 */
	Sound.prototype.setAudioBuffer = function (buffer) {
		this.setAudioStream(null);
		this._buffer = buffer;
		this._clampInterval();
	};

	Sound.prototype.setAudioStream = function (stream) {
		if (!stream) {
			if (this._streamSource) {
				this._streamSource.disconnect();
				this._streamSource = null;
			}
			return;
		}
		this.stop();
		this._stream = stream;
		this._streamSource = AudioContext.getContext().createMediaStreamSource(stream);
		this._streamSource.connect(this._outNode);
	};

	return Sound;
});
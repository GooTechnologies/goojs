define([
	'goo/sound/AudioContext',
	'goo/math/MathUtils',
	'goo/util/rsvp'
],
/** @lends */
function (
	AudioContext,
	MathUtils,
	RSVP
) {
	'use strict';

	/**
	 * @class A representation of a sound in the engine
	 */
	function Sound() {
		if (!AudioContext) {
			console.warn('Cannot create sound, webaudio not supported');
			return;
		}
		// Settings
		this.id = null;
		this._loop = false;
		this._rate = 1.0;
		this._start = 0;
		this._duration = null;
		this._volume = 1.0;
		// Nodes
		this._buffer = null;
		this._currentSource = null;
		this._outNode = AudioContext.createGain();
		this.connectTo();
		// Playback memory
		this._playStart = 0;
		this._pausePos = 0;
		this._endTimer = null;
		this._endPromise = null;
	}

	/**
	 * Plays the sound if it's not playing
	 * @returns {RSVP.Promise} Resolves when sound has played through or when it's stopped.
	 * Looping sounds will never resolve
	 */
	Sound.prototype.play = function() {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		if (this._currentSource) {
			return this._endPromise;
		}
		this._endPromise = new RSVP.Promise();
		if (!this._buffer) {
			return this._endPromise;
		}

		this._currentSource = AudioContext.createBufferSource();
		this._currentSource.playbackRate.value = this._rate;
		this._currentSource.connect(this._outNode);
		this._currentSource.buffer = this._buffer;
		this._currentSource.loop = this._loop;
		if (this._loop) {
			this._currentSource.loopStart = this._start;
			this._currentSource.loopEnd = this._duration + this._start;
		}

		this._playStart = AudioContext.currentTime - this._pausePos;
		var duration = this._duration - this._pausePos;

		this._currentSource.start(0, this._pausePos + this._start, duration);

		this._fixTimer();
		return this._endPromise;
	};

	/**
	 * Pauses the sound if it's playing
	 */
	Sound.prototype.pause = function() {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		if (!this._currentSource) {
			return;
		}
		this._pausePos = (AudioContext.currentTime - this._playStart) % this._duration;
		this._pausePos /= this._rate;
		this._stop();
	};

	/**
	 * Stops the sound if it's playing
	 */
	Sound.prototype.stop = function() {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		if (!this._currentSource) {
			return;
		}
		this._pausePos = 0;
		this._endPromise.resolve();
		this._stop();
	};

	Sound.prototype.fadeIn = function(time) {
		this.stop();
		var volume = this._volume;
		this._outNode.gain.value = 0;
		var p = this.fade(volume, time);
		this.play();
		return p;
	};

	Sound.prototype.fadeOut = function(time) {
		return this.fade(0, time);
	};

	Sound.prototype.fade = function(volume, time) {
		this._outNode.gain.setValueAtTime(this._outNode.gain.value, AudioContext.currentTime);
		this._outNode.gain.linearRampToValueAtTime(volume, AudioContext.currentTime + time);
		var p = new RSVP.Promise();
		setTimeout(function() {
			p.resolve();
		}, time * 1000);
		return p;
	};

	/**
	 * Does the actual stopping of the sound
	 * @private
	 */
	Sound.prototype._stop = function() {
		this._currentSource.stop(0);
		this._currentSource = null;
		this._fixTimer();
	};

	/**
	 * Updates the sound according to config
	 * @param {object} [config]
	 * @param {boolean} [config.loop]
	 * @param {number} [config.volume]
	 * @param {number} [config.start] Start offset in seconds. 
	 * Will be clamped to be in actual soundclip duration
	 * @param {number} [config.duration] Duration of the sound.
	 * Will be clamped to be in actual soundclip duration
	 * @param {number} [config.timeScale] Playback rate of the sound
	 */
	Sound.prototype.update = function(config) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		config = config || {};
		if (config.id !== undefined) {
			this.id = config.id;
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
		if (config.start !== undefined) {
			this._start = config.start;
		}
		if (config.duration !== undefined) {
			this._duration = config.duration;
		}
		if (config.rate !== undefined) {
			this._rate = config.timeScale;
		}
		if (this._buffer) {
			this._clampInterval();
		}
		this._fixTimer();
	};

	/**
	 * Clamps the start offset and duration to be in sound range
	 * @private
	 */
	Sound.prototype._clampInterval = function() {
		this._start = Math.min(this._start, this._buffer.duration);
		if (this._duration !== null) {
			this._duration = Math.min(this._buffer.duration - this._start, this._duration);
		} else {
			this._duration = this._buffer.duration - this._start;
		}
		this._pausePos = MathUtils.clamp(this._pausePos, 0, this._duration);
	};

	/**
	 * Connect output of sound to audionodes
	 * @param {AudioNode[]|AudioNode} nodes
	 */
	Sound.prototype.connectTo = function(nodes) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
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
	 * Sets a timer to resolve play promise when sound has played through
	 * @private
	 */
	Sound.prototype._fixTimer = function() {
		var that = this;
		if (this._endTimer) {
			clearTimeout(this._endTimer);
		}
		if (this._currentSource && !this._loop) {
			var duration = this._duration - (AudioContext.currentTime - this._playStart) % this._duration;
			duration /= this._rate;
			this._endTimer = setTimeout(function() {
				that.stop();
			}, duration * 1000);
		}
	};

	/**
	 * Sets the audio buffer which will be the sound source
	 * @param {AudioBuffer} buffer
	 */
	Sound.prototype.setAudioBuffer = function(buffer) {
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return;
		}
		this._buffer = buffer;
		this._clampInterval();
	};

	return Sound;
});
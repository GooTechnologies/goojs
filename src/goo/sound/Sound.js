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
		// Settings
		this._loop = false;
		this._rate = 1.0;
		this._start = 0;
		this._duration = null;
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
	 *
	 */
	Sound.prototype.play = function() {
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
	 *
	 */
	Sound.prototype.pause = function() {
		if (!this._currentSource) {
			return;
		}
		this._pausePos = (AudioContext.currentTime - this._playStart) % this._duration;
		this._pausePos /= this._rate;
		this._stop();
	};

	/**
	 *
	 */
	Sound.prototype.stop = function() {
		if (!this._currentSource) {
			return;
		}
		this._pausePos = 0;
		this._endPromise.resolve();
		this._stop();
	};

	/*
	 *
	 */
	Sound.prototype._stop = function() {
		this._currentSource.stop(0);
		this._currentSource = null;
		this._fixTimer();
	};

	/**
	 *
	 */
	Sound.prototype.update = function(config) {
		if (config.loop !== undefined) {
			this._loop = !!config.loop;
			if (this._currentSource) {
				this._currentSource.loop = this._loop;
			}
		}
		if (config.volume !== undefined) {
			this._outNode.gain.value = config.volume;
		}
		if (config.start !== undefined) {
			this._start = config.start;
		}
		if (config.duration !== undefined) {
			this._duration = config.duration;
		}
		if (config.rate !== undefined) {
			this._rate = config.rate;
		}
		if (this._buffer) {
			this._clampInterval();
		}
		this._fixTimer();
	};

	Sound.prototype._clampInterval = function() {
		this._start = Math.min(this._start, this._buffer.duration);
		if (this._duration !== null) {
			this._duration = Math.min(this._buffer.duration - this._start, this._duration);
		} else {
			this._duration = this._buffer.duration - this._start;
		}
		this._pausePos = MathUtils.clamp(this._pausePos, 0, this._duration);
	};

	/*
	 *
	 */
	Sound.prototype.connectTo = function(nodes) {
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
	 *
	 */
	Sound.prototype.setAudioBuffer = function(buffer) {
		this._buffer = buffer;
		this._clampInterval();
	};


	return Sound;
});
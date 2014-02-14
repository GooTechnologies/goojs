define([
	'goo/sound/AudioContext',
	'goo/util/rsvp'
],
/** @lends */
function (
	AudioContext,
	RSVP
) {
	'use strict';

	/**
	 * @class A representation of a sound in the engine
	 */
	function Sound() {
		this._loop = false;
		this._buffer = null;
		// Nodes
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

		this._currentSource = AudioContext.createBufferSource();
		this._currentSource.connect(this._outNode);
		this._currentSource.buffer = this._buffer;
		this._currentSource.loop = this._loop;

		this._playStart = AudioContext.currentTime - this._pausePos;
		var duration = this._buffer.duration - this._pausePos;

		this._currentSource.start(0, this._pausePos, duration);

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
		this._pausePos = (AudioContext.currentTime - this._playStart) % this._buffer.duration;
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
			this._volume = config.volume;
		}
		this._fixTimer();
	};

	/*
	 *
	 */
	Sound.prototype.connectTo = function(node) {
		this._outNode.disconnect();
		this._outNode.connect(node || AudioContext.destination);
	};

	Sound.prototype._fixTimer = function() {
		var that = this;
		if (this._endTimer) {
			clearTimeout(this._endTimer);
		}
		if (this._currentSource && !this._loop) {
			var duration = this._buffer.duration - (AudioContext.currentTime - this._playStart) % this._buffer.duration;
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
	};


	return Sound;
});
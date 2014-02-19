define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/sound/AudioContext',
	'goo/sound/Sound',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ConfigHandler,
	AudioContext,
	Sound,
	RSVP,
	PromiseUtil,
	_
) {
	"use strict";
	/**
	 * @class Handler for loading sounds into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function SoundHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SoundHandler.prototype = Object.create(ConfigHandler.prototype);
	SoundHandler.prototype.constructor = SoundHandler;
	ConfigHandler._registerClass('sound', SoundHandler);

	/**
	 * Removes a sound
	 * @param {ref}
	 * @private
	 */
	SoundHandler.prototype._remove = function(ref) {
		var sound = this._objects[ref];
		if (sound) {
			sound.stop();
		}
		delete this._objects[ref];
	};

	/**
	 * Preparing sound config by populating it with defaults.
	 * @param {object} config
	 * @private
	 */
	SoundHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			loop: false,
			audioRefs: {},
			volume: 1.0,
			name: "A Sound"
		});
	};

	/**
	 * Creates an empty sound.
	 * @returns {Howl}
	 * @private
	 */
	SoundHandler.prototype._create = function() {
		return new Sound();
	};

	/**
	 * Adds/updates/removes a sound
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated sound or null if removed
	 */
	SoundHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(sound) {
			sound.update(config);
			return that.getConfig(config.audioRefs.wav).then(function(audioBuffer) {
				sound.setAudioBuffer(audioBuffer);

				return sound;
			});
		});
	};

	return SoundHandler;
});
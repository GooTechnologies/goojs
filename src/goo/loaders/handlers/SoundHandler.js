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

		if (window.Audio !== undefined) {
	    var audioTest = new Audio();
	    this._codecs = [
		    {
			    type: 'mp3',
			    enabled: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/,'')
		    }, {
			    type: 'ogg',
			    enabled: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'')
		    }, {
			    type: 'wav',
			    enabled: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/,'')
		    }
	    ];
		} else {
			this._codecs = [];
		}
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
		if (!AudioContext) {
			console.warn('Webaudio not supported');
			return PromiseUtil.createDummyPromise();
		}
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(sound) {
			sound.update(config);
			var ref;
			for (var i = 0; i < that._codecs.length; i++) {
				var codec = that._codecs[i];
				var ref = config.audioRefs[config.type];
				if (ref && codec.enabled) {
					/*jshint -W083 */
					return that.getConfig(ref).then(function(audioBuffer) {
						sound.setAudioBuffer(audioBuffer);
						return sound;
					});
				}
			}
			console.warn('No supported audioformat was found');
			return sound;
		});
	};

	return SoundHandler;
});
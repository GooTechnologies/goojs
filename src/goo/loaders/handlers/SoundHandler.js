define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ConfigHandler,
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
		var howl = new window.Howl({});
		howl._loaded = true;
		return howl;
	};

	/**
	 * Adds/updates/removes a sound
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated sound or null if removed
	 */
	 SoundHandler.prototype.update = function(ref, config, options) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		var that = this;

		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(sound) {
			if (!sound) { return; }
			// Settings
			sound.loop(config.loop);
			sound.volume(config.volume);
			// TODO Sprites
			// Audio files
			var promises = [];
			var formats = ['mp3', 'wav', 'ogg'];
			var mimeTypes = {
				mp3: 'audio/mpeg',
				wav: 'audio/vnd.wav',
				ogg: 'audio/ogg'
			};

			for (var i = 0; i < formats.length; i++) {
				var format = formats[i];
				var path = config.audioRefs[format];
				if (path) {
					promises.push(that.getConfig(path, options)
						// Howler doesn't support object urls, so this is wasted
						// .then(function(path){
						// 	if (typeof path === 'string')
						// 		return path;
						// 	else if (path instanceof ArrayBuffer) {
						// 		var mimeType = 'audio/mp3'
						// 		var blob = new Blob([path], {type:mimeTypes[format]});
						// 		return window.URL.createObjectURL(blob);
						// 	}
						// })
					);
				}
			}
			return RSVP.all(promises).then(function(paths) {
				if (isEqual(paths, sound._urls)) {
					return sound;
				}

				// Wait for howler to load
				var howlerLoaded = new RSVP.Promise();
				function onLoad() {
					howlerLoaded.resolve(sound);
					sound.off('load', onLoad);
					sound.off('loaderror', onError);
				}
				function onError() {
					howlerLoaded.reject('Error loading sound for ' + ref);
					sound.off('load', onLoad);
					sound.off('loaderror', onError);
				}
				sound.on('load', onLoad);
				sound.on('loaderror', onError);
				sound.urls(paths);

				return howlerLoaded;
			}).then(function(sound) {
				return sound;
			});
		});
	};

	function isEqual(a, b) {
		var len = a.length;
		if (len !== b.length) {
			return false;
		}
		while (len--) {
			if(a[len] !== b[len]) {
				return false;
			}
		}
		return true;
	}

	return SoundHandler;
});
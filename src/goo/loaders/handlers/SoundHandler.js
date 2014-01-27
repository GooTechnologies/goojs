define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	_
) {
	"use strict";

	function SoundHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SoundHandler.prototype = Object.create(ConfigHandler.prototype);
	SoundHandler.prototype.constructor = SoundHandler;
	ConfigHandler._registerClass('sound', SoundHandler);

	SoundHandler.prototype.remove = function(ref) {
		var sound = this._objects[ref];
		if (sound) {
			sound.stop();
		}
		delete this._objects[ref];
	};

	SoundHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			loop: false,
			audioRefs: [],
			volume: 1.0,
			name: "A Sound"
		});
	};

	SoundHandler.prototype._create = function() {
		var howl = new window.Howl({});
		howl._loaded = true;
		return howl;
	};

	SoundHandler.prototype.update = function(ref, config, options) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		var that = this;

		ConfigHandler.prototype.update.call(this, ref, config, options).then(function(sound) {
			sound.loop(config.loop);
			sound.volume(config.volume);
			var promises = [];
			_.forEach(config.audioRefs, function(ref) {
				promises.push(that.getConfig(ref));
			}, 'sortValue');
			RSVP.all(promises).then(function(paths) {
				if (isEqual(paths, sound._urls)) {
					return sound;
				}

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
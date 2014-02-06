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
	* @class
	*/
	function SoundHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	SoundHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('sound', SoundHandler);
	SoundHandler.prototype.constructor = SoundHandler;

	SoundHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			loop: false,
			urls: [],
			volume: 1.0,
			name: "A Sound"
		});
	};

	SoundHandler.prototype._create = function(ref) {
		var howl = new window.Howl({});
		howl._loaded = true;
		return this._objects[ref] = howl;
	};

	SoundHandler.prototype.update = function(ref, config) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		this._prepare(config);
		var object = this._objects[ref] || this._create(ref, config);

		var promises = [];
		for (var key in config) {
			if(key === 'urls') {
				continue;
			}
			if (object[key] instanceof Function) {
				object[key](config[key]);
			}
		}
		for (var i = 0; i < config.urls.length; i++) {
			promises.push(this.getConfig(config.urls[i]));
		}
		return RSVP.all(promises).then(function(urls) {
			if (!isEqual(urls, object._urls)) {
				var howlerLoaded = new RSVP.Promise();
				object.on('load', function() {
					howlerLoaded.resolve(object);
				});
				object.on('loaderror', function(e) {
					howlerLoaded.reject("Error loading sound for " + ref);
				});
				object.urls(urls);

				return howlerLoaded;
			}
			return object;
		});
	};

	SoundHandler.prototype.remove = function(ref) {
		if (this._objects[ref]) {
			this._objects[ref].stop();
		}
		delete this._objects[ref];
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
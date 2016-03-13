var SoundHandler = require('../loaders/handlers/SoundHandler');
var AudioContext = require('../sound/AudioContext');
var Ajax = require('../util/Ajax');
var StringUtils = require('../util/StringUtils');
var PromiseUtils = require('../util/PromiseUtils');



	/**
	 * Provides a simple way to load sounds
	 */
	function SoundCreator() {
		var ajax = this.ajax = new Ajax();

		this.soundHandler = new SoundHandler(
			{},
			function (ref, options) {
				return ajax.load(ref, options ? options.noCache : false);
			},
			function () {},
			function (ref, options) {
				return ajax.load(ref, options ? options.noCache : false);
			}
		);
	}

	/**
	 * Releases any references to cached objects
	 */
	SoundCreator.prototype.clear = function () {
		this.ajax.clear();
		this.soundHandler.clear();
	};

	/**
	 * Load a sound.
	 * @param  {string}   url
	 * @param  {Object}   settings
	 * @returns {RSVP.Promise}
	 */
	SoundCreator.prototype.loadSound = function (url, settings) {
		if (!AudioContext.isSupported()) {
			return PromiseUtils.reject(new Error('AudioContext is not supported!'));
		}

		var id = StringUtils.createUniqueId('sound');
		settings = settings || {};
		settings.audioRefs = {};

		var fileExtension = StringUtils.getAfterLast(url, '.');
		settings.audioRefs[fileExtension] = url;

		var sound = this.soundHandler._create();
		this.soundHandler._objects.set(id, sound);

		return this.soundHandler.update(id, settings, {});
	};

	module.exports = SoundCreator;

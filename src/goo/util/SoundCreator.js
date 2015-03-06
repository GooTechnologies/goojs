define([
	'goo/renderer/Util',
	'goo/loaders/handlers/SoundHandler',
	'goo/sound/AudioContext',
	'goo/util/Ajax',
	'goo/util/StringUtil'
], function (
	Util,
	SoundHandler,
	AudioContext,
	Ajax,
	StringUtil
) {
	'use strict';

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

	SoundCreator.prototype.loadSound = function (url, settings, callback) {
		if (!AudioContext.isSupported()) {
			return null;
		}

		var id = StringUtil.createUniqueId('sound');
		settings = settings || {};
		settings.audioRefs = {};

		var fileExtension = StringUtil.getAfterLast(url, '.');
		settings.audioRefs[fileExtension] = url;

		var sound = this.soundHandler._create();
		this.soundHandler._objects.set(id, sound);
		this.soundHandler.update(id, settings, {}).then(function() {
			if (callback) {
				callback(sound);
			}
		});
		return sound;
	};

	return SoundCreator;
});

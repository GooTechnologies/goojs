define([
	'goo/entities/components/Component'
],
/** @lends SoundManager2Component */
function(
	Component
) {
	"use strict";

	function SoundManager2Component(settings) {
		this.type = 'SoundManager2Component';

		this.settings = settings || {};

		// this.mass = settings.mass !== undefined ? settings.mass : 0;

		this.sounds = [];
	}

	SoundManager2Component.prototype = Object.create(Component.prototype);

	SoundManager2Component.prototype.playSound = function(sound) {
		this.sounds[sound].play();
	};

	SoundManager2Component.prototype.playSound = function(sound) {
		this.sounds[sound].play();
	};

	return SoundManager2Component;
});